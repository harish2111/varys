import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { geminiUsage, getDb, withOrg, withoutOrg } from '@varys/db';
import {
  GeminiTransport,
  LlmClient,
  type PricingTable,
  type ValidateUnitRequest,
  type ValidateUnitResponse,
  buildUnitValidationContents,
  chooseModel,
} from '@varys/llm-client';
import { getRedis } from '@varys/queue';
import { CONFIG, type AppConfig } from './config';
import { Governor, type ModelClass, estimateTokens } from './governor';

@Injectable()
export class LlmService implements OnModuleInit {
  private client!: LlmClient;
  private governor!: Governor;

  constructor(@Inject(CONFIG) private readonly config: AppConfig) {}

  onModuleInit(): void {
    const pricing: PricingTable = {
      flash: {
        inputPerM: this.config.PRICE_FLASH_INPUT_PER_M,
        cachedPerM: this.config.PRICE_FLASH_CACHED_PER_M,
        outputPerM: this.config.PRICE_FLASH_OUTPUT_PER_M,
      },
      pro: {
        inputPerM: this.config.PRICE_PRO_INPUT_PER_M,
        cachedPerM: this.config.PRICE_PRO_CACHED_PER_M,
        outputPerM: this.config.PRICE_PRO_OUTPUT_PER_M,
      },
      embed: { inputPerM: this.config.PRICE_EMBED_INPUT_PER_M },
    };
    this.client = new LlmClient(new GeminiTransport(this.config.GEMINI_API_KEY), pricing);
    this.governor = new Governor(getRedis(), {
      flash: { rpm: this.config.GOVERNOR_FLASH_RPM, tpm: this.config.GOVERNOR_FLASH_TPM },
      pro: { rpm: this.config.GOVERNOR_PRO_RPM, tpm: this.config.GOVERNOR_PRO_TPM },
      embed: { rpm: this.config.GOVERNOR_EMBED_RPM, tpm: this.config.GOVERNOR_EMBED_TPM },
      acquireTimeoutMs: this.config.GOVERNOR_ACQUIRE_TIMEOUT_MS,
    });
  }

  async validateUnit(req: ValidateUnitRequest): Promise<ValidateUnitResponse> {
    // Flash-first: only webhook-signature/crypto audits (securityCritical) escalate to Pro
    // up front; low-confidence escalation happens on re-validation (handled by the worker).
    const { model, escalated } = chooseModel(
      { securityCritical: req.securityCritical },
      {
        flashModel: this.config.GEMINI_MODEL_FLASH,
        proModel: this.config.GEMINI_MODEL_PRO,
        escalationConfidence: this.config.GEMINI_ESCALATION_CONFIDENCE,
      },
    );
    const contents = buildUnitValidationContents(req.unit, req.contract);
    await this.governor.acquire(modelClass(model), estimateTokens(contents));

    const result = await this.client.validateUnit(req.unit, req.contract, { model });
    await this.meter(req.orgId, req.runId, model, 'validation', result.usage, result.costUsd);

    return { findings: result.findings, model, costUsd: result.costUsd, usage: result.usage, escalated };
  }

  async embed(text: string, runId?: string, orgId?: string): Promise<{ embedding: number[] }> {
    await this.governor.acquire('embed', estimateTokens(text, 0));
    const result = await this.client.embed(text, {
      model: this.config.GEMINI_MODEL_EMBED,
      dim: this.config.GEMINI_EMBED_DIM,
    });
    if (orgId) await this.meter(orgId, runId, this.config.GEMINI_MODEL_EMBED, 'embedding', result.usage, result.costUsd);
    return { embedding: result.embedding };
  }

  private async meter(
    orgId: string,
    runId: string | undefined,
    model: string,
    operation: 'validation' | 'embedding' | 'rerank' | 'ingestion',
    usage: { inputTokens: number; cachedTokens: number; outputTokens: number },
    costUsd: number,
  ): Promise<void> {
    const db = getDb();
    const values = {
      orgId,
      runId: runId ?? null,
      model,
      operation,
      inputTokens: usage.inputTokens,
      cachedTokens: usage.cachedTokens,
      outputTokens: usage.outputTokens,
      costUsd: costUsd.toFixed(5),
    };
    try {
      await withOrg(orgId, (tx) => tx.insert(geminiUsage).values(values).execute(), db);
    } catch {
      // Cost metering must never fail a validation; record best-effort without org scope.
      await withoutOrg((tx) => tx.insert(geminiUsage).values(values).execute(), db).catch(() => undefined);
    }
  }
}

function modelClass(model: string): ModelClass {
  if (/pro/i.test(model)) return 'pro';
  if (/embedding/i.test(model)) return 'embed';
  return 'flash';
}

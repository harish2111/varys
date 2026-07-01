import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { geminiUsage, getDb, withOrg, withoutOrg } from '@varys/db';
import {
  GeminiTransport,
  LlmClient,
  type ConnectorRepairRequest,
  type ConnectorRepairResponse,
  type PricingTable,
  type RuntimeFailureAnalysisRequest,
  type RuntimeFailureAnalysisResponse,
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

  async analyzeFailure(req: RuntimeFailureAnalysisRequest): Promise<RuntimeFailureAnalysisResponse> {
    const model = this.config.GEMINI_MODEL_FLASH;
    const prompt = buildFailureAnalysisPrompt(req);
    await this.governor.acquire('flash', estimateTokens(prompt));

    const raw = await this.client.generateText(prompt, {
      model,
      responseSchema: FAILURE_ANALYSIS_SCHEMA,
    });
    await this.meter(req.orgId, req.runId, model, 'validation', raw.usage, raw.costUsd);

    try {
      const parsed = JSON.parse(raw.text) as RuntimeFailureAnalysisResponse;
      return parsed;
    } catch {
      return { analysis: raw.text, isRetryable: false };
    }
  }

  async repair(req: ConnectorRepairRequest): Promise<ConnectorRepairResponse> {
    const model = this.config.GEMINI_MODEL_FLASH;
    const prompt = buildRepairPrompt(req);
    await this.governor.acquire('flash', estimateTokens(prompt));
    const raw = await this.client.generateText(prompt, { model, responseSchema: REPAIR_SCHEMA });
    await this.meter(req.orgId, req.runId, model, 'validation', raw.usage, raw.costUsd);
    try {
      return JSON.parse(raw.text) as ConnectorRepairResponse;
    } catch {
      return { patch: '', explanation: raw.text, confidence: 0.5 };
    }
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

const FAILURE_ANALYSIS_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    analysis: { type: 'string' },
    rootCause: { type: 'string' },
    suggestedFix: { type: 'string' },
    isRetryable: { type: 'boolean' },
  },
  required: ['analysis', 'isRetryable'],
};

const REPAIR_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    patch: { type: 'string' },
    explanation: { type: 'string' },
    confidence: { type: 'number' },
  },
  required: ['patch', 'explanation', 'confidence'],
};

function buildRepairPrompt(req: ConnectorRepairRequest): string {
  return JSON.stringify({
    instruction: [
      'You are an expert iPaaS connector developer.',
      'A validation finding was raised for the connector element below.',
      'Produce a minimal, focused patch (unified diff format preferred) that fixes the finding.',
      'Also provide a clear explanation and a 0–1 confidence score.',
      'Output strictly the JSON matching the provided schema.',
    ].join(' '),
    element: { name: req.elementName, type: req.elementType },
    finding: req.finding,
    source: req.source,
  });
}

function buildFailureAnalysisPrompt(req: RuntimeFailureAnalysisRequest): string {
  return JSON.stringify({
    instruction: [
      'You are analyzing a runtime test failure for an iPaaS connector.',
      'Given the element name, type, any runtime error, and the captured HTTP request,',
      'diagnose the root cause and determine if regenerating the test payload would fix it.',
      'Output strictly the JSON matching the provided schema.',
    ].join(' '),
    element: { name: req.elementName, type: req.elementType },
    runtimeError: req.runtimeError ?? null,
    capturedRequest: req.capturedRequest ?? null,
    findingSummary: req.findingSummary ?? null,
  });
}

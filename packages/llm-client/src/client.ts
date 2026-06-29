import type { DocumentationContract, ExtractedUnit } from '@varys/contracts';
import {
  type PricingTable,
  computeEmbedCost,
  computeGenerateCost,
  pricingForModel,
} from './cost';
import {
  RERANK_RESPONSE_SCHEMA,
  UNIT_VALIDATION_RESPONSE_SCHEMA,
  UNIT_VALIDATION_SYSTEM,
  buildRerankContents,
  buildUnitValidationContents,
} from './prompts';
import type { LlmTransport, TokenUsage } from './types';

/** A raw finding as emitted by Gemini (spec §12.2 responseSchema). */
export interface RawLlmFinding {
  finding_type: 'SCHEMA_MISMATCH' | 'AUTH_MISMATCH' | 'TRANSFORMATION_ERROR';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  target_field?: string;
  explanation: string;
  confidence_score: number;
}

export interface ValidateResult {
  findings: RawLlmFinding[];
  usage: TokenUsage;
  costUsd: number;
  model: string;
}

export interface EmbedResult {
  embedding: number[];
  usage: TokenUsage;
  costUsd: number;
}

export interface RerankResult {
  order: number[];
  usage: TokenUsage;
  costUsd: number;
}

/** High-level model operations, used by the llm-gateway after the governor admits a call. */
export class LlmClient {
  constructor(
    private readonly transport: LlmTransport,
    private readonly pricing: PricingTable,
  ) {}

  async validateUnit(
    unit: ExtractedUnit,
    contract: DocumentationContract,
    opts: { model: string; cachedContentName?: string },
  ): Promise<ValidateResult> {
    const res = await this.transport.generate({
      model: opts.model,
      systemInstruction: UNIT_VALIDATION_SYSTEM,
      contents: buildUnitValidationContents(unit, contract),
      responseMimeType: 'application/json',
      responseSchema: UNIT_VALIDATION_RESPONSE_SCHEMA,
      cachedContentName: opts.cachedContentName,
      temperature: 0,
    });
    return {
      findings: parseFindings(res.text),
      usage: res.usage,
      costUsd: computeGenerateCost(pricingForModel(this.pricing, opts.model), res.usage),
      model: opts.model,
    };
  }

  async embed(text: string, opts: { model: string; dim: number }): Promise<EmbedResult> {
    const res = await this.transport.embed({ model: opts.model, text, dim: opts.dim });
    return {
      embedding: res.embedding,
      usage: res.usage,
      costUsd: computeEmbedCost(this.pricing.embed.inputPerM, res.usage),
    };
  }

  async rerank(
    query: string,
    chunks: { id: number; text: string }[],
    opts: { model: string },
  ): Promise<RerankResult> {
    const res = await this.transport.generate({
      model: opts.model,
      contents: buildRerankContents(query, chunks),
      responseMimeType: 'application/json',
      responseSchema: RERANK_RESPONSE_SCHEMA,
      temperature: 0,
    });
    let order: number[] = [];
    try {
      order = (JSON.parse(res.text).order ?? []).filter((n: unknown) => Number.isInteger(n));
    } catch {
      order = chunks.map((c) => c.id);
    }
    return {
      order,
      usage: res.usage,
      costUsd: computeGenerateCost(pricingForModel(this.pricing, opts.model), res.usage),
    };
  }
}

/** Parse the structured-output JSON into raw findings, tolerating minor model deviations. */
export function parseFindings(text: string): RawLlmFinding[] {
  try {
    const parsed = JSON.parse(text);
    const arr = Array.isArray(parsed) ? parsed : parsed.findings;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((f) => f && typeof f.explanation === 'string')
      .map((f) => ({
        finding_type: f.finding_type ?? 'SCHEMA_MISMATCH',
        severity: f.severity ?? 'WARNING',
        target_field: f.target_field,
        explanation: f.explanation,
        confidence_score: typeof f.confidence_score === 'number' ? f.confidence_score : 0.7,
      }));
  } catch {
    return [];
  }
}

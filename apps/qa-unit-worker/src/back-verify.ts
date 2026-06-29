import {
  CONFIDENCE,
  type DocumentationContract,
  type ExtractedUnit,
  type Finding,
  type LlmFindingType,
  Severity,
  llmFindingTypeToCategory,
} from '@varys/contracts';
import type { RawLlmFinding } from '@varys/llm-client';

/**
 * Back-verification (spec §7, §16) — the primary defence against hallucinated discrepancies.
 * An LLM finding is only admitted if its target field is traceable to the connector schema or
 * the documentation contract. Untraceable claims are discarded. Confidence is clamped to the
 * LLM-inferred band (0.7–0.8), so every LLM finding is routed to human review (< 0.85).
 */
export function backVerifyFinding(
  raw: RawLlmFinding,
  unit: ExtractedUnit,
  contract: DocumentationContract,
): Finding | null {
  if (raw.target_field) {
    if (!isTraceable(raw.target_field, unit, contract)) return null;
  }

  const confidence = clamp(raw.confidence_score, CONFIDENCE.LLM_INFERRED_MIN, CONFIDENCE.LLM_INFERRED_MAX);
  const severity = (Object.values(Severity) as string[]).includes(raw.severity)
    ? (raw.severity as Severity)
    : Severity.WARNING;

  return {
    ruleId: `llm.${raw.finding_type.toLowerCase()}`,
    severity,
    category: llmFindingTypeToCategory(raw.finding_type as LlmFindingType),
    confidence,
    source: 'llm',
    message: raw.explanation,
    targetPath: raw.target_field,
    hitl: confidence < CONFIDENCE.HITL_THRESHOLD,
    details: { modelConfidence: raw.confidence_score, findingType: raw.finding_type },
  };
}

export function backVerify(
  raws: RawLlmFinding[],
  unit: ExtractedUnit,
  contract: DocumentationContract,
): { admitted: Finding[]; discarded: number } {
  const admitted: Finding[] = [];
  let discarded = 0;
  for (const r of raws) {
    const f = backVerifyFinding(r, unit, contract);
    if (f) admitted.push(f);
    else discarded++;
  }
  return { admitted, discarded };
}

function isTraceable(field: string, unit: ExtractedUnit, contract: DocumentationContract): boolean {
  const norm = field.toLowerCase().split('.').pop() ?? field.toLowerCase();
  const inConnector = unit.inputFields.some((f) => f.name.toLowerCase() === norm) ||
    unit.outputFields.some((f) => f.name.toLowerCase() === norm);
  const inContract =
    (contract.requestFields ?? []).some((f) => f.name.toLowerCase() === norm) ||
    (contract.responseFields ?? []).some((f) => f.name.toLowerCase() === norm) ||
    (contract.requiredVariables ?? []).some((v) => v.toLowerCase() === norm) ||
    (contract.availableFields ?? []).some((v) => v.toLowerCase() === norm);
  return inConnector || inContract;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

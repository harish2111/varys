import type { FindingCategory, Severity } from './enums';

/** A single validation finding (deterministic, LLM, or runtime). */
export interface Finding {
  /** Stable rule identifier, e.g. "rest.method-mismatch" or "llm.schema-mismatch". */
  ruleId: string;
  severity: Severity;
  category: FindingCategory;
  /** 0..1 — see CONFIDENCE in enums. */
  confidence: number;
  /** Human-readable explanation. */
  message: string;
  /** JSON-path-like pointer to the offending field/param, when applicable. */
  targetPath?: string;
  /** Origin of the finding for provenance (spec §3). */
  source: 'deterministic' | 'llm' | 'runtime';
  /** Structured detail bag persisted to validation_findings.details. */
  details?: Record<string, unknown>;
  /** True when routed to human review (confidence < HITL threshold). */
  hitl?: boolean;
}

/** Findings produced for one unit, with the element it pertains to. */
export interface UnitFindings {
  elementKey: string;
  elementName: string;
  findings: Finding[];
  /** Whether a CRITICAL deterministic rule short-circuited the unit (no LLM spend). */
  shortCircuited: boolean;
}

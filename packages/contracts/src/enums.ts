/** Finding severity (spec §11). */
export enum Severity {
  CRITICAL = 'CRITICAL',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

/** Stored finding category (spec §14.2: validation_findings.category). */
export enum FindingCategory {
  SCHEMA = 'SCHEMA',
  PATH = 'PATH',
  AUTH = 'AUTH',
  PAGINATION = 'PAGINATION',
  TRANSFORMATION = 'TRANSFORMATION',
  RUNTIME = 'RUNTIME',
}

/** LLM-emitted finding type (spec §12.2 responseSchema enum), mapped onto a category. */
export enum LlmFindingType {
  SCHEMA_MISMATCH = 'SCHEMA_MISMATCH',
  AUTH_MISMATCH = 'AUTH_MISMATCH',
  TRANSFORMATION_ERROR = 'TRANSFORMATION_ERROR',
}

export function llmFindingTypeToCategory(t: LlmFindingType): FindingCategory {
  switch (t) {
    case LlmFindingType.SCHEMA_MISMATCH:
      return FindingCategory.SCHEMA;
    case LlmFindingType.AUTH_MISMATCH:
      return FindingCategory.AUTH;
    case LlmFindingType.TRANSFORMATION_ERROR:
      return FindingCategory.TRANSFORMATION;
  }
}

/** Connector element kind (spec §14.2: connector_elements.element_type). */
export enum ElementType {
  ACTION = 'ACTION',
  POLLING_TRIGGER = 'POLLING_TRIGGER',
  WEBHOOK_TRIGGER = 'WEBHOOK_TRIGGER',
}

/** The kind of API contract a unit is validated against. */
export enum ContractKind {
  REST = 'REST',
  GRAPHQL = 'GRAPHQL',
}

/** Lifecycle of a validation run. */
export enum RunStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  BLOCKED_CREDENTIALS = 'BLOCKED_CREDENTIALS',
}

/** Per-unit pipeline phase (spec §6). */
export enum RunPhase {
  ADMISSION = 'ADMISSION',
  STATIC_EXTRACTION = 'STATIC_EXTRACTION',
  DETERMINISTIC_GATE = 'DETERMINISTIC_GATE',
  RAG_RETRIEVAL = 'RAG_RETRIEVAL',
  LLM_VALIDATION = 'LLM_VALIDATION',
  RUNTIME = 'RUNTIME',
  AGGREGATE = 'AGGREGATE',
}

/** Confidence scores per the spec §7 confidence model. */
export const CONFIDENCE = {
  DETERMINISTIC: 1.0,
  EMBEDDING_MATCH: 0.9,
  LLM_INFERRED_MAX: 0.8,
  LLM_INFERRED_MIN: 0.7,
  /** Findings below this are routed to human-in-the-loop review. */
  HITL_THRESHOLD: 0.85,
} as const;

export enum AuthScheme {
  NONE = 'NONE',
  BEARER = 'BEARER',
  API_KEY_HEADER = 'API_KEY_HEADER',
  BASIC = 'BASIC',
  OAUTH2 = 'OAUTH2',
  CUSTOM = 'CUSTOM',
}

export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

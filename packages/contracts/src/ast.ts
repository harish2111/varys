import type { AuthScheme, ContractKind, ElementType, HttpMethod } from './enums';

/**
 * Normalized, provider-agnostic representation of a schema field, derived from the
 * Konnectify `Field` DSL (literal arrays) or from a `sample` object literal.
 */
export interface NormalizedField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'date_time' | 'array' | 'object';
  required: boolean;
  /** Element type for arrays. */
  of?: NormalizedField['type'];
  description?: string;
  /** Nested object/array fields when statically resolvable. */
  children?: NormalizedField[];
  /** Whether the type was inferred (e.g. from a sample) rather than declared. */
  inferred?: boolean;
}

/** A REST HTTP call extracted from an action's `execute` / trigger's `poll` body. */
export interface ExtractedHttpCall {
  method: HttpMethod;
  /** Base URL resolved from module-level constants (e.g. https://api.fathom.ai/external/v1). */
  baseUrl?: string;
  /** Path template with interpolations normalized to `{param}` form. */
  pathTemplate: string;
  /** Statically-known query parameter names. */
  queryParams: string[];
  /** Statically-known request header names. */
  headerNames: string[];
  /** Auth scheme inferred from header injection (Authorization: Bearer..., X-Api-Key, etc.). */
  authScheme: AuthScheme;
  /** Header name carrying the credential, when applicable. */
  authHeaderName?: string;
  /** Whether a request body is sent. */
  hasBody: boolean;
  /** Source location for provenance (line in the connector source). */
  sourceLine?: number;
}

/** A GraphQL operation extracted from a connector that posts to a single GraphQL endpoint. */
export interface ExtractedGraphqlOperation {
  operationType: 'query' | 'mutation' | 'subscription';
  operationName: string;
  /** Top-level selected root field (e.g. getTicketList). */
  rootField: string;
  /** Selected field paths within the operation (flattened, best-effort). */
  selectedFields: string[];
  /** Declared variable names (e.g. $input). */
  variables: string[];
  sourceLine?: number;
}

/** One validatable unit: a single action or trigger. */
export interface ExtractedUnit {
  /** Map key under app.actions / app.triggers. */
  key: string;
  id: string;
  name: string;
  title?: string;
  elementType: ElementType;
  /** DSL trigger sub-type when applicable: poll | static_webhook | webhook | streaming. */
  triggerType?: string;
  contractKind: ContractKind;
  inputFields: NormalizedField[];
  outputFields: NormalizedField[];
  /** Raw sample object literal, when present, used to derive output schema + runtime payloads. */
  outputSample?: Record<string, unknown>;
  httpCalls: ExtractedHttpCall[];
  graphqlOps: ExtractedGraphqlOperation[];
  /** SHA-256 of the unit's normalized AST (spec §0/§14.2 ast_hash). */
  astHash: string;
}

/** Connection-level auth, extracted from app.connection. */
export interface ExtractedConnection {
  authType: 'credentials' | 'oauth2' | 'client_credentials' | 'unknown';
  fieldNames: string[];
}

/** The full extraction result for a submitted connector. */
export interface ExtractedConnector {
  appId: string;
  name: string;
  version: string;
  /** Vendor namespace derived from app metadata (e.g. fathom-1.0.0). */
  namespace: string;
  baseUrls: string[];
  connection: ExtractedConnection;
  contractKind: ContractKind;
  units: ExtractedUnit[];
  /** Non-fatal diagnostics encountered during extraction (e.g. unresolved dynamic schema). */
  diagnostics: ExtractionDiagnostic[];
}

export interface ExtractionDiagnostic {
  level: 'info' | 'warning' | 'error';
  message: string;
  unitKey?: string;
  sourceLine?: number;
}

import type { AuthScheme, ContractKind, HttpMethod } from './enums';
import type { NormalizedField } from './ast';

/**
 * The documentation contract for a single endpoint operation — the "truth" a unit is
 * validated against. Produced by ingestion (spec §8) and stored as
 * api_document_chunks.raw_openapi_json. Supports both REST and GraphQL.
 */
export interface DocumentationContract {
  kind: ContractKind;
  vendor: string;
  apiVersion: string;
  resourceGroup: string;
  /** Human title, e.g. "Update Contact". */
  title: string;

  // --- REST ---
  method?: HttpMethod;
  /** Normalized path, with all params as `{param}`. */
  path?: string;
  requiredQueryParams?: string[];
  requestFields?: NormalizedField[];
  responseFields?: NormalizedField[];
  auth?: AuthScheme;
  authHeaderName?: string;

  // --- GraphQL ---
  operationType?: 'query' | 'mutation' | 'subscription';
  operationName?: string;
  /** Fields available on the operation's return type (from SDL). */
  availableFields?: string[];
  /** Required variable names for the operation. */
  requiredVariables?: string[];
}

/** A retrieved chunk handed to the validator (spec §9). */
export interface RetrievedChunk {
  chunkId: string;
  vendor: string;
  apiVersion: string;
  resourceGroup: string;
  httpMethod: string;
  endpointPath: string;
  content: string;
  contract?: DocumentationContract;
  /** Fused retrieval score (RRF / rerank). */
  score: number;
}

import type { ExtractedUnit } from './ast';

/** Trace context propagated across HTTP and BullMQ boundaries (spec §17). */
export interface TraceContext {
  traceId?: string;
  spanId?: string;
  traceparent?: string;
}

/** Job placed on the app queue (one per submitted connector). */
export interface AppJob {
  runId: string;
  orgId: string;
  source: string;
  namespace: string;
  deterministicOnly: boolean;
  runtime: boolean;
  live: boolean;
  /** Vendor sandbox credentials, only present for live runtime (in-memory transit only). */
  credentials?: Record<string, unknown>;
  trace?: TraceContext;
}

/** Job placed on the unit queue (one per surviving action/trigger). */
export interface UnitJob {
  runId: string;
  orgId: string;
  namespace: string;
  vendor: string;
  apiVersion: string;
  /** Persisted connector_elements id, for cache reuse and finding attribution. */
  elementId?: string;
  /** App grouping key for weighted-fair dequeue (spec §4.1). */
  appGroup: string;
  unit: ExtractedUnit;
  trace?: TraceContext;
}

/** Job placed on the runtime queue (runtime-eligible units). */
export interface RuntimeJob {
  runId: string;
  orgId: string;
  namespace: string;
  vendor: string;
  apiVersion: string;
  elementId?: string;
  /** Full connector source, transpiled + executed in the isolate. */
  source: string;
  unit: ExtractedUnit;
  live: boolean;
  credentials?: Record<string, unknown>;
  trace?: TraceContext;
}

/** Aggregation trigger: a unit's findings are ready to roll up. */
export interface AggregateJob {
  runId: string;
  orgId: string;
  elementKey: string;
  trace?: TraceContext;
}

/** Doc ingestion job (spec §8). Either an OpenAPI document, a GraphQL SDL, or a crawl root. */
export interface IngestionJob {
  orgId: string;
  namespace: string;
  vendor: string;
  apiVersion: string;
  /** REST | GRAPHQL */
  contractKind: 'REST' | 'GRAPHQL';
  /** Inline OpenAPI document (parsed JSON) to ingest deterministically. */
  openapi?: unknown;
  /** Inline GraphQL SDL to ingest. */
  graphqlSdl?: string;
  /** Crawl root (Playwright path) when no inline document is supplied. */
  rootUrl?: string;
  /** Domains permitted for live runtime egress (feeds the Squid allowlist). */
  allowedDomains?: string[];
  trace?: TraceContext;
}

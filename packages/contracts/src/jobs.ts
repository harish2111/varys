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
  trace?: TraceContext;
}

/** Job placed on the unit queue (one per surviving action/trigger). */
export interface UnitJob {
  runId: string;
  orgId: string;
  namespace: string;
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
  unit: ExtractedUnit;
  live: boolean;
  trace?: TraceContext;
}

/** Aggregation trigger: a unit's findings are ready to roll up. */
export interface AggregateJob {
  runId: string;
  orgId: string;
  elementKey: string;
  trace?: TraceContext;
}

/** Doc ingestion job. */
export interface IngestionJob {
  orgId: string;
  namespace: string;
  vendor: string;
  apiVersion: string;
  rootUrl: string;
  trace?: TraceContext;
}

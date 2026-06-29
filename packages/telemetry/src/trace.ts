import { context, propagation, trace } from '@opentelemetry/api';

export interface TraceCarrier {
  traceparent?: string;
  tracestate?: string;
}

/**
 * Capture the current trace context into a serializable carrier so it can ride along a
 * BullMQ job payload and be restored in the worker (spec §17 — trace context propagates
 * across HTTP and BullMQ boundaries).
 */
export function injectTrace(): TraceCarrier {
  const carrier: TraceCarrier = {};
  propagation.inject(context.active(), carrier);
  return carrier;
}

/** Run `fn` within the trace context carried by a job payload. */
export function runWithTrace<T>(carrier: TraceCarrier | undefined, fn: () => T): T {
  if (!carrier) return fn();
  const ctx = propagation.extract(context.active(), carrier);
  return context.with(ctx, fn);
}

export function currentTraceId(): string | undefined {
  return trace.getActiveSpan()?.spanContext().traceId;
}

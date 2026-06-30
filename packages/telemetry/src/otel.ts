import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

let sdk: NodeSDK | undefined;

/**
 * Bootstrap the OTel NodeSDK for a service (spec §17). Call this once at process startup
 * BEFORE any other imports so auto-instrumentation patches fs/http/pg etc. first.
 *
 * When OTEL_EXPORTER_OTLP_ENDPOINT is absent (local dev / test), the SDK still starts
 * but exports are silently dropped (ConsoleSpanExporter is not wired for prod noise).
 */
export function startTelemetry(opts: {
  serviceName: string;
  serviceVersion?: string;
}): void {
  if (sdk) return; // already started

  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  const namespace = process.env.OTEL_SERVICE_NAMESPACE ?? 'varys';

  const resource = Resource.default().merge(
    new Resource({
      [ATTR_SERVICE_NAME]: `${namespace}.${opts.serviceName}`,
      [ATTR_SERVICE_VERSION]: opts.serviceVersion ?? '1.0.0',
    }),
  );

  const traceExporter = endpoint
    ? new OTLPTraceExporter({ url: `${endpoint}/v1/traces` })
    : undefined;

  const metricReader = endpoint
    ? new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({ url: `${endpoint}/v1/metrics` }),
        exportIntervalMillis: 30_000,
      })
    : undefined;

  sdk = new NodeSDK({
    resource,
    traceExporter,
    metricReader,
  });

  sdk.start();

  process.on('SIGTERM', async () => {
    await sdk?.shutdown().catch(() => undefined);
  });
}

/** Graceful shutdown for tests — synchronous best-effort. */
export async function stopTelemetry(): Promise<void> {
  await sdk?.shutdown().catch(() => undefined);
  sdk = undefined;
}

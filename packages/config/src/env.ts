import { z } from 'zod';

/**
 * Single source of truth for environment configuration across every service.
 * Each service calls {@link loadConfig} at bootstrap; invalid/missing values fail fast
 * with a descriptive error rather than surfacing as a runtime fault later.
 */

const bool = z
  .string()
  .transform((v) => v === 'true' || v === '1')
  .pipe(z.boolean());

const int = (def?: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined || v === '' ? def : Number(v)))
    .pipe(z.number().int());

const num = (def?: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined || v === '' ? def : Number(v)))
    .pipe(z.number());

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_DIRECT_URL: z.string().url().optional(),
  DATABASE_POOL_MAX: int(10),

  // Redis
  REDIS_URL: z.string().url(),
  REDIS_CACHE_DB: int(1),

  // Auth
  JWT_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: int(3600),
  JWT_REFRESH_TTL: int(2592000),
  INTERNAL_SERVICE_SECRET: z.string().min(16),

  // Admission / concurrency
  APP_QUEUE_CONCURRENCY: int(10),
  UNIT_WORKER_CONCURRENCY: int(8),
  SANDBOX_WORKER_CONCURRENCY: int(4),

  // Gemini
  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL_FLASH: z.string().default('gemini-2.5-flash'),
  GEMINI_MODEL_PRO: z.string().default('gemini-2.5-pro'),
  GEMINI_MODEL_EMBED: z.string().default('gemini-embedding-001'),
  GEMINI_EMBED_DIM: int(768),
  GEMINI_ESCALATION_CONFIDENCE: num(0.85),

  // Governor token buckets
  GOVERNOR_FLASH_RPM: int(1000),
  GOVERNOR_FLASH_TPM: int(2000000),
  GOVERNOR_PRO_RPM: int(150),
  GOVERNOR_PRO_TPM: int(200000),
  GOVERNOR_EMBED_RPM: int(1500),
  GOVERNOR_EMBED_TPM: int(1000000),
  GOVERNOR_ACQUIRE_TIMEOUT_MS: int(60000),

  // Pricing (USD per 1M tokens)
  PRICE_FLASH_INPUT_PER_M: num(0.075),
  PRICE_FLASH_CACHED_PER_M: num(0.01875),
  PRICE_FLASH_OUTPUT_PER_M: num(0.3),
  PRICE_PRO_INPUT_PER_M: num(1.25),
  PRICE_PRO_CACHED_PER_M: num(0.3125),
  PRICE_PRO_OUTPUT_PER_M: num(10.0),
  PRICE_EMBED_INPUT_PER_M: num(0.15),

  // Retrieval
  RETRIEVAL_VECTOR_TOPK: int(25),
  RETRIEVAL_FTS_TOPK: int(25),
  RETRIEVAL_FINAL_TOPK: int(3),
  RETRIEVAL_RRF_K: int(60),
  RETRIEVAL_RERANK_ENABLED: bool.default('true'),
  RETRIEVAL_RERANK_MARGIN: num(0.15),

  // Object storage
  GCS_ENDPOINT: z.string().optional(),
  GCS_BUCKET: z.string().default('varys-artifacts'),
  GCS_ACCESS_KEY: z.string().optional(),
  GCS_SECRET_KEY: z.string().optional(),

  // Sandbox
  SANDBOX_MEMORY_MB: int(128),
  SANDBOX_CPU_TIMEOUT_MS: int(2000),
  SANDBOX_WALL_TIMEOUT_MS: int(10000),
  EGRESS_PROXY_URL: z.string().optional(),

  // Doc ingestion
  CRAWL_RATE_PER_SEC: int(5),
  CRAWL_MAX_DEPTH: int(3),
  CRAWL_PROXY_URL: z.string().optional(),

  // Observability
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
  OTEL_SERVICE_NAMESPACE: z.string().default('varys'),
  COST_DAILY_ALERT_SPIKE_PCT: num(15),

  // Ports
  GATEWAY_PORT: int(3000),
  LLM_GATEWAY_PORT: int(3001),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/**
 * Parse and validate process.env once. Subsequent calls return the cached value.
 * @throws if any required variable is missing or invalid.
 */
export function loadConfig(source: NodeJS.ProcessEnv = process.env): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/** Test-only: clear the cached config so a fresh environment can be parsed. */
export function resetConfigCache(): void {
  cached = undefined;
}

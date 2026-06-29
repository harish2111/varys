import type { Redis } from 'ioredis';

/**
 * Redis-backed token bucket with continuous refill (spec §4.2, §15). Atomic consume via a
 * Lua script so many gateway replicas share one global budget. Returns either success or the
 * milliseconds to wait before enough tokens will have refilled.
 */
const BUCKET_LUA = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_per_sec = tonumber(ARGV[2])
local now_ms = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(data[1])
local ts = tonumber(data[2])
if tokens == nil then tokens = capacity; ts = now_ms end

local elapsed = math.max(0, now_ms - ts) / 1000.0
tokens = math.min(capacity, tokens + elapsed * refill_per_sec)

if tokens >= requested then
  tokens = tokens - requested
  redis.call('HMSET', key, 'tokens', tokens, 'ts', now_ms)
  redis.call('PEXPIRE', key, 120000)
  return {1, 0}
else
  local deficit = requested - tokens
  local wait_ms = math.ceil((deficit / refill_per_sec) * 1000)
  redis.call('HMSET', key, 'tokens', tokens, 'ts', now_ms)
  redis.call('PEXPIRE', key, 120000)
  return {0, wait_ms}
end
`;

export interface BucketSpec {
  capacity: number;
  refillPerSec: number;
}

export class TokenBucket {
  constructor(
    private readonly redis: Redis,
    private readonly key: string,
    private readonly spec: BucketSpec,
  ) {}

  /** Try to consume tokens. Returns {ok, waitMs}. */
  async tryConsume(requested: number): Promise<{ ok: boolean; waitMs: number }> {
    const res = (await this.redis.eval(
      BUCKET_LUA,
      1,
      this.key,
      String(this.spec.capacity),
      String(this.spec.refillPerSec),
      String(Date.now()),
      String(Math.min(requested, this.spec.capacity)),
    )) as [number, number];
    return { ok: res[0] === 1, waitMs: res[1] };
  }
}

export type ModelClass = 'flash' | 'pro' | 'embed';

export interface GovernorBudgets {
  flash: { rpm: number; tpm: number };
  pro: { rpm: number; tpm: number };
  embed: { rpm: number; tpm: number };
  acquireTimeoutMs: number;
}

/**
 * Shapes all Gemini traffic to the project quota. A call is admitted only when BOTH the
 * request-per-minute and token-per-minute buckets have capacity (spec §4.2). Workers block
 * with backpressure rather than 429-storming.
 */
export class Governor {
  private readonly buckets: Record<ModelClass, { rpm: TokenBucket; tpm: TokenBucket }>;

  constructor(
    redis: Redis,
    private readonly budgets: GovernorBudgets,
  ) {
    const make = (cls: ModelClass, rpm: number, tpm: number) => ({
      rpm: new TokenBucket(redis, `gov:${cls}:rpm`, { capacity: rpm, refillPerSec: rpm / 60 }),
      tpm: new TokenBucket(redis, `gov:${cls}:tpm`, { capacity: tpm, refillPerSec: tpm / 60 }),
    });
    this.buckets = {
      flash: make('flash', budgets.flash.rpm, budgets.flash.tpm),
      pro: make('pro', budgets.pro.rpm, budgets.pro.tpm),
      embed: make('embed', budgets.embed.rpm, budgets.embed.tpm),
    };
  }

  /** Block until both buckets admit the call, or throw on timeout. */
  async acquire(cls: ModelClass, estimatedTokens: number): Promise<void> {
    const deadline = Date.now() + this.budgets.acquireTimeoutMs;
    const { rpm, tpm } = this.buckets[cls];
    for (;;) {
      const r = await rpm.tryConsume(1);
      if (r.ok) {
        const t = await tpm.tryConsume(estimatedTokens);
        if (t.ok) return;
        // Refund the RPM token would over-engineer; just wait on TPM (the binding constraint).
        await this.waitOrThrow(t.waitMs, deadline, cls);
        continue;
      }
      await this.waitOrThrow(r.waitMs, deadline, cls);
    }
  }

  private async waitOrThrow(waitMs: number, deadline: number, cls: ModelClass): Promise<void> {
    if (Date.now() + waitMs > deadline) {
      throw new Error(`Governor acquire timeout for ${cls} (would wait ${waitMs}ms)`);
    }
    await new Promise((r) => setTimeout(r, Math.max(25, Math.min(waitMs, 1000))));
  }
}

/** Rough token estimate for budgeting (spec §4.4 ~3k billed tokens/call with caching). */
export function estimateTokens(contents: string, outputBudget = 512): number {
  return Math.ceil(contents.length / 4) + outputBudget;
}

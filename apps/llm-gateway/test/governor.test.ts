import { Governor, TokenBucket, estimateTokens } from '../src/governor';

describe('estimateTokens', () => {
  it('approximates input tokens from content length plus output budget', () => {
    expect(estimateTokens('x'.repeat(400), 100)).toBe(200);
  });
});

describe('TokenBucket (mock redis)', () => {
  // A minimal fake redis implementing eval with the same refill/consume semantics.
  function fakeRedis() {
    const store = new Map<string, { tokens: number; ts: number }>();
    return {
      eval: async (_lua: string, _n: number, key: string, cap: string, refill: string, now: string, req: string) => {
        const capacity = Number(cap);
        const refillPerSec = Number(refill);
        const nowMs = Number(now);
        const requested = Number(req);
        const cur = store.get(key) ?? { tokens: capacity, ts: nowMs };
        const elapsed = Math.max(0, nowMs - cur.ts) / 1000;
        let tokens = Math.min(capacity, cur.tokens + elapsed * refillPerSec);
        if (tokens >= requested) {
          tokens -= requested;
          store.set(key, { tokens, ts: nowMs });
          return [1, 0];
        }
        const waitMs = Math.ceil(((requested - tokens) / refillPerSec) * 1000);
        store.set(key, { tokens, ts: nowMs });
        return [0, waitMs];
      },
    } as never;
  }

  it('admits within capacity and reports a wait when exhausted', async () => {
    const bucket = new TokenBucket(fakeRedis(), 'gov:test', { capacity: 5, refillPerSec: 1 });
    for (let i = 0; i < 5; i++) expect((await bucket.tryConsume(1)).ok).toBe(true);
    const denied = await bucket.tryConsume(1);
    expect(denied.ok).toBe(false);
    expect(denied.waitMs).toBeGreaterThan(0);
  });

  it('Governor.acquire admits a flash call under budget', async () => {
    const gov = new Governor(fakeRedis(), {
      flash: { rpm: 100, tpm: 100000 },
      pro: { rpm: 10, tpm: 10000 },
      embed: { rpm: 100, tpm: 100000 },
      acquireTimeoutMs: 1000,
    });
    await expect(gov.acquire('flash', 3000)).resolves.toBeUndefined();
  });
});

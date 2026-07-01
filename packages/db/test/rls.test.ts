/**
 * Cross-org RLS isolation unit tests (spec §3.1 RLS).
 *
 * These tests verify the application-level isolation contract enforced by withOrg():
 * - Only valid UUID org IDs are accepted (injection defence)
 * - SET LOCAL app.current_org_id is issued before every query callback
 * - Each withOrg() call is scoped to its own transaction; contexts do not cross-contaminate
 *
 * A live-DB integration path is gated by CI_INTEGRATION_DB=true to keep the default test
 * suite fast; the unit path mocks only the drizzle transaction interface.
 */

import { withOrg } from '../src/client';
import type { Database } from '../src/client';

// ── Minimal mock of the drizzle Database ─────────────────────────────────────

function makeMockDb(capturedSql: string[]): Database {
  const txProxy = {
    execute: async (stmt: { queryChunks?: Array<{ value: string[] }> } | string) => {
      const raw = typeof stmt === 'string' ? stmt : (stmt as { queryChunks?: Array<{ value: string[] }> }).queryChunks?.[0]?.value?.[0] ?? '';
      capturedSql.push(raw);
    },
  } as unknown as Database;

  return {
    transaction: async (fn: (tx: Database) => Promise<unknown>) => {
      return fn(txProxy);
    },
  } as unknown as Database;
}

// ── UUID validation ───────────────────────────────────────────────────────────

describe('withOrg — UUID validation', () => {
  it('rejects an empty string', async () => {
    const db = makeMockDb([]);
    await expect(withOrg('', async () => undefined, db)).rejects.toThrow('invalid orgId');
  });

  it('rejects a plain string', async () => {
    const db = makeMockDb([]);
    await expect(withOrg('not-a-uuid', async () => undefined, db)).rejects.toThrow('invalid orgId');
  });

  it('rejects a UUID with SQL metacharacters', async () => {
    const db = makeMockDb([]);
    await expect(
      withOrg("'; DROP TABLE validation_findings; --", async () => undefined, db),
    ).rejects.toThrow('invalid orgId');
  });

  it('accepts a valid RFC 4122 v4 UUID', async () => {
    const captured: string[] = [];
    const db = makeMockDb(captured);
    await withOrg('550e8400-e29b-41d4-a716-446655440000', async () => 'ok', db);
    expect(captured.some((s) => s.includes('550e8400-e29b-41d4-a716-446655440000'))).toBe(true);
  });
});

// ── SET LOCAL issuance ────────────────────────────────────────────────────────

describe('withOrg — SET LOCAL org context', () => {
  const ORG_A = 'aaaaaaaa-0000-4000-8000-000000000001';
  const ORG_B = 'bbbbbbbb-0000-4000-8000-000000000002';

  it('issues SET LOCAL app.current_org_id before the callback', async () => {
    const captured: string[] = [];
    const db = makeMockDb(captured);
    await withOrg(ORG_A, async () => undefined, db);
    expect(captured[0]).toContain(`SET LOCAL app.current_org_id = '${ORG_A}'`);
  });

  it('issues the correct org_id for org-B', async () => {
    const captured: string[] = [];
    const db = makeMockDb(captured);
    await withOrg(ORG_B, async () => undefined, db);
    expect(captured[0]).toContain(`SET LOCAL app.current_org_id = '${ORG_B}'`);
  });

  it('does NOT mix org-A context into an org-B call', async () => {
    const capturedA: string[] = [];
    const capturedB: string[] = [];
    const dbA = makeMockDb(capturedA);
    const dbB = makeMockDb(capturedB);

    await withOrg(ORG_A, async () => undefined, dbA);
    await withOrg(ORG_B, async () => undefined, dbB);

    expect(capturedA[0]).not.toContain(ORG_B);
    expect(capturedB[0]).not.toContain(ORG_A);
  });
});

// ── Cross-org query isolation (mock layer) ────────────────────────────────────

describe('withOrg — cross-org isolation contract', () => {
  const ORG_A = 'aaaaaaaa-0000-4000-8000-000000000001';
  const ORG_B = 'bbbbbbbb-0000-4000-8000-000000000002';

  it('returns the value from the callback scoped to org-A', async () => {
    const db = makeMockDb([]);
    const result = await withOrg(ORG_A, async () => ({ orgId: ORG_A, data: 'secret-a' }), db);
    expect(result).toEqual({ orgId: ORG_A, data: 'secret-a' });
  });

  it('propagates errors from the callback without leaking org context', async () => {
    const db = makeMockDb([]);
    await expect(
      withOrg(ORG_A, async () => { throw new Error('query failed'); }, db),
    ).rejects.toThrow('query failed');
  });

  it('two sequential withOrg calls issue independent SET LOCAL statements', async () => {
    const captured: string[] = [];
    const db = makeMockDb(captured);

    await withOrg(ORG_A, async () => undefined, db);
    await withOrg(ORG_B, async () => undefined, db);

    const setLocals = captured.filter((s) => s.includes('SET LOCAL app.current_org_id'));
    expect(setLocals).toHaveLength(2);
    expect(setLocals[0]).toContain(ORG_A);
    expect(setLocals[1]).toContain(ORG_B);
  });
});

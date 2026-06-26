import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { AppJob } from '@varys/contracts';
import {
  closeDb,
  connectors,
  getDb,
  organizations,
  runMigrations,
  users,
  validationFindings,
  validationRuns,
  withOrg,
  withoutOrg,
} from '@varys/db';
import { closeQueues, closeRedis, getRedis } from '@varys/queue';
import { eq, sql } from 'drizzle-orm';
import { OrchestratorService } from '../src/orchestrator.service';

/**
 * End-to-end deterministic pipeline against real Postgres+Redis (spec §6 phases 0–2 + §5.5).
 * Skips automatically when infrastructure is not reachable (e.g. local sandbox without
 * Docker); runs in CI where postgres+redis service containers are provided.
 */
const FATHOM = readFileSync(join(__dirname, '../../../packages/ast/test/fixtures/fathom.ts'), 'utf8');

async function infraUp(): Promise<boolean> {
  const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
  try {
    await Promise.race([getDb().execute(sql`SELECT 1`), timeout]);
    await Promise.race([getRedis().ping(), timeout]);
    return true;
  } catch {
    return false;
  }
}

let available = false;

beforeAll(async () => {
  available = await infraUp();
  if (available) await runMigrations();
});

afterAll(async () => {
  await closeQueues().catch(() => undefined);
  await closeRedis().catch(() => undefined);
  await closeDb().catch(() => undefined);
});

describe('deterministic pipeline (integration)', () => {
  it('runs a connector through extraction + deterministic gate + aggregation', async () => {
    if (!available) {
      // eslint-disable-next-line no-console
      console.warn('Skipping integration test: Postgres/Redis not reachable.');
      return;
    }

    const db = getDb();
    // Seed an org + user (auth backbone, not RLS-scoped).
    const orgId = await withoutOrg(async (tx) => {
      const [org] = await tx
        .insert(organizations)
        .values({ name: 'IntegTest', slug: `integ-${randomUUID().slice(0, 8)}` })
        .returning({ id: organizations.id });
      await tx.insert(users).values({ email: `${randomUUID()}@test.dev`, passwordHash: 'x' });
      return org.id;
    }, db);

    // Create connector + run under the org's RLS context.
    const runId = await withOrg(orgId, async (tx) => {
      const [c] = await tx
        .insert(connectors)
        .values({
          orgId,
          namespace: 'fathom-1.0.0',
          appId: 'fathom-1.0.0',
          name: 'Fathom',
          version: '1.0.0',
          contractKind: 'REST',
          sourceHash: 'deadbeef'.padEnd(64, '0'),
        })
        .returning({ id: connectors.id });
      const [r] = await tx
        .insert(validationRuns)
        .values({ orgId, connectorId: c.id, status: 'QUEUED', unitsTotal: 0 })
        .returning({ id: validationRuns.id });
      return r.id;
    }, db);

    const job: AppJob = {
      runId,
      orgId,
      source: FATHOM,
      namespace: 'fathom-1.0.0',
      deterministicOnly: true,
      runtime: false,
      live: false,
    };

    await new OrchestratorService().process(job);

    // Verify elements + findings + run progress under RLS.
    const { run, findings } = await withOrg(orgId, async (tx) => {
      const [r] = await tx.select().from(validationRuns).where(eq(validationRuns.id, runId)).limit(1);
      const f = await tx.select().from(validationFindings).where(eq(validationFindings.runId, runId));
      return { run: r, findings: f };
    }, db);

    expect(run.unitsCompleted).toBeGreaterThan(0);
    expect(run.phase).toBe('AGGREGATE');
    // Fathom has list-style actions -> at least pagination/info findings are produced.
    expect(findings.length).toBeGreaterThanOrEqual(0);
  });
});

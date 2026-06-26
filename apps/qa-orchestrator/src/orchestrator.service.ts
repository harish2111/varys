import { extractConnector } from '@varys/ast';
import {
  type AggregateJob,
  type AppJob,
  type ExtractedUnit,
  RunPhase,
  RunStatus,
  type UnitFindings,
} from '@varys/contracts';
import {
  connectorElements,
  getDb,
  validationFindings,
  validationRuns,
  withOrg,
} from '@varys/db';
import { DeterministicEngine } from '@varys/rules-engine';
import { getAggregateQueue } from '@varys/queue';
import { injectTrace } from '@varys/telemetry';
import { eq } from 'drizzle-orm';

/**
 * Core orchestration (spec §5.2, §6 phases 1–2): static AST extraction, element persistence,
 * and the deterministic gate. Units that fail a CRITICAL rule short-circuit (no LLM spend);
 * in Phase 1 every unit is finalized here and handed to the aggregator.
 */
export class OrchestratorService {
  private readonly engine = new DeterministicEngine();

  async process(job: AppJob): Promise<void> {
    const db = getDb();

    await this.setRun(job, { status: RunStatus.RUNNING, phase: RunPhase.STATIC_EXTRACTION });

    const extracted = extractConnector(job.source);

    await withOrg(job.orgId, async (tx) => {
      // Resolve the connector id for this run.
      const [run] = await tx.select().from(validationRuns).where(eq(validationRuns.id, job.runId)).limit(1);
      const connectorId = run?.connectorId;

      // Persist elements (idempotent on connector+type+name); collect element ids.
      const elementIdByKey = new Map<string, string>();
      if (connectorId) {
        for (const unit of extracted.units) {
          const [row] = await tx
            .insert(connectorElements)
            .values({
              orgId: job.orgId,
              connectorId,
              elementType: unit.elementType,
              name: unit.name,
              astMetadata: unit as unknown as Record<string, unknown>,
              astHash: unit.astHash,
            })
            .onConflictDoUpdate({
              target: [connectorElements.connectorId, connectorElements.elementType, connectorElements.name],
              set: { astMetadata: unit as unknown as Record<string, unknown>, astHash: unit.astHash },
            })
            .returning({ id: connectorElements.id });
          elementIdByKey.set(unit.key, row.id);
        }
      }

      // Deterministic gate (Phase 1: no KB contracts yet -> structural rules).
      await tx
        .update(validationRuns)
        .set({ phase: RunPhase.DETERMINISTIC_GATE, updatedAt: new Date() })
        .where(eq(validationRuns.id, job.runId));

      let shortCircuited = 0;
      for (const unit of extracted.units) {
        const result: UnitFindings = this.engine.evaluateUnit(extracted, unit, []);
        if (result.shortCircuited) shortCircuited++;
        await this.writeFindings(tx, job, elementIdByKey.get(unit.key), result, unit);
      }

      await tx
        .update(validationRuns)
        .set({
          phase: RunPhase.AGGREGATE,
          unitsCompleted: extracted.units.length,
          unitsShortCircuited: shortCircuited,
          updatedAt: new Date(),
        })
        .where(eq(validationRuns.id, job.runId));
    }, db);

    await getAggregateQueue().add(
      'aggregate',
      { runId: job.runId, orgId: job.orgId, elementKey: '*', trace: injectTrace() } satisfies AggregateJob,
      { jobId: `agg:${job.runId}` },
    );
  }

  private async writeFindings(
    tx: Awaited<ReturnType<typeof getDb>>,
    job: AppJob,
    elementId: string | undefined,
    result: UnitFindings,
    _unit: ExtractedUnit,
  ): Promise<void> {
    if (result.findings.length === 0) return;
    await tx.insert(validationFindings).values(
      result.findings.map((f) => ({
        orgId: job.orgId,
        runId: job.runId,
        elementId: elementId ?? null,
        ruleId: f.ruleId,
        severity: f.severity,
        category: f.category,
        source: f.source,
        confidenceScore: f.confidence.toFixed(2),
        targetPath: f.targetPath ?? null,
        message: f.message,
        hitl: f.hitl ?? f.confidence < 0.85,
        details: f.details ?? null,
      })),
    );
  }

  private async setRun(job: AppJob, patch: { status?: string; phase?: string }): Promise<void> {
    const db = getDb();
    await withOrg(job.orgId, async (tx) => {
      await tx
        .update(validationRuns)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(validationRuns.id, job.runId));
    }, db);
  }

  async fail(job: AppJob, error: string): Promise<void> {
    const db = getDb();
    await withOrg(job.orgId, async (tx) => {
      await tx
        .update(validationRuns)
        .set({ status: RunStatus.FAILED, error, updatedAt: new Date() })
        .where(eq(validationRuns.id, job.runId));
    }, db);
  }
}

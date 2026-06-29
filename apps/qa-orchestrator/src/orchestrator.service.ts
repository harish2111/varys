import { extractConnector } from '@varys/ast';
import {
  type AppJob,
  type ExtractedUnit,
  RunPhase,
  RunStatus,
  type RuntimeJob,
  type UnitFindings,
  type UnitJob,
} from '@varys/contracts';
import { connectorElements, getDb, validationFindings, validationRuns, withOrg } from '@varys/db';
import { AuthPresenceRule, DeterministicEngine, PaginationHintRule, UnitHasOperationRule } from '@varys/rules-engine';
import { enqueueRuntimeJobs, enqueueUnitsFair, getAggregateQueue } from '@varys/queue';
import { injectTrace } from '@varys/telemetry';
import { eq } from 'drizzle-orm';
import type { Database } from '@varys/db';

/**
 * Core orchestration (spec §5.2, §6 phases 0–2): static AST extraction, element persistence,
 * and the *structural* deterministic gate (contract-dependent rules run in the unit worker
 * after retrieval). CRITICAL structural failures short-circuit (no LLM spend). Surviving units
 * are fanned out to the unit queue with weighted-fair interleaving (spec §4.1).
 */
export class OrchestratorService {
  // Structural rules only here; contract rules require a retrieved contract (unit worker).
  private readonly engine = new DeterministicEngine([
    new UnitHasOperationRule(),
    new AuthPresenceRule(),
    new PaginationHintRule(),
  ]);

  async process(job: AppJob): Promise<void> {
    const db = getDb();
    await this.setRun(job, { status: RunStatus.RUNNING, phase: RunPhase.STATIC_EXTRACTION });

    const extracted = extractConnector(job.source);
    const { vendor, apiVersion } = splitNamespace(job.namespace, extracted.version);

    const result = await withOrg(job.orgId, async (tx) => {
      const [run] = await tx.select().from(validationRuns).where(eq(validationRuns.id, job.runId)).limit(1);
      const connectorId = run?.connectorId ?? undefined;

      const elementIdByKey = await this.persistElements(tx, job, extracted.units, connectorId);

      await tx
        .update(validationRuns)
        .set({ phase: RunPhase.DETERMINISTIC_GATE, unitsTotal: extracted.units.length, updatedAt: new Date() })
        .where(eq(validationRuns.id, job.runId));

      let shortCircuited = 0;
      const survivorJobs: UnitJob[] = [];
      const runtimeCandidates: RuntimeJob[] = [];
      for (const unit of extracted.units) {
        const result: UnitFindings = this.engine.evaluateUnit(extracted, unit, []);
        await this.writeFindings(tx, job, elementIdByKey.get(unit.key), result);
        if (result.shortCircuited) {
          shortCircuited++;
          continue;
        }
        if (!job.deterministicOnly) {
          survivorJobs.push({
            runId: job.runId,
            orgId: job.orgId,
            namespace: job.namespace,
            vendor,
            apiVersion,
            elementId: elementIdByKey.get(unit.key),
            appGroup: job.runId,
            unit,
            trace: injectTrace(),
          });
        }
        if (job.runtime) {
          runtimeCandidates.push({
            runId: job.runId,
            orgId: job.orgId,
            namespace: job.namespace,
            vendor,
            apiVersion,
            elementId: elementIdByKey.get(unit.key),
            source: job.source,
            unit,
            live: job.live,
            credentials: job.credentials,
            trace: injectTrace(),
          });
        }
      }

      const completedNow = extracted.units.length - survivorJobs.length;
      await tx
        .update(validationRuns)
        .set({
          phase: survivorJobs.length > 0 ? RunPhase.RAG_RETRIEVAL : RunPhase.AGGREGATE,
          unitsShortCircuited: shortCircuited,
          unitsCompleted: completedNow,
          runtimeUnitsTotal: runtimeCandidates.length,
          updatedAt: new Date(),
        })
        .where(eq(validationRuns.id, job.runId));

      return { survivors: survivorJobs, runtimeJobs: runtimeCandidates };
    }, db);

    // Fan out LLM validation survivors; fan out runtime jobs in parallel (independently tracked).
    const { survivors, runtimeJobs } = result;
    if (survivors.length > 0) {
      await enqueueUnitsFair(survivors);
    } else {
      await getAggregateQueue().add(
        'aggregate',
        { runId: job.runId, orgId: job.orgId, elementKey: '*', trace: injectTrace() },
        { jobId: `agg:${job.runId}` },
      );
    }
    if (runtimeJobs.length > 0) {
      await enqueueRuntimeJobs(runtimeJobs);
    }
  }

  private async persistElements(
    tx: Database,
    job: AppJob,
    units: ExtractedUnit[],
    connectorId: string | undefined,
  ): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (!connectorId) return map;
    for (const unit of units) {
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
      map.set(unit.key, row.id);
    }
    return map;
  }

  private async writeFindings(
    tx: Database,
    job: AppJob,
    elementId: string | undefined,
    result: UnitFindings,
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
      await tx.update(validationRuns).set({ ...patch, updatedAt: new Date() }).where(eq(validationRuns.id, job.runId));
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

/** Derive vendor + api version from a namespace like `fathom-1.0.0` or `hubspot-v3`. */
export function splitNamespace(namespace: string, fallbackVersion: string): { vendor: string; apiVersion: string } {
  const m = namespace.match(/^(.*)-(v?\d[\w.]*)$/);
  if (m) return { vendor: m[1], apiVersion: m[2] };
  return { vendor: namespace, apiVersion: fallbackVersion };
}

import { type AggregateJob, RunStatus, Severity } from '@varys/contracts';
import { getDb, validationFindings, validationRuns, withOrg } from '@varys/db';
import { eq } from 'drizzle-orm';

/**
 * Report roll-up (spec §5.5): collects the run's findings and marks the run complete.
 * Confidence scoring and HITL flagging (< 0.85) are applied at finding write-time; this
 * stage finalizes run state and timestamps.
 */
export class AggregatorService {
  async process(job: AggregateJob): Promise<void> {
    const db = getDb();
    await withOrg(job.orgId, async (tx) => {
      const [run] = await tx.select().from(validationRuns).where(eq(validationRuns.id, job.runId)).limit(1);
      if (!run || run.status === RunStatus.FAILED || run.status === RunStatus.COMPLETED) return;

      const findings = await tx
        .select({ severity: validationFindings.severity })
        .from(validationFindings)
        .where(eq(validationFindings.runId, job.runId));

      const critical = findings.filter((f) => f.severity === Severity.CRITICAL).length;

      await tx
        .update(validationRuns)
        .set({
          status: RunStatus.COMPLETED,
          phase: null,
          completedAt: new Date(),
          updatedAt: new Date(),
          error: critical > 0 ? `${critical} critical finding(s)` : null,
        })
        .where(eq(validationRuns.id, job.runId));
    }, db);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Severity, type RunStatusResponse } from '@varys/contracts';
import { getDb, validationFindings, validationRuns, withOrg } from '@varys/db';
import { getAppQueue } from '@varys/queue';
import { desc, eq } from 'drizzle-orm';
import type { Principal } from '../auth/principal';

@Injectable()
export class RunsService {
  async getStatus(principal: Principal, runId: string): Promise<RunStatusResponse> {
    const db = getDb();
    const run = await withOrg(principal.orgId, async (tx) => {
      const [r] = await tx.select().from(validationRuns).where(eq(validationRuns.id, runId)).limit(1);
      return r;
    }, db);
    if (!run) throw new NotFoundException('Run not found');

    let queuePosition: number | null = null;
    if (run.status === 'QUEUED') queuePosition = await getAppQueue().getWaitingCount();

    return {
      runId: run.id,
      status: run.status,
      phase: run.phase ?? null,
      progress: {
        total: run.unitsTotal,
        completed: run.unitsCompleted,
        shortCircuited: run.unitsShortCircuited,
      },
      queuePosition,
      createdAt: run.createdAt.toISOString(),
      updatedAt: run.updatedAt.toISOString(),
    };
  }

  /** Full report: run summary + findings grouped by severity, with element names. */
  async getReport(principal: Principal, runId: string) {
    const db = getDb();
    return withOrg(principal.orgId, async (tx) => {
      const [run] = await tx.select().from(validationRuns).where(eq(validationRuns.id, runId)).limit(1);
      if (!run) throw new NotFoundException('Run not found');

      const findings = await tx
        .select({
          id: validationFindings.id,
          elementId: validationFindings.elementId,
          ruleId: validationFindings.ruleId,
          severity: validationFindings.severity,
          category: validationFindings.category,
          source: validationFindings.source,
          confidence: validationFindings.confidenceScore,
          targetPath: validationFindings.targetPath,
          message: validationFindings.message,
          hitl: validationFindings.hitl,
        })
        .from(validationFindings)
        .where(eq(validationFindings.runId, runId));

      const summary = {
        critical: findings.filter((f) => f.severity === Severity.CRITICAL).length,
        warning: findings.filter((f) => f.severity === Severity.WARNING).length,
        info: findings.filter((f) => f.severity === Severity.INFO).length,
        hitl: findings.filter((f) => f.hitl).length,
      };

      return {
        runId: run.id,
        status: run.status,
        connectorId: run.connectorId,
        progress: {
          total: run.unitsTotal,
          completed: run.unitsCompleted,
          shortCircuited: run.unitsShortCircuited,
        },
        summary,
        findings,
        createdAt: run.createdAt.toISOString(),
        completedAt: run.completedAt?.toISOString() ?? null,
      };
    }, db);
  }

  async list(principal: Principal, limit = 50) {
    const db = getDb();
    return withOrg(principal.orgId, async (tx) => {
      const rows = await tx
        .select()
        .from(validationRuns)
        .orderBy(desc(validationRuns.createdAt))
        .limit(limit);
      return rows.map((r) => ({
        runId: r.id,
        status: r.status,
        phase: r.phase,
        unitsTotal: r.unitsTotal,
        unitsCompleted: r.unitsCompleted,
        createdAt: r.createdAt.toISOString(),
      }));
    }, db);
  }
}

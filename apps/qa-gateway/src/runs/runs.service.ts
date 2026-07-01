import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Severity, type RunStatusResponse } from '@varys/contracts';
import { loadConfig } from '@varys/config';
import { getDb, validationFindings, validationRuns, withOrg } from '@varys/db';
import { type ConnectorRepairRequest, LlmGatewayClient } from '@varys/llm-client';
import { getAppQueue } from '@varys/queue';
import { desc, eq, and } from 'drizzle-orm';
import type { Principal } from '../auth/principal';

@Injectable()
export class RunsService {
  private get gateway(): LlmGatewayClient {
    const config = loadConfig();
    const url = config.LLM_GATEWAY_URL ?? `http://localhost:${config.LLM_GATEWAY_PORT}`;
    return new LlmGatewayClient(url, config.INTERNAL_SERVICE_SECRET);
  }

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

  /** Serve the pre-generated consolidated Markdown report blob. */
  async getReportMarkdown(principal: Principal, runId: string): Promise<string> {
    const db = getDb();
    const run = await withOrg(principal.orgId, async (tx) => {
      const [r] = await tx
        .select({ reportMd: validationRuns.reportMd })
        .from(validationRuns)
        .where(eq(validationRuns.id, runId))
        .limit(1);
      return r;
    }, db);
    if (!run) throw new NotFoundException('Run not found');
    return run.reportMd ?? '*(report not yet generated)*';
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
        reportMd: run.reportMd ?? null,
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

  /**
   * POST /v1/runs/:runId/findings/:findingId/repair
   * Calls the LLM gateway to suggest a minimal code patch for the finding.
   * The caller must supply the connector source — it is never stored at rest.
   */
  async repairFinding(
    principal: Principal,
    runId: string,
    findingId: string,
    source: string,
  ) {
    const db = getDb();
    const finding = await withOrg(principal.orgId, async (tx) => {
      const [f] = await tx
        .select()
        .from(validationFindings)
        .where(and(eq(validationFindings.id, findingId), eq(validationFindings.runId, runId)))
        .limit(1);
      return f;
    }, db);

    if (!finding) throw new NotFoundException('Finding not found');

    const req: ConnectorRepairRequest = {
      orgId: principal.orgId,
      runId,
      elementName: finding.ruleId,
      elementType: 'ACTION',
      source,
      finding: {
        ruleId: finding.ruleId,
        message: finding.message,
        targetPath: finding.targetPath,
        category: finding.category,
      },
    };
    return this.gateway.repair(req);
  }

  /**
   * PATCH /v1/runs/:runId/findings/:findingId/review
   * Records a HITL decision (APPROVED / REJECTED) for a finding flagged for human review.
   */
  async reviewFinding(
    principal: Principal,
    runId: string,
    findingId: string,
    decision: 'APPROVED' | 'REJECTED',
    note?: string,
  ) {
    if (decision !== 'APPROVED' && decision !== 'REJECTED') {
      throw new BadRequestException('decision must be APPROVED or REJECTED');
    }
    const db = getDb();
    return withOrg(principal.orgId, async (tx) => {
      const [existing] = await tx
        .select({ id: validationFindings.id, hitl: validationFindings.hitl })
        .from(validationFindings)
        .where(and(eq(validationFindings.id, findingId), eq(validationFindings.runId, runId)))
        .limit(1);

      if (!existing) throw new NotFoundException('Finding not found');

      const [updated] = await tx
        .update(validationFindings)
        .set({
          hitlStatus: decision,
          details: note ? { reviewNote: note } : undefined,
        })
        .where(eq(validationFindings.id, findingId))
        .returning({
          id: validationFindings.id,
          ruleId: validationFindings.ruleId,
          severity: validationFindings.severity,
          hitl: validationFindings.hitl,
          hitlStatus: validationFindings.hitlStatus,
        });

      return updated;
    }, db);
  }
}

import {
  ContractKind,
  ElementType,
  type ExtractedConnector,
  FindingCategory,
  type Finding,
  RunStatus,
  Severity,
  type UnitJob,
} from '@varys/contracts';
import {
  connectorElements,
  getDb,
  validationFindings,
  validationRuns,
  withOrg,
} from '@varys/db';
import { LlmGatewayClient, buildEmbeddingQuery } from '@varys/llm-client';
import { getAggregateQueue } from '@varys/queue';
import { retrieve } from '@varys/retrieval';
import {
  DeterministicEngine,
  AuthSchemeRule,
  GraphqlOperationRule,
  MethodPathRule,
  RequiredPathParamRule,
  SchemaSubtypeRule,
} from '@varys/rules-engine';
import { injectTrace } from '@varys/telemetry';
import { and, eq, ne, sql } from 'drizzle-orm';
import { CONFIG, type AppConfig } from './config';
import { backVerify } from './back-verify';

/**
 * Per-unit validation (spec §6 phases 0, 3–6): AST-hash cache, hybrid retrieval, contract
 * deterministic gate, scoped LLM validation, back-verification, and run-completion tracking.
 */
export class UnitService {
  private readonly gateway: LlmGatewayClient;
  /** Contract-dependent rules only; structural rules already ran in the orchestrator. */
  private readonly contractEngine = new DeterministicEngine([
    new MethodPathRule(),
    new RequiredPathParamRule(),
    new AuthSchemeRule(),
    new SchemaSubtypeRule(),
    new GraphqlOperationRule(),
  ]);

  constructor(private readonly config: AppConfig) {
    this.gateway = new LlmGatewayClient(
      `http://localhost:${config.LLM_GATEWAY_PORT}`,
      config.INTERNAL_SERVICE_SECRET,
    );
  }

  async process(job: UnitJob): Promise<void> {
    const findings = await this.validate(job);
    await this.persistAndComplete(job, findings);
  }

  private async validate(job: UnitJob): Promise<Finding[]> {
    const db = getDb();
    const { unit } = job;

    // Phase 0: AST-hash cache — reuse prior LLM findings for an identical unit.
    const cached = await this.lookupCache(job);
    if (cached) return cached;

    // Phase 3: hybrid retrieval (embedding via the governed gateway, then vector+FTS+RRF).
    let embedding: number[] = [];
    try {
      const res = await this.gateway.embed(buildEmbeddingQuery(unit), job.runId, job.orgId);
      embedding = res.embedding;
    } catch {
      embedding = [];
    }

    const candidates =
      embedding.length > 0
        ? await withOrg(job.orgId, (tx) =>
            retrieve({
              db: tx,
              vendor: job.vendor,
              apiVersion: job.apiVersion,
              contractKind: unit.contractKind,
              unit,
              embedding,
              // RRF-only for now; the gateway rerank pass can be wired here later (spec §9.2).
              rerank: undefined,
              config: {
                vectorTopK: this.config.RETRIEVAL_VECTOR_TOPK,
                ftsTopK: this.config.RETRIEVAL_FTS_TOPK,
                finalTopK: this.config.RETRIEVAL_FINAL_TOPK,
                rrfK: this.config.RETRIEVAL_RRF_K,
                rerankEnabled: this.config.RETRIEVAL_RERANK_ENABLED,
                rerankMargin: this.config.RETRIEVAL_RERANK_MARGIN,
              },
            }), db)
        : [];

    if (candidates.length === 0) {
      // No documentation coverage: record a low-confidence gap finding for human review.
      return [
        {
          ruleId: 'coverage.no-contract',
          severity: Severity.INFO,
          category: FindingCategory.SCHEMA,
          confidence: 0.5,
          source: 'deterministic',
          message: `No documentation contract was retrieved for "${unit.name}"; LLM validation skipped.`,
          hitl: true,
        },
      ];
    }

    const topContract = candidates[0].contract!;
    const out: Finding[] = [];

    // Contract deterministic rules now that a contract is mapped (spec §6 phase 2 post-RAG).
    const stubConnector = stub(job);
    const det = this.contractEngine.evaluateUnit(
      stubConnector,
      unit,
      candidates.map((c) => c.contract!).filter(Boolean),
    );
    out.push(...det.findings);
    if (det.shortCircuited) return out; // CRITICAL contract violation -> skip LLM spend.

    // Phase 4: scoped LLM validation through the governed gateway.
    try {
      const securityCritical = unit.elementType === ElementType.WEBHOOK_TRIGGER;
      const resp = await this.gateway.validateUnit({
        runId: job.runId,
        orgId: job.orgId,
        unit,
        contract: topContract,
        securityCritical,
      });
      // Phase 6: back-verify each LLM finding against the schemas.
      const { admitted } = backVerify(resp.findings, unit, topContract);
      out.push(...admitted);
    } catch {
      out.push({
        ruleId: 'llm.unavailable',
        severity: Severity.INFO,
        category: FindingCategory.SCHEMA,
        confidence: 0.5,
        source: 'llm',
        message: `LLM validation could not be completed for "${unit.name}".`,
        hitl: true,
      });
    }
    return out;
  }

  /** Reuse LLM findings from a prior COMPLETED run with the same ast_hash (spec §15). */
  private async lookupCache(job: UnitJob): Promise<Finding[] | null> {
    const db = getDb();
    return withOrg(job.orgId, async (tx) => {
      const prior = await tx
        .select({
          ruleId: validationFindings.ruleId,
          severity: validationFindings.severity,
          category: validationFindings.category,
          confidence: validationFindings.confidenceScore,
          message: validationFindings.message,
          targetPath: validationFindings.targetPath,
          source: validationFindings.source,
          details: validationFindings.details,
        })
        .from(validationFindings)
        .innerJoin(connectorElements, eq(validationFindings.elementId, connectorElements.id))
        .innerJoin(validationRuns, eq(validationFindings.runId, validationRuns.id))
        .where(
          and(
            eq(connectorElements.astHash, job.unit.astHash),
            eq(validationRuns.status, RunStatus.COMPLETED),
            ne(validationFindings.runId, job.runId),
            eq(validationFindings.source, 'llm'),
          ),
        )
        .limit(50);
      if (prior.length === 0) return null;
      return prior.map((p) => ({
        ruleId: p.ruleId,
        severity: p.severity as Severity,
        category: p.category as FindingCategory,
        confidence: Number(p.confidence),
        source: 'llm' as const,
        message: p.message,
        targetPath: p.targetPath ?? undefined,
        hitl: Number(p.confidence) < 0.85,
        details: { ...(p.details as object), cached: true },
      }));
    }, db);
  }

  private async persistAndComplete(job: UnitJob, findings: Finding[]): Promise<void> {
    const db = getDb();
    await withOrg(job.orgId, async (tx) => {
      if (findings.length > 0) {
        await tx.insert(validationFindings).values(
          findings.map((f) => ({
            orgId: job.orgId,
            runId: job.runId,
            elementId: job.elementId ?? null,
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

      // Atomic completion increment; the worker that closes the run enqueues aggregation.
      const [row] = await tx
        .update(validationRuns)
        .set({ unitsCompleted: sql`${validationRuns.unitsCompleted} + 1`, updatedAt: new Date() })
        .where(eq(validationRuns.id, job.runId))
        .returning({ completed: validationRuns.unitsCompleted, total: validationRuns.unitsTotal });

      if (row && row.completed >= row.total) {
        await getAggregateQueue().add(
          'aggregate',
          { runId: job.runId, orgId: job.orgId, elementKey: '*', trace: injectTrace() },
          { jobId: `agg:${job.runId}` },
        );
      }
    }, db);
  }
}

/** Minimal connector context for contract rules (which read only unit + contract). */
function stub(job: UnitJob): ExtractedConnector {
  return {
    appId: job.namespace,
    name: job.namespace,
    version: job.apiVersion,
    namespace: job.namespace,
    baseUrls: [],
    connection: { authType: 'unknown', fieldNames: [] },
    contractKind: job.unit.contractKind === ContractKind.GRAPHQL ? ContractKind.GRAPHQL : ContractKind.REST,
    units: [job.unit],
    diagnostics: [],
  };
}

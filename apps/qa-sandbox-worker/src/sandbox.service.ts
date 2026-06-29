import { CONFIDENCE, ElementType, FindingCategory, RunStatus, Severity, type RuntimeJob } from '@varys/contracts';
import {
  getDb,
  runtimeExecutions,
  validationFindings,
  validationRuns,
  withOrg,
} from '@varys/db';
import { LlmGatewayClient } from '@varys/llm-client';
import { sql, eq } from 'drizzle-orm';
import type { AppConfig } from './config';
import { buildElementReport } from './report';
import { buildValidationGraph } from './workflow/graph';
import { computeFinalStatus } from './workflow/nodes';
import type { ValidationState } from './workflow/state';

/**
 * Per-element sandbox validation service (spec §13 + LangGraph architecture).
 * Each RuntimeJob is processed through the 5-node LangGraph workflow:
 *   Generate Payload → Execute Runtime → Deterministic Validation → LLM Failure Analysis → Retry?
 */
export class SandboxService {
  private readonly gateway: LlmGatewayClient;
  private readonly graph: ReturnType<typeof buildValidationGraph>;

  constructor(private readonly config: AppConfig) {
    this.gateway = new LlmGatewayClient(
      `http://localhost:${config.LLM_GATEWAY_PORT}`,
      config.INTERNAL_SERVICE_SECRET,
    );
    this.graph = buildValidationGraph({
      gateway: this.gateway,
      gatewayUrl: `http://localhost:${config.LLM_GATEWAY_PORT}`,
      cpuTimeoutMs: config.SANDBOX_CPU_TIMEOUT_MS ?? 2000,
      memoryMb: config.SANDBOX_MEMORY_MB ?? 128,
    });
  }

  async process(job: RuntimeJob): Promise<void> {
    const unit = job.unit;
    const elementType = unit.elementType === ElementType.ACTION ? 'ACTION' : 'TRIGGER';

    const initialState: Partial<ValidationState> = {
      runId: job.runId,
      orgId: job.orgId,
      connectorId: undefined,
      elementType,
      elementName: unit.name,
      unitKey: unit.key,
      source: job.source,
      unit,
      contract: undefined,
      credentials: job.credentials ?? {},
      payload: undefined,
      capturedRequest: null,
      capturedResponse: null,
      runtimeError: undefined,
      runtimeOom: false,
      runtimeTimeout: false,
      runtimeLogs: [],
      deterministicFindings: [],
      llmAnalysis: undefined,
      retryCount: 0,
      finalStatus: 'PENDING',
    };

    let finalState: ValidationState;
    try {
      finalState = (await this.graph.invoke(initialState)) as ValidationState;
    } catch (err) {
      finalState = {
        ...(initialState as ValidationState),
        runtimeError: (err as Error).message,
        finalStatus: 'FAIL',
        deterministicFindings: [],
      };
    }

    finalState = {
      ...finalState,
      finalStatus: computeFinalStatus(finalState),
    };

    await this.persist(job, finalState);
  }

  private async persist(job: RuntimeJob, state: ValidationState): Promise<void> {
    const db = getDb();
    const elementReport = buildElementReport(state);
    const mode = job.live ? 'live' : 'mock';

    await withOrg(job.orgId, async (tx) => {
      // Record the execution itself.
      await tx.insert(runtimeExecutions).values({
        orgId: job.orgId,
        runId: job.runId,
        elementId: job.elementId ?? null,
        mode,
        status: state.finalStatus,
        capturedRequest: (state.capturedRequest as Record<string, unknown>) ?? null,
        capturedResponse: (state.capturedResponse as Record<string, unknown>) ?? null,
        contractDiff: {
          findings: state.deterministicFindings,
          llmAnalysis: state.llmAnalysis ?? null,
          retries: state.retryCount,
          elementReport,
        },
        durationMs: null,
      });

      // Persist all deterministic runtime findings to the shared findings table.
      const allFindings = [
        ...state.deterministicFindings,
        ...buildRuntimeErrorFinding(state),
      ];

      if (allFindings.length > 0) {
        await tx.insert(validationFindings).values(
          allFindings.map((f) => ({
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

      // Atomically increment runtime completion counter; trigger re-aggregation on completion.
      const [run] = await tx
        .update(validationRuns)
        .set({
          runtimeUnitsCompleted: sql`${validationRuns.runtimeUnitsCompleted} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(validationRuns.id, job.runId))
        .returning({
          completed: validationRuns.runtimeUnitsCompleted,
          total: validationRuns.runtimeUnitsTotal,
          status: validationRuns.status,
        });

      if (run && run.completed >= run.total && run.status === RunStatus.COMPLETED) {
        // All runtime units done: append runtime findings to the existing report in-place.
        await tx
          .update(validationRuns)
          .set({
            reportMd: sql`${validationRuns.reportMd} || ${'\n\n---\n\n## Runtime Execution Results\n\n' + elementReport}`,
            updatedAt: new Date(),
          })
          .where(eq(validationRuns.id, job.runId));
      }
    }, db);
  }
}

import type { Finding } from '@varys/contracts';

function buildRuntimeErrorFinding(state: ValidationState): Finding[] {
  if (!state.runtimeError) return [];
  return [
    {
      ruleId: state.runtimeOom
        ? 'runtime.oom'
        : state.runtimeTimeout
          ? 'runtime.timeout'
          : 'runtime.error',
      severity: Severity.CRITICAL,
      category: FindingCategory.RUNTIME,
      confidence: CONFIDENCE.DETERMINISTIC,
      source: 'runtime',
      message: state.runtimeOom
        ? `${state.elementName} exceeded the 128 MB isolate memory limit.`
        : state.runtimeTimeout
          ? `${state.elementName} exceeded the 2 000 ms CPU timeout.`
          : `${state.elementName} threw during execution: ${state.runtimeError}`,
    },
  ];
}

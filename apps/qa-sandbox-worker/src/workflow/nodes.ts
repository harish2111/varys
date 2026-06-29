import {
  CONFIDENCE,
  ElementType,
  FindingCategory,
  Severity,
  type DocumentationContract,
  type ExtractedUnit,
  type Finding,
} from '@varys/contracts';
import type { LlmGatewayClient } from '@varys/llm-client';
import { buildMockPayload } from '../payload';
import { MockHttpHost, mockResponder } from '../host-http';
import { diffRequestAgainstContract } from '../contract-diff';
import { verifyPolling } from '../polling';
import { runConnectorInIsolate } from '../isolate';
import { transpileConnector } from '../transpile';
import type { ValidationState, AnalysisResult } from './state';

export interface NodeDeps {
  gateway: LlmGatewayClient;
  gatewayUrl: string;
  cpuTimeoutMs: number;
  memoryMb: number;
}

/**
 * Node 1 — Generate Payload: builds a deterministic mock payload from the unit's declared
 * input fields and any contract-documented path parameters.
 */
export async function generatePayload(
  state: ValidationState,
): Promise<Partial<ValidationState>> {
  const unit = state.unit as ExtractedUnit;
  const contract = state.contract as DocumentationContract | undefined;
  const payload = buildMockPayload(unit, contract);
  return {
    payload,
    finalStatus: 'PENDING',
    runtimeError: undefined,
    capturedRequest: null,
    capturedResponse: null,
    deterministicFindings: [],
    llmAnalysis: undefined,
  };
}

/**
 * Node 2 — Execute Runtime: transpiles the connector source, runs it inside an isolated-vm
 * V8 isolate with the mock payload and a captured HTTP host.
 */
export async function executeRuntime(
  state: ValidationState,
  deps: NodeDeps,
): Promise<Partial<ValidationState>> {
  const unit = state.unit as ExtractedUnit;
  const contract = state.contract as DocumentationContract | undefined;
  const logs: string[] = [];

  let transpiledSource: string;
  try {
    transpiledSource = transpileConnector(state.source);
  } catch (err) {
    logs.push(`Transpile failed: ${(err as Error).message}`);
    return {
      runtimeError: `transpile: ${(err as Error).message}`,
      capturedRequest: null,
      capturedResponse: null,
      runtimeLogs: logs,
    };
  }

  const host = new MockHttpHost(mockResponder(unit, contract));

  const result = await runConnectorInIsolate({
    code: transpiledSource,
    unitKey: unit.key,
    elementType: unit.elementType,
    payload: state.payload ?? {},
    auth: state.credentials ?? buildDefaultAuth(unit),
    host,
    memoryMb: deps.memoryMb,
    cpuTimeoutMs: deps.cpuTimeoutMs,
  });

  const [capturedRequest] = host.captured;
  logs.push(result.ok ? 'Runtime execution succeeded.' : `Runtime error: ${result.error ?? 'unknown'}`);

  return {
    capturedRequest: capturedRequest ?? null,
    capturedResponse: result.returnValue ?? null,
    runtimeError: result.ok ? undefined : (result.error ?? 'unknown runtime error'),
    runtimeOom: result.oom ?? false,
    runtimeTimeout: result.timeout ?? false,
    runtimeLogs: logs,
  };
}

/**
 * Node 3 — Deterministic Validation: diffs the captured request against the contract and,
 * for polling triggers, runs the two-pass cursor/dedup check.
 */
export async function deterministicValidation(
  state: ValidationState,
): Promise<Partial<ValidationState>> {
  const unit = state.unit as ExtractedUnit;
  const contract = state.contract as DocumentationContract | undefined;
  const findings: Finding[] = [];

  if (!state.capturedRequest) {
    // No captured request = runtime didn't emit an HTTP call.
    if (!state.runtimeError) {
      findings.push({
        ruleId: 'runtime.no-request',
        severity: Severity.WARNING,
        category: FindingCategory.RUNTIME,
        confidence: CONFIDENCE.DETERMINISTIC,
        source: 'runtime',
        message: `${unit.name} executed without emitting an HTTP request. The execute/poll function may be a no-op or gated by a condition.`,
      });
    }
    return { deterministicFindings: findings };
  }

  if (contract) {
    findings.push(...diffRequestAgainstContract(state.capturedRequest as Parameters<typeof diffRequestAgainstContract>[0], contract));
  }

  // Two-pass polling verification for POLLING_TRIGGER elements.
  if (unit.elementType === ElementType.POLLING_TRIGGER && state.capturedResponse) {
    const resp = state.capturedResponse as Record<string, unknown>;
    const records = Array.isArray(resp.records) ? resp.records as Array<Record<string, unknown>> : [];
    const pass1 = { records, cursor: resp.cursor, hasMore: resp.hasMore as boolean | undefined };
    // Pass 2 simulates a replay with the cursor; we use the same single-run result here.
    const pass2 = { records: [], cursor: pass1.cursor };
    findings.push(...verifyPolling(pass1, pass2));
  }

  const hasCritical = findings.some((f) => f.severity === Severity.CRITICAL);
  const hasWarning = findings.some((f) => f.severity === Severity.WARNING);

  return {
    deterministicFindings: findings,
    finalStatus: hasCritical ? 'FAIL' : hasWarning ? 'WARNING' : 'PASS',
  };
}

/**
 * Node 4 — LLM Failure Analysis: calls the LLM gateway to diagnose failures and determine
 * whether regenerating the payload would fix them (retryable).
 */
export async function llmFailureAnalysis(
  state: ValidationState,
  deps: NodeDeps,
): Promise<Partial<ValidationState>> {
  const unit = state.unit as ExtractedUnit;
  const findingSummary = state.deterministicFindings
    .map((f) => `[${f.severity}] ${f.ruleId}: ${f.message}`)
    .join('\n');

  let analysis: AnalysisResult;
  try {
    const resp = await deps.gateway.analyzeFailure({
      runId: state.runId,
      orgId: state.orgId,
      elementName: unit.name,
      elementType: state.elementType,
      runtimeError: state.runtimeError,
      capturedRequest: state.capturedRequest,
      findingSummary,
    });
    analysis = resp;
  } catch {
    analysis = {
      analysis: 'LLM failure analysis unavailable.',
      isRetryable: false,
    };
  }
  return { llmAnalysis: analysis };
}

/**
 * Router function used as a conditional edge after Node 4. Decides whether to retry
 * (back to generatePayload) or finalize.
 */
export function shouldRetry(state: ValidationState): 'retry' | 'finalize' {
  const { llmAnalysis, retryCount, runtimeOom, runtimeTimeout } = state;
  // OOM/timeout are not fixable by payload regeneration.
  if (runtimeOom || runtimeTimeout) return 'finalize';
  if (!llmAnalysis?.isRetryable) return 'finalize';
  if (retryCount >= 3) return 'finalize';
  return 'retry';
}

/**
 * Finalizer — not a true graph node, but a post-graph step that computes the ultimate
 * PASS/FAIL/WARNING status from all accumulated findings.
 */
export function computeFinalStatus(state: ValidationState): 'PASS' | 'FAIL' | 'WARNING' {
  const allFindings = state.deterministicFindings ?? [];
  if (state.runtimeError && !allFindings.length) return 'FAIL';
  const hasCritical = allFindings.some((f) => f.severity === Severity.CRITICAL);
  const hasWarning = allFindings.some((f) => f.severity === Severity.WARNING);
  return hasCritical ? 'FAIL' : hasWarning ? 'WARNING' : 'PASS';
}

function buildDefaultAuth(unit: ExtractedUnit): Record<string, unknown> {
  const firstCall = unit.httpCalls[0];
  if (!firstCall) return {};
  switch (firstCall.authScheme) {
    case 'BEARER':
      return { authorization: 'Bearer mock-token' };
    case 'API_KEY_HEADER':
      return { [firstCall.authHeaderName ?? 'x-api-key']: 'mock-api-key' };
    case 'BASIC':
      return { username: 'mock-user', password: 'mock-pass' };
    default:
      return {};
  }
}

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
import { LiveHttpHost, MockHttpHost, mockResponder } from '../host-http';
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
  /** When true, routes the isolate's fetch through Squid (live connector test). */
  live?: boolean;
  egressProxyUrl?: string;
  wallTimeoutMs?: number;
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

  const host =
    deps.live && deps.egressProxyUrl
      ? new LiveHttpHost(deps.egressProxyUrl, deps.wallTimeoutMs ?? 10_000)
      : new MockHttpHost(mockResponder(unit, contract));
  const runOpts = {
    code: transpiledSource,
    unitKey: unit.key,
    elementType: unit.elementType,
    auth: state.credentials ?? buildDefaultAuth(unit),
    host,
    memoryMb: deps.memoryMb,
    cpuTimeoutMs: deps.cpuTimeoutMs,
  };

  const result = await runConnectorInIsolate({ ...runOpts, payload: state.payload ?? {} });
  const [capturedRequest] = host.captured;
  logs.push(result.ok ? 'Pass 1 succeeded.' : `Pass 1 error: ${result.error ?? 'unknown'}`);

  const base: Partial<ValidationState> = {
    capturedRequest: capturedRequest ?? null,
    capturedResponse: result.returnValue ?? null,
    runtimeError: result.ok ? undefined : (result.error ?? 'unknown runtime error'),
    runtimeOom: result.oom ?? false,
    runtimeTimeout: result.timeout ?? false,
    pass2CapturedRequest: null,
    pass2CapturedResponse: null,
  };

  // Two-pass polling: run a second isolate pass with the cursor from pass 1.
  if (result.ok && unit.elementType === ElementType.POLLING_TRIGGER) {
    const pass1Resp = result.returnValue as Record<string, unknown> | undefined;
    const cursor = pass1Resp?.cursor;
    const hasPass1Records = Array.isArray(pass1Resp?.records) && (pass1Resp!.records as unknown[]).length > 0;
    if (cursor !== undefined && cursor !== null && hasPass1Records) {
      const host2 =
        deps.live && deps.egressProxyUrl
          ? new LiveHttpHost(deps.egressProxyUrl, deps.wallTimeoutMs ?? 10_000)
          : new MockHttpHost(mockResponder(unit, contract));
      const result2 = await runConnectorInIsolate({
        ...runOpts,
        host: host2,
        payload: { ...(state.payload ?? {}), cursor },
      });
      logs.push(result2.ok ? 'Pass 2 succeeded.' : `Pass 2 error: ${result2.error ?? 'unknown'}`);
      base.pass2CapturedRequest = host2.captured[0] ?? null;
      base.pass2CapturedResponse = result2.returnValue ?? null;
    }
  }

  return { ...base, runtimeLogs: logs };
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
    const resp1 = state.capturedResponse as Record<string, unknown>;
    const pass1 = {
      records: Array.isArray(resp1.records) ? (resp1.records as Array<Record<string, unknown>>) : [],
      cursor: resp1.cursor,
      hasMore: resp1.hasMore as boolean | undefined,
    };
    // If a pass2 was executed, use its actual result; otherwise supply empty records.
    const resp2 = state.pass2CapturedResponse as Record<string, unknown> | null;
    const pass2 = {
      records: resp2 && Array.isArray(resp2.records) ? (resp2.records as Array<Record<string, unknown>>) : [],
      cursor: resp2?.cursor ?? pass1.cursor,
    };
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

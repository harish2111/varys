import { Annotation } from '@langchain/langgraph';
import type { ExtractedUnit, Finding } from '@varys/contracts';
import type { DocumentationContract } from '@varys/contracts';

export interface AnalysisResult {
  analysis: string;
  rootCause?: string;
  suggestedFix?: string;
  isRetryable: boolean;
}

export const MAX_RETRY_COUNT = 3;

/**
 * Per-element LangGraph validation state (spec LangGraph §ValidationState).
 * All fields use "last-write wins" reducer (replace semantics) except runtimeLogs
 * which accumulates across retries.
 */
export const ValidationStateAnnotation = Annotation.Root({
  // Identity
  runId: Annotation<string>(),
  orgId: Annotation<string>(),
  connectorId: Annotation<string | undefined>(),
  elementType: Annotation<'ACTION' | 'TRIGGER'>(),
  elementName: Annotation<string>(),
  unitKey: Annotation<string>(),

  // Connector artefacts
  source: Annotation<string>(),
  unit: Annotation<ExtractedUnit>(),
  contract: Annotation<DocumentationContract | undefined>(),
  credentials: Annotation<Record<string, unknown> | undefined>(),

  // Node 1 output: generated payload
  payload: Annotation<Record<string, unknown> | undefined>(),

  // Node 2 output: runtime execution
  capturedRequest: Annotation<unknown>(),
  capturedResponse: Annotation<unknown>(),
  runtimeError: Annotation<string | undefined>(),
  runtimeOom: Annotation<boolean>(),
  runtimeTimeout: Annotation<boolean>(),
  runtimeLogs: Annotation<string[]>({
    reducer: (prev: string[], next: string[]) => [...prev, ...next],
    default: () => [],
  }),

  // Node 3 output: deterministic findings
  deterministicFindings: Annotation<Finding[]>(),

  // Node 4 output: LLM failure analysis
  llmAnalysis: Annotation<AnalysisResult | undefined>(),

  // Control
  retryCount: Annotation<number>(),
  finalStatus: Annotation<'PASS' | 'FAIL' | 'WARNING' | 'PENDING'>(),
});

export type ValidationState = typeof ValidationStateAnnotation.State;

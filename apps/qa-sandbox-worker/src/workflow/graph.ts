import { END, START, StateGraph } from '@langchain/langgraph';
import { ValidationStateAnnotation } from './state';
import {
  type NodeDeps,
  deterministicValidation,
  executeRuntime,
  generatePayload,
  llmFailureAnalysis,
  shouldRetry,
} from './nodes';

/**
 * Compile the per-element LangGraph validation workflow (spec LangGraph architecture).
 *
 * Flow:
 *   START → generatePayload → executeRuntime → deterministicValidation
 *         → llmFailureAnalysis → [retry → generatePayload | finalize → END]
 *
 * The graph processes one Action or Trigger end-to-end, with up to MAX_RETRY_COUNT
 * payload-regeneration retries when the LLM analysis identifies the failure as fixable.
 */
export function buildValidationGraph(deps: NodeDeps) {
  const graph = new StateGraph(ValidationStateAnnotation)
    .addNode('generatePayload', (state) => generatePayload(state))
    .addNode('executeRuntime', (state) => executeRuntime(state, deps))
    .addNode('deterministicValidation', (state) => deterministicValidation(state))
    .addNode('llmFailureAnalysis', async (state) => {
      const hasFailures =
        (state.deterministicFindings?.length ?? 0) > 0 || !!state.runtimeError;
      if (!hasFailures) return { llmAnalysis: undefined };
      return llmFailureAnalysis(state, deps);
    })
    .addNode('incrementRetry', (state) => ({
      retryCount: (state.retryCount ?? 0) + 1,
    }));

  graph
    .addEdge(START, 'generatePayload')
    .addEdge('generatePayload', 'executeRuntime')
    .addEdge('executeRuntime', 'deterministicValidation')
    .addEdge('deterministicValidation', 'llmFailureAnalysis')
    .addConditionalEdges('llmFailureAnalysis', shouldRetry, {
      retry: 'incrementRetry',
      finalize: END,
    })
    .addEdge('incrementRetry', 'generatePayload');

  return graph.compile();
}

export type ValidationGraph = ReturnType<typeof buildValidationGraph>;

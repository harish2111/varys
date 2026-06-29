/**
 * Unit tests for the sandbox worker components (spec §13 runtime validation).
 * These tests exercise the LangGraph nodes in isolation — no real isolated-vm, no network.
 */
import { deterministicValidation, generatePayload } from '../src/workflow/nodes';
import { buildElementReport } from '../src/report';
import type { ValidationState } from '../src/workflow/state';
import { AuthScheme, ContractKind, ElementType } from '@varys/contracts';
import type { DocumentationContract } from '@varys/contracts';

const baseUnit = {
  key: 'createRecord',
  id: 'create_record',
  name: 'Create Record',
  elementType: ElementType.ACTION,
  contractKind: ContractKind.REST,
  inputFields: [
    { name: 'name', type: 'string' as const, required: true },
    { name: 'count', type: 'number' as const, required: false },
  ],
  outputFields: [],
  httpCalls: [
    {
      method: 'POST' as const,
      pathTemplate: '/api/records',
      queryParams: [],
      headerNames: ['authorization'],
      authScheme: AuthScheme.BEARER,
      hasBody: true,
    },
  ],
  graphqlOps: [],
  astHash: 'abc123',
};

const makeState = (overrides: Partial<ValidationState> = {}): ValidationState =>
  ({
    runId: 'run-1',
    orgId: 'org-1',
    connectorId: undefined,
    elementType: 'ACTION',
    elementName: 'Create Record',
    unitKey: 'createRecord',
    source: '',
    unit: baseUnit,
    contract: undefined,
    credentials: {},
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
    ...overrides,
  } as ValidationState);

describe('generatePayload node', () => {
  it('builds a payload from unit input fields', async () => {
    const state = makeState();
    const patch = await generatePayload(state);
    expect(patch.payload).toBeDefined();
    expect(patch.payload).toMatchObject({ name: 'mock-name', count: 1 });
  });

  it('includes path-parameter placeholders', async () => {
    const state = makeState({
      unit: {
        ...baseUnit,
        httpCalls: [
          {
            method: 'GET' as const,
            pathTemplate: '/api/records/{recordId}',
            queryParams: [],
            headerNames: [],
            authScheme: AuthScheme.NONE,
            hasBody: false,
          },
        ],
      },
    });
    const patch = await generatePayload(state);
    expect(patch.payload).toMatchObject({ recordId: 'mock-id' });
  });
});

describe('deterministicValidation node', () => {
  it('emits no-request warning when no HTTP call captured', async () => {
    const state = makeState({ capturedRequest: null });
    const patch = await deterministicValidation(state);
    expect(patch.deterministicFindings).toHaveLength(1);
    expect(patch.deterministicFindings![0].ruleId).toBe('runtime.no-request');
  });

  it('emits no warnings when captured request matches contract', async () => {
    const state = makeState({
      capturedRequest: {
        method: 'POST',
        url: 'https://api.example.com/api/records',
        path: '/api/records',
        headers: { authorization: 'Bearer token' },
        body: { name: 'test' },
      },
      contract: {
        kind: ContractKind.REST,
        vendor: 'example',
        apiVersion: '1.0',
        resourceGroup: 'records',
        title: 'Create Record',
        method: 'POST',
        path: '/api/records',
        auth: AuthScheme.BEARER,
        requestFields: [{ name: 'name', type: 'string' as const, required: true }],
        responseFields: [],
      } as DocumentationContract,
    });
    const patch = await deterministicValidation(state);
    const critical = patch.deterministicFindings!.filter((f) => f.severity === 'CRITICAL');
    expect(critical).toHaveLength(0);
  });
});

describe('buildElementReport', () => {
  it('generates PASS report with no findings', () => {
    const state = makeState({ finalStatus: 'PASS', deterministicFindings: [] });
    const md = buildElementReport(state);
    expect(md).toContain('✅');
    expect(md).toContain('Create Record');
  });

  it('generates FAIL report with runtime error', () => {
    const state = makeState({ finalStatus: 'FAIL', runtimeError: 'SyntaxError: unexpected token' });
    const md = buildElementReport(state);
    expect(md).toContain('❌');
    expect(md).toContain('SyntaxError');
  });

  it('includes LLM analysis when present', () => {
    const state = makeState({
      finalStatus: 'WARNING',
      deterministicFindings: [],
      llmAnalysis: {
        analysis: 'The auth header is missing.',
        rootCause: 'Bearer token not injected.',
        suggestedFix: 'Pass auth in context.auth.token.',
        isRetryable: true,
      },
    });
    const md = buildElementReport(state);
    expect(md).toContain('LLM Analysis');
    expect(md).toContain('The auth header is missing.');
  });
});

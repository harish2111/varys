import {
  AuthScheme,
  ContractKind,
  type DocumentationContract,
  ElementType,
  type ExtractedConnector,
  type ExtractedUnit,
  Severity,
} from '@varys/contracts';
import { DeterministicEngine } from '../src';

function connector(units: ExtractedUnit[], authType: ExtractedConnector['connection']['authType'] = 'credentials'): ExtractedConnector {
  return {
    appId: 'test-1.0.0',
    name: 'Test',
    version: '1.0.0',
    namespace: 'test-1.0.0',
    baseUrls: ['https://api.test.com'],
    connection: { authType, fieldNames: ['api_key'] },
    contractKind: ContractKind.REST,
    units,
    diagnostics: [],
  };
}

function restUnit(over: Partial<ExtractedUnit> = {}): ExtractedUnit {
  return {
    key: 'get_thing',
    id: 'get_thing',
    name: 'Get Thing',
    elementType: ElementType.ACTION,
    contractKind: ContractKind.REST,
    inputFields: [{ name: 'thing_id', type: 'string', required: true }],
    outputFields: [],
    httpCalls: [
      {
        method: 'GET',
        baseUrl: 'https://api.test.com',
        pathTemplate: '/things/{thing_id}',
        queryParams: [],
        headerNames: ['Authorization'],
        authScheme: AuthScheme.BEARER,
        hasBody: false,
      },
    ],
    graphqlOps: [],
    astHash: 'x',
    ...over,
  };
}

const engine = new DeterministicEngine();

describe('DeterministicEngine — structural rules (no contract)', () => {
  it('flags an action with no operation as CRITICAL', () => {
    const u = restUnit({ httpCalls: [] });
    const res = engine.evaluateUnit(connector([u]), u, []);
    expect(res.shortCircuited).toBe(true);
    expect(res.findings.find((f) => f.ruleId === 'structural.no-operation')?.severity).toBe(Severity.CRITICAL);
  });

  it('warns when auth is required but no header is injected', () => {
    const u = restUnit({
      httpCalls: [
        { method: 'GET', pathTemplate: '/things', queryParams: [], headerNames: [], authScheme: AuthScheme.NONE, hasBody: false },
      ],
    });
    const res = engine.evaluateUnit(connector([u]), u, []);
    expect(res.findings.some((f) => f.ruleId === 'structural.missing-auth' && f.severity === Severity.WARNING)).toBe(true);
  });

  it('passes a well-formed unit with no contract', () => {
    const u = restUnit();
    const res = engine.evaluateUnit(connector([u]), u, []);
    expect(res.shortCircuited).toBe(false);
  });
});

describe('DeterministicEngine — contract rules (REST)', () => {
  const good: DocumentationContract = {
    kind: ContractKind.REST,
    vendor: 'test',
    apiVersion: '1.0.0',
    resourceGroup: 'things',
    title: 'Get Thing',
    method: 'GET',
    path: '/things/{id}',
    auth: AuthScheme.BEARER,
    requestFields: [{ name: 'thing_id', type: 'string', required: true }],
  };

  it('passes when method, path, auth and schema all match', () => {
    const u = restUnit();
    const res = engine.evaluateUnit(connector([u]), u, [good]);
    expect(res.findings.filter((f) => f.severity === Severity.CRITICAL)).toHaveLength(0);
  });

  it('flags a method mismatch as CRITICAL', () => {
    const u = restUnit();
    const res = engine.evaluateUnit(connector([u]), u, [{ ...good, method: 'POST' }]);
    const f = res.findings.find((x) => x.ruleId === 'rest.method-path');
    expect(f?.severity).toBe(Severity.CRITICAL);
  });

  it('flags an auth scheme mismatch as CRITICAL', () => {
    const u = restUnit();
    const res = engine.evaluateUnit(connector([u]), u, [{ ...good, auth: AuthScheme.API_KEY_HEADER }]);
    expect(res.findings.find((x) => x.ruleId === 'rest.auth-mismatch')?.severity).toBe(Severity.CRITICAL);
  });

  it('flags a missing required field and a type mismatch', () => {
    const u = restUnit({ inputFields: [{ name: 'thing_id', type: 'number', required: true }] });
    const contract: DocumentationContract = {
      ...good,
      requestFields: [
        { name: 'thing_id', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
      ],
    };
    const res = engine.evaluateUnit(connector([u]), u, [contract]);
    const schema = res.findings.filter((f) => f.ruleId === 'rest.schema-subtype');
    expect(schema.some((f) => f.message.includes('Type mismatch') && f.severity === Severity.CRITICAL)).toBe(true);
    expect(schema.some((f) => f.message.includes('missing') && f.severity === Severity.CRITICAL)).toBe(true);
  });
});

describe('DeterministicEngine — GraphQL', () => {
  it('flags a missing required variable as CRITICAL', () => {
    const u = restUnit({
      contractKind: ContractKind.GRAPHQL,
      httpCalls: [],
      graphqlOps: [{ operationType: 'query', operationName: 'getTicketList', rootField: 'getTicketList', selectedFields: ['tickets'], variables: [] }],
    });
    const contract: DocumentationContract = {
      kind: ContractKind.GRAPHQL,
      vendor: 'superops',
      apiVersion: '1.0.0',
      resourceGroup: 'tickets',
      title: 'List Tickets',
      operationType: 'query',
      operationName: 'getTicketList',
      requiredVariables: ['input'],
      availableFields: ['tickets', 'listInfo'],
    };
    const res = engine.evaluateUnit(connector([u]), u, [contract]);
    expect(res.findings.find((f) => f.ruleId === 'graphql.operation')?.severity).toBe(Severity.CRITICAL);
  });
});

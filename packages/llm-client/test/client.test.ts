import {
  AuthScheme,
  ContractKind,
  type DocumentationContract,
  ElementType,
  type ExtractedUnit,
  FindingCategory,
} from '@varys/contracts';
import {
  LlmClient,
  type LlmTransport,
  chooseModel,
  computeGenerateCost,
  parseFindings,
} from '../src';

const unit: ExtractedUnit = {
  key: 'get_thing',
  id: 'get_thing',
  name: 'Get Thing',
  elementType: ElementType.ACTION,
  contractKind: ContractKind.REST,
  inputFields: [{ name: 'thing_id', type: 'string', required: true }],
  outputFields: [],
  httpCalls: [
    { method: 'GET', pathTemplate: '/things/{thing_id}', queryParams: [], headerNames: [], authScheme: AuthScheme.BEARER, hasBody: false },
  ],
  graphqlOps: [],
  astHash: 'x',
};

const contract: DocumentationContract = {
  kind: ContractKind.REST,
  vendor: 'test',
  apiVersion: '1',
  resourceGroup: 'things',
  title: 'Get Thing',
  method: 'GET',
  path: '/things/{id}',
};

const pricing = {
  flash: { inputPerM: 0.075, cachedPerM: 0.01875, outputPerM: 0.3 },
  pro: { inputPerM: 1.25, cachedPerM: 0.3125, outputPerM: 10 },
  embed: { inputPerM: 0.15 },
};

describe('parseFindings', () => {
  it('parses structured findings and tolerates missing fields', () => {
    const out = parseFindings(
      JSON.stringify({ findings: [{ finding_type: 'SCHEMA_MISMATCH', severity: 'CRITICAL', explanation: 'x', confidence_score: 0.9 }] }),
    );
    expect(out).toHaveLength(1);
    expect(out[0].confidence_score).toBe(0.9);
  });
  it('returns [] on non-JSON', () => {
    expect(parseFindings('not json')).toEqual([]);
  });
});

describe('chooseModel', () => {
  it('routes standard units to Flash', () => {
    const r = chooseModel({}, { flashModel: 'flash', proModel: 'pro', escalationConfidence: 0.85 });
    expect(r.model).toBe('flash');
    expect(r.escalated).toBe(false);
  });
  it('escalates AUTH and low-confidence to Pro', () => {
    expect(chooseModel({ category: FindingCategory.AUTH }, { flashModel: 'flash', proModel: 'pro', escalationConfidence: 0.85 }).model).toBe('pro');
    expect(chooseModel({ priorConfidence: 0.6 }, { flashModel: 'flash', proModel: 'pro', escalationConfidence: 0.85 }).model).toBe('pro');
  });
});

describe('computeGenerateCost', () => {
  it('bills cached tokens at the cached rate', () => {
    const cost = computeGenerateCost(pricing.flash, { inputTokens: 1000, cachedTokens: 800, outputTokens: 200 });
    // 200 billed input + 800 cached + 200 output
    const expected = (200 * 0.075 + 800 * 0.01875 + 200 * 0.3) / 1_000_000;
    expect(cost).toBeCloseTo(expected, 12);
  });
});

describe('LlmClient.validateUnit', () => {
  it('sends a scoped prompt and returns parsed findings + cost', async () => {
    const transport: LlmTransport = {
      generate: jest.fn().mockResolvedValue({
        text: JSON.stringify({ findings: [{ finding_type: 'AUTH_MISMATCH', severity: 'CRITICAL', explanation: 'bad auth', confidence_score: 0.8 }] }),
        usage: { inputTokens: 3000, cachedTokens: 2000, outputTokens: 100 },
      }),
      embed: jest.fn(),
    };
    const client = new LlmClient(transport, pricing);
    const res = await client.validateUnit(unit, contract, { model: 'flash' });
    expect(res.findings[0].finding_type).toBe('AUTH_MISMATCH');
    expect(res.costUsd).toBeGreaterThan(0);
    const call = (transport.generate as jest.Mock).mock.calls[0][0];
    expect(call.responseMimeType).toBe('application/json');
    expect(call.contents).toContain('documentation_contract');
  });
});

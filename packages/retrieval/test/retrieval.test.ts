import { AuthScheme, ContractKind, ElementType, type ExtractedUnit } from '@varys/contracts';
import { buildFtsQuery, isFusionDecisive, reciprocalRankFusion, rowToContract } from '../src';

const unit: ExtractedUnit = {
  key: 'update_contact',
  id: 'update_contact',
  name: 'Update Contact',
  elementType: ElementType.ACTION,
  contractKind: ContractKind.REST,
  inputFields: [],
  outputFields: [],
  httpCalls: [
    { method: 'PATCH', pathTemplate: '/crm/v3/objects/contacts/{contactId}', queryParams: [], headerNames: [], authScheme: AuthScheme.BEARER, hasBody: true },
  ],
  graphqlOps: [],
  astHash: 'x',
};

describe('reciprocalRankFusion', () => {
  it('ranks an item appearing high in both lists first', () => {
    const fused = reciprocalRankFusion([['a', 'b', 'c'], ['b', 'a', 'd']], 60);
    expect(fused[0].id).toBe('a');
    expect(fused.map((f) => f.id)).toEqual(expect.arrayContaining(['a', 'b', 'c', 'd']));
  });
});

describe('isFusionDecisive', () => {
  it('is decisive when the top score dominates', () => {
    expect(isFusionDecisive([{ id: 'a', score: 1 }, { id: 'b', score: 0.1 }], 0.15)).toBe(true);
  });
  it('is not decisive when scores are close', () => {
    expect(isFusionDecisive([{ id: 'a', score: 0.5 }, { id: 'b', score: 0.49 }], 0.15)).toBe(false);
  });
});

describe('buildFtsQuery', () => {
  it('emits path components and method as OR tokens', () => {
    const q = buildFtsQuery(unit);
    expect(q).toContain('crm');
    expect(q).toContain('contacts');
    expect(q).toContain('patch');
    expect(q).not.toContain('{');
  });
});

describe('rowToContract', () => {
  it('maps a REST chunk with raw_openapi_json', () => {
    const contract = rowToContract(
      {
        id: 'c1',
        vendor: 'hubspot',
        apiVersion: 'v3',
        resourceGroup: 'contacts',
        httpMethod: 'PATCH',
        endpointPath: '/crm/v3/objects/contacts/{contactId}',
        content: '...',
        rawOpenapiJson: {
          method: 'PATCH',
          path: '/crm/v3/objects/contacts/{contactId}',
          auth: 'Bearer',
          requestFields: [{ name: 'email', type: 'string', required: true }],
        },
      },
      ContractKind.REST,
    );
    expect(contract.method).toBe('PATCH');
    expect(contract.auth).toBe(AuthScheme.BEARER);
    expect(contract.requestFields?.[0].name).toBe('email');
  });

  it('maps a GraphQL chunk', () => {
    const contract = rowToContract(
      {
        id: 'g1',
        vendor: 'superops',
        apiVersion: '1.0.0',
        resourceGroup: 'tickets',
        httpMethod: 'POST',
        endpointPath: 'getTicketList',
        content: '...',
        rawOpenapiJson: { operationName: 'getTicketList', requiredVariables: ['input'], availableFields: ['tickets'] },
      },
      ContractKind.GRAPHQL,
    );
    expect(contract.operationName).toBe('getTicketList');
    expect(contract.requiredVariables).toEqual(['input']);
  });
});

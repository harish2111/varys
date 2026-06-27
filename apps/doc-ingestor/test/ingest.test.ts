import { ContractKind } from '@varys/contracts';
import { buildChunkContent, contractToChunk } from '../src/chunking';
import { parseGraphqlSdl } from '../src/graphql-sdl';
import { parseOpenApi } from '../src/openapi';

describe('parseOpenApi', () => {
  const spec = {
    components: {
      securitySchemes: { bearer: { type: 'http', scheme: 'bearer' } },
      schemas: {
        Contact: {
          type: 'object',
          required: ['email'],
          properties: { email: { type: 'string' }, age: { type: 'integer' } },
        },
      },
    },
    security: [{ bearer: [] }],
    paths: {
      '/crm/v3/objects/contacts/{contactId}': {
        patch: {
          tags: ['Contacts'],
          summary: 'Update Contact',
          parameters: [{ name: 'idProperty', in: 'query', required: true }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } } },
          responses: { '200': { content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } } } },
        },
      },
    },
  };

  it('extracts a REST contract with method, path, auth, and resolved $ref fields', () => {
    const contracts = parseOpenApi(spec, 'hubspot', 'v3');
    expect(contracts).toHaveLength(1);
    const c = contracts[0];
    expect(c.method).toBe('PATCH');
    expect(c.path).toBe('/crm/v3/objects/contacts/{contactId}');
    expect(c.resourceGroup).toBe('Contacts');
    expect(c.auth).toBe('BEARER');
    expect(c.requiredQueryParams).toEqual(['idProperty']);
    const email = c.requestFields?.find((f) => f.name === 'email');
    expect(email?.required).toBe(true);
    expect(c.requestFields?.find((f) => f.name === 'age')?.type).toBe('number');
  });

  it('builds a self-describing chunk with a metadata prefix', () => {
    const c = parseOpenApi(spec, 'hubspot', 'v3')[0];
    const content = buildChunkContent(c);
    expect(content).toContain('Vendor: hubspot');
    expect(content).toContain('HTTP: PATCH /crm/v3/objects/contacts/{contactId}');
    expect(content).toContain('Auth: BEARER');
    const chunk = contractToChunk(c);
    expect(chunk.httpMethod).toBe('PATCH');
  });
});

describe('parseGraphqlSdl', () => {
  const sdl = `
    type Query {
      getTicketList(input: ListInfoInput!): TicketListResult
    }
    type TicketListResult {
      tickets: [Ticket]
      listInfo: ListInfo
    }
  `;

  it('extracts a GraphQL operation contract with required vars and available fields', () => {
    const contracts = parseGraphqlSdl(sdl, 'superops', '1.0.0');
    const op = contracts.find((c) => c.operationName === 'getTicketList');
    expect(op).toBeDefined();
    expect(op!.kind).toBe(ContractKind.GRAPHQL);
    expect(op!.requiredVariables).toEqual(['input']);
    expect(op!.availableFields).toEqual(expect.arrayContaining(['tickets', 'listInfo']));
  });
});

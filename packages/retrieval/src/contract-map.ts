import { AuthScheme, ContractKind, type DocumentationContract, type NormalizedField } from '@varys/contracts';

export interface ChunkRow {
  id: string;
  vendor: string;
  apiVersion: string;
  resourceGroup: string;
  httpMethod: string;
  endpointPath: string;
  content: string;
  rawOpenapiJson: unknown;
}

/**
 * Map a stored chunk into a DocumentationContract. Structured fields come from
 * raw_openapi_json (produced by ingestion §8); columns are the fallback.
 */
export function rowToContract(row: ChunkRow, kind: ContractKind): DocumentationContract {
  const raw = (row.rawOpenapiJson ?? {}) as Record<string, unknown>;
  const base: DocumentationContract = {
    kind,
    vendor: row.vendor,
    apiVersion: row.apiVersion,
    resourceGroup: row.resourceGroup,
    title: (raw.title as string) ?? `${row.httpMethod} ${row.endpointPath}`,
  };

  if (kind === ContractKind.GRAPHQL) {
    return {
      ...base,
      operationType: (raw.operationType as DocumentationContract['operationType']) ?? 'query',
      operationName: (raw.operationName as string) ?? row.endpointPath,
      availableFields: asStringArray(raw.availableFields),
      requiredVariables: asStringArray(raw.requiredVariables),
    };
  }

  return {
    ...base,
    method: (raw.method as DocumentationContract['method']) ?? (row.httpMethod as DocumentationContract['method']),
    path: (raw.path as string) ?? row.endpointPath,
    requiredQueryParams: asStringArray(raw.requiredQueryParams),
    requestFields: asFields(raw.requestFields ?? raw.parameters),
    responseFields: asFields(raw.responseFields),
    auth: parseAuth(raw.auth),
    authHeaderName: raw.authHeaderName as string | undefined,
  };
}

function asStringArray(v: unknown): string[] | undefined {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : undefined;
}

function asFields(v: unknown): NormalizedField[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v
    .filter((f) => f && typeof f === 'object' && typeof (f as { name?: unknown }).name === 'string')
    .map((f) => {
      const o = f as Record<string, unknown>;
      return {
        name: o.name as string,
        type: (o.type as NormalizedField['type']) ?? 'string',
        required: Boolean(o.required),
        description: o.description as string | undefined,
      };
    });
}

function parseAuth(v: unknown): AuthScheme | undefined {
  if (typeof v !== 'string') return undefined;
  const s = v.toLowerCase();
  if (s.includes('bearer')) return AuthScheme.BEARER;
  if (s.includes('api') && s.includes('key')) return AuthScheme.API_KEY_HEADER;
  if (s.includes('basic')) return AuthScheme.BASIC;
  if (s.includes('oauth')) return AuthScheme.OAUTH2;
  return AuthScheme.CUSTOM;
}

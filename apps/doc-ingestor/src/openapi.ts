import { AuthScheme, ContractKind, type DocumentationContract, type NormalizedField } from '@varys/contracts';

type Json = Record<string, any>;
const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head'];

/**
 * Parse an OpenAPI document into one DocumentationContract per endpoint operation. This is the
 * deterministic ingestion path: §8 produces a partial OpenAPI per endpoint, which we consume
 * directly (no LLM needed when a spec is available).
 */
export function parseOpenApi(spec: Json, vendor: string, apiVersion: string): DocumentationContract[] {
  const out: DocumentationContract[] = [];
  const components = spec.components?.schemas ?? {};
  const securitySchemes = spec.components?.securitySchemes ?? {};
  const globalAuth = resolveAuth(spec.security, securitySchemes);

  for (const [path, pathItem] of Object.entries<Json>(spec.paths ?? {})) {
    for (const method of METHODS) {
      const op = pathItem?.[method];
      if (!op) continue;
      const auth = resolveAuth(op.security, securitySchemes) ?? globalAuth;
      out.push({
        kind: ContractKind.REST,
        vendor,
        apiVersion,
        resourceGroup: op.tags?.[0] ?? firstSegment(path),
        title: op.summary ?? op.operationId ?? `${method.toUpperCase()} ${path}`,
        method: method.toUpperCase() as DocumentationContract['method'],
        path: normalizePath(path),
        requiredQueryParams: queryParams(op.parameters, components, true),
        requestFields: requestFields(op.requestBody, components),
        responseFields: responseFields(op.responses, components),
        auth: auth?.scheme,
        authHeaderName: auth?.headerName,
      });
    }
  }
  return out;
}

function deref(node: Json | undefined, components: Json, depth = 0): Json | undefined {
  if (!node || depth > 6) return node;
  if (typeof node.$ref === 'string') {
    const name = node.$ref.split('/').pop()!;
    return deref(components[name], components, depth + 1);
  }
  return node;
}

function schemaToFields(schema: Json | undefined, components: Json): NormalizedField[] {
  const s = deref(schema, components);
  if (!s || s.type !== 'object' || !s.properties) return [];
  const required = new Set<string>(s.required ?? []);
  return Object.entries<Json>(s.properties).map(([name, prop]) => {
    const p = deref(prop, components) ?? {};
    return { name, type: mapType(p.type, p.format), required: required.has(name), description: p.description };
  });
}

function requestFields(requestBody: Json | undefined, components: Json): NormalizedField[] | undefined {
  const body = deref(requestBody, components);
  const schema = body?.content?.['application/json']?.schema;
  const fields = schemaToFields(schema, components);
  return fields.length ? fields : undefined;
}

function responseFields(responses: Json | undefined, components: Json): NormalizedField[] | undefined {
  if (!responses) return undefined;
  const ok = responses['200'] ?? responses['201'] ?? responses['2XX'] ?? responses.default;
  const schema = deref(ok, components)?.content?.['application/json']?.schema;
  const fields = schemaToFields(schema, components);
  return fields.length ? fields : undefined;
}

function queryParams(parameters: Json[] | undefined, components: Json, requiredOnly: boolean): string[] | undefined {
  if (!Array.isArray(parameters)) return undefined;
  const names = parameters
    .map((p) => deref(p, components))
    .filter((p): p is Json => !!p && p.in === 'query' && (!requiredOnly || p.required))
    .map((p) => p.name as string);
  return names.length ? names : undefined;
}

function resolveAuth(security: Json[] | undefined, schemes: Json): { scheme: AuthScheme; headerName?: string } | undefined {
  if (!Array.isArray(security) || security.length === 0) return undefined;
  const name = Object.keys(security[0] ?? {})[0];
  const def = name ? schemes[name] : undefined;
  if (!def) return undefined;
  if (def.type === 'http' && /bearer/i.test(def.scheme ?? '')) return { scheme: AuthScheme.BEARER, headerName: 'Authorization' };
  if (def.type === 'http' && /basic/i.test(def.scheme ?? '')) return { scheme: AuthScheme.BASIC, headerName: 'Authorization' };
  if (def.type === 'apiKey') return { scheme: AuthScheme.API_KEY_HEADER, headerName: def.name };
  if (def.type === 'oauth2') return { scheme: AuthScheme.OAUTH2, headerName: 'Authorization' };
  return { scheme: AuthScheme.CUSTOM };
}

function mapType(type: string | undefined, format?: string): NormalizedField['type'] {
  if (type === 'integer' || type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';
  if (type === 'array') return 'array';
  if (type === 'object') return 'object';
  if (format === 'date') return 'date';
  if (format === 'date-time') return 'date_time';
  return 'string';
}

function firstSegment(path: string): string {
  return path.replace(/^\//, '').split('/')[0] || 'root';
}

function normalizePath(path: string): string {
  return ('/' + path.replace(/^\//, '')).replace(/\/+/g, '/');
}

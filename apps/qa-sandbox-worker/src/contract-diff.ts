import {
  AuthScheme,
  CONFIDENCE,
  type DocumentationContract,
  FindingCategory,
  type Finding,
  type NormalizedField,
  Severity,
} from '@varys/contracts';
import Ajv from 'ajv';
import type { CapturedRequest } from './host-http';

const ajv = new Ajv({ allErrors: true, strict: false });

function runtimeFinding(p: Omit<Finding, 'confidence' | 'source'>): Finding {
  return { ...p, confidence: CONFIDENCE.DETERMINISTIC, source: 'runtime' };
}

/**
 * Diff an intercepted request against the documentation contract (spec §13 — assert
 * path/method/headers/body against the OpenAPI contract). Deterministic (JSON-Schema via ajv),
 * so findings are confidence 1.0.
 */
export function diffRequestAgainstContract(req: CapturedRequest, contract: DocumentationContract): Finding[] {
  const findings: Finding[] = [];

  if (contract.method && req.method !== contract.method) {
    findings.push(
      runtimeFinding({
        ruleId: 'runtime.method-mismatch',
        severity: Severity.CRITICAL,
        category: FindingCategory.PATH,
        targetPath: req.path,
        message: `Runtime request used ${req.method} but the contract documents ${contract.method}.`,
      }),
    );
  }

  if (contract.path && canon(req.path) !== canon(contract.path)) {
    findings.push(
      runtimeFinding({
        ruleId: 'runtime.path-mismatch',
        severity: Severity.CRITICAL,
        category: FindingCategory.PATH,
        targetPath: req.path,
        message: `Runtime request hit ${req.path} but the contract documents ${contract.path}.`,
      }),
    );
  }

  if (contract.auth && contract.auth !== AuthScheme.NONE) {
    const headerName = (contract.authHeaderName ?? (contract.auth === AuthScheme.BEARER ? 'authorization' : '')).toLowerCase();
    if (headerName && !req.headers[headerName]) {
      findings.push(
        runtimeFinding({
          ruleId: 'runtime.missing-auth-header',
          severity: Severity.CRITICAL,
          category: FindingCategory.AUTH,
          message: `Runtime request omitted the ${contract.authHeaderName ?? headerName} header required for ${contract.auth} auth.`,
        }),
      );
    }
  }

  if (['POST', 'PUT', 'PATCH'].includes(req.method) && contract.requestFields?.length) {
    findings.push(...validateBody(req.body, contract.requestFields));
  }

  return findings;
}

function validateBody(body: unknown, fields: NormalizedField[]): Finding[] {
  const schema = fieldsToJsonSchema(fields);
  const validate = ajv.compile(schema);
  if (validate(body ?? {})) return [];
  return (validate.errors ?? []).slice(0, 20).map((e) =>
    runtimeFinding({
      ruleId: 'runtime.body-schema',
      severity: Severity.CRITICAL,
      category: FindingCategory.SCHEMA,
      targetPath: (e.instancePath || e.schemaPath).replace(/^\//, ''),
      message: `Runtime request body violates the contract: ${e.message} (${e.instancePath || 'root'}).`,
    }),
  );
}

function fieldsToJsonSchema(fields: NormalizedField[]): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const f of fields) {
    properties[f.name] = { type: jsonType(f.type) };
    if (f.required) required.push(f.name);
  }
  return { type: 'object', properties, required, additionalProperties: true };
}

function jsonType(t: NormalizedField['type']): string {
  switch (t) {
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return 'array';
    case 'object':
      return 'object';
    default:
      return 'string';
  }
}

function canon(path: string): string {
  return path
    .replace(/:[A-Za-z0-9_]+/g, '{}')
    .replace(/\{[^}]*\}/g, '{}')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
    .toLowerCase();
}

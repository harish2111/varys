import type { DocumentationContract, ExtractedUnit, NormalizedField } from '@varys/contracts';

/**
 * Build a valid mock input payload that drives the connector (spec §13 — a valid payload
 * honouring constraints). Deterministic: derived from the documented request fields (or the
 * connector input schema) so the mock exercises the real request-building path.
 */
export function buildMockPayload(unit: ExtractedUnit, contract?: DocumentationContract): Record<string, unknown> {
  const fields = contract?.requestFields?.length ? contract.requestFields : unit.inputFields;
  const data: Record<string, unknown> = {};
  for (const f of fields) data[f.name] = sampleValue(f);
  // Supply path-parameter placeholders the execute body interpolates.
  for (const call of unit.httpCalls) {
    for (const m of call.pathTemplate.matchAll(/\{([^}]+)\}/g)) {
      if (data[m[1]] === undefined) data[m[1]] = 'mock-id';
    }
  }
  return data;
}

function sampleValue(f: NormalizedField): unknown {
  switch (f.type) {
    case 'number':
      return 1;
    case 'boolean':
      return true;
    case 'date':
    case 'date_time':
      return '2026-01-01T00:00:00Z';
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return `mock-${f.name}`;
  }
}

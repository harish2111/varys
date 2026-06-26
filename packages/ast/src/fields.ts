import type { NormalizedField } from '@varys/contracts';
import { literalToValue, propName } from './literals';
import { type ScopeIndex, ts } from './source';

const FIELD_TYPES = new Set(['string', 'number', 'date', 'date_time', 'boolean', 'array', 'object']);

/** Convert an array literal of Konnectify `Field` objects into NormalizedField[]. */
export function fieldsFromArrayLiteral(arr: ts.ArrayLiteralExpression, scope: ScopeIndex): NormalizedField[] {
  const out: NormalizedField[] = [];
  for (const el of arr.elements) {
    if (ts.isObjectLiteralExpression(el)) {
      const f = fieldFromObjectLiteral(el, scope);
      if (f) out.push(f);
    }
  }
  return out;
}

function fieldFromObjectLiteral(obj: ts.ObjectLiteralExpression, scope: ScopeIndex): NormalizedField | undefined {
  let name: string | undefined;
  let type: NormalizedField['type'] = 'string';
  let optional: boolean | undefined;
  let of: NormalizedField['type'] | undefined;
  let description: string | undefined;
  let children: NormalizedField[] | undefined;

  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const key = propName(prop.name);
    if (key === 'name') {
      const v = literalToValue(prop.initializer, scope);
      if (typeof v === 'string') name = v;
    } else if (key === 'type') {
      const v = literalToValue(prop.initializer, scope);
      if (typeof v === 'string' && FIELD_TYPES.has(v)) type = v as NormalizedField['type'];
    } else if (key === 'optional') {
      const v = literalToValue(prop.initializer, scope);
      if (typeof v === 'boolean') optional = v;
    } else if (key === 'of') {
      const v = literalToValue(prop.initializer, scope);
      if (typeof v === 'string' && FIELD_TYPES.has(v)) of = v as NormalizedField['type'];
    } else if (key === 'hint' || key === 'label') {
      const v = literalToValue(prop.initializer, scope);
      if (typeof v === 'string' && !description) description = v;
    } else if (key === 'properties' || key === 'propChildren') {
      if (ts.isArrayLiteralExpression(prop.initializer)) {
        children = fieldsFromArrayLiteral(prop.initializer, scope);
      }
    }
  }

  if (!name) return undefined;
  // Konnectify default: a field is required only when explicitly `optional: false`.
  const required = optional === false;
  const field: NormalizedField = { name, type, required };
  if (of) field.of = of;
  if (description) field.description = description;
  if (children && children.length) field.children = children;
  return field;
}

/**
 * Derive a NormalizedField[] from a recovered `sample` object — mirrors the connectors'
 * own flattenAndGenerateSchema intent (one level of structure, types inferred from values).
 * All fields are marked `inferred` since they come from sample data, not declarations.
 */
export function fieldsFromSample(sample: unknown): NormalizedField[] {
  if (!sample || typeof sample !== 'object' || Array.isArray(sample)) return [];
  const out: NormalizedField[] = [];
  for (const [name, value] of Object.entries(sample as Record<string, unknown>)) {
    out.push(fieldFromSampleValue(name, value));
  }
  return out;
}

function fieldFromSampleValue(name: string, value: unknown): NormalizedField {
  const type = inferType(value);
  const field: NormalizedField = { name, type, required: false, inferred: true };
  if (type === 'array' && Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      field.of = 'object';
      field.children = fieldsFromSample(first);
    } else {
      field.of = inferType(first);
    }
  } else if (type === 'object' && value && typeof value === 'object') {
    field.children = fieldsFromSample(value);
  }
  return field;
}

function inferType(value: unknown): NormalizedField['type'] {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (Array.isArray(value)) return 'array';
  if (value && typeof value === 'object') return 'object';
  if (typeof value === 'string' && /\d{4}-\d{2}-\d{2}/.test(value)) return 'date_time';
  return 'string';
}

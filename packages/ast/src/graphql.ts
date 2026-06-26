import type { ExtractedGraphqlOperation } from '@varys/contracts';
import { literalToValue, propName } from './literals';
import { type ScopeIndex, ts } from './source';

/**
 * Parse a GraphQL operation string (as found in the connectors' `dynamicFunctions` maps)
 * into a structured operation. Intentionally lightweight — extracts operation type, name,
 * root field, declared variables, and selected fields without a full GraphQL parser.
 */
export function parseGraphqlOperation(src: string): ExtractedGraphqlOperation | undefined {
  const header = src.match(/\b(query|mutation|subscription)\b\s*([A-Za-z0-9_]*)\s*(\(([^)]*)\))?/);
  if (!header) {
    // Anonymous shorthand `{ ... }` — treat as a query with no name.
    if (/^\s*\{/.test(src)) {
      return {
        operationType: 'query',
        operationName: '',
        rootField: firstRootField(src) ?? '',
        selectedFields: selectedFields(src),
        variables: [],
      };
    }
    return undefined;
  }
  const operationType = header[1] as ExtractedGraphqlOperation['operationType'];
  const operationName = header[2] ?? '';
  const variables = header[4]
    ? Array.from(header[4].matchAll(/\$([A-Za-z0-9_]+)\s*:/g)).map((m) => m[1])
    : [];
  return {
    operationType,
    operationName,
    rootField: firstRootField(src) ?? operationName,
    selectedFields: selectedFields(src),
    variables,
  };
}

function firstRootField(src: string): string | undefined {
  // The first selection inside the outermost braces.
  const braceIdx = src.indexOf('{');
  if (braceIdx < 0) return undefined;
  const after = src.slice(braceIdx + 1);
  const m = after.match(/([A-Za-z_][A-Za-z0-9_]*)/);
  return m?.[1];
}

function selectedFields(src: string): string[] {
  const idents = Array.from(src.matchAll(/([A-Za-z_][A-Za-z0-9_]*)/g)).map((m) => m[1]);
  const stop = new Set(['query', 'mutation', 'subscription', 'input', 'true', 'false', 'null']);
  return Array.from(new Set(idents.filter((i) => !stop.has(i))));
}

/**
 * Find a "GraphQL operation map" const: an object literal whose values are GraphQL operation
 * strings (e.g. `const dynamicFunctions = { getTicketList: '...query...' }`).
 */
export function findGraphqlOperationMaps(scope: ScopeIndex): Map<string, Map<string, ExtractedGraphqlOperation>> {
  const maps = new Map<string, Map<string, ExtractedGraphqlOperation>>();
  for (const [name, expr] of scope.entries()) {
    if (!ts.isObjectLiteralExpression(expr)) continue;
    const ops = new Map<string, ExtractedGraphqlOperation>();
    for (const prop of expr.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const key = propName(prop.name);
      if (!key) continue;
      const value = literalToValue(prop.initializer, scope);
      if (typeof value === 'string' && /\b(query|mutation|subscription)\b|^\s*\{/.test(value)) {
        const op = parseGraphqlOperation(value);
        if (op) ops.set(key, op);
      }
    }
    if (ops.size > 0) maps.set(name, ops);
  }
  return maps;
}

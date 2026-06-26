import { ContractKind, type DocumentationContract, type ExtractedUnit } from '@varys/contracts';

/** Canonicalize a path so `{recording_id}` and `{id}` and `:id` all compare equal. */
export function canonicalizePath(path: string | undefined): string {
  if (!path) return '';
  return path
    .replace(/:[A-Za-z0-9_]+/g, '{}')
    .replace(/\{[^}]*\}/g, '{}')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
    .toLowerCase();
}

/**
 * Pick the best documentation contract for a unit. REST units match on method + canonical
 * path; GraphQL units match on operation name / root field. Returns the matched contract
 * and the remaining candidates.
 */
export function matchContract(
  unit: ExtractedUnit,
  candidates: DocumentationContract[],
): DocumentationContract | undefined {
  if (candidates.length === 0) return undefined;

  if (unit.contractKind === ContractKind.GRAPHQL) {
    const ops = new Set(unit.graphqlOps.flatMap((o) => [o.operationName, o.rootField].filter(Boolean)));
    return (
      candidates.find(
        (c) =>
          c.kind === ContractKind.GRAPHQL &&
          ((c.operationName && ops.has(c.operationName)) || candidates.length === 1),
      ) ?? candidates[0]
    );
  }

  // REST: prefer an exact method + canonical-path match.
  for (const call of unit.httpCalls) {
    const callPath = canonicalizePath(call.pathTemplate);
    const exact = candidates.find(
      (c) => c.kind === ContractKind.REST && c.method === call.method && canonicalizePath(c.path) === callPath,
    );
    if (exact) return exact;
  }
  // Fall back to a same-path (any method) candidate, else the top candidate.
  for (const call of unit.httpCalls) {
    const callPath = canonicalizePath(call.pathTemplate);
    const samePath = candidates.find((c) => c.kind === ContractKind.REST && canonicalizePath(c.path) === callPath);
    if (samePath) return samePath;
  }
  return candidates[0];
}

/** Extract `{param}` names from a path template. */
export function pathParams(path: string | undefined): string[] {
  if (!path) return [];
  return Array.from(path.matchAll(/\{([^}]*)\}/g)).map((m) => m[1]).filter(Boolean);
}

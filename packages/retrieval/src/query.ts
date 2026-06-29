import type { ExtractedUnit } from '@varys/contracts';

/**
 * Build a PostgreSQL `to_tsquery` expression from a unit's path components + method
 * (spec §9.2 — catches exact-URL cases where vectors drift, e.g. `crm & objects & contacts`).
 * Tokens are OR-combined so a partial path still matches; injection-safe (alnum only).
 */
export function buildFtsQuery(unit: ExtractedUnit): string {
  const tokens = new Set<string>();
  for (const call of unit.httpCalls) {
    tokens.add(call.method.toLowerCase());
    for (const seg of call.pathTemplate.split(/[/{}]/)) {
      const t = sanitize(seg);
      if (t) tokens.add(t);
    }
  }
  for (const op of unit.graphqlOps) {
    const t = sanitize(op.rootField);
    if (t) tokens.add(t);
  }
  return [...tokens].join(' | ');
}

function sanitize(s: string): string {
  return s.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

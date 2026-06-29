import { CONFIDENCE, FindingCategory, type Finding, Severity } from '@varys/contracts';

/** Shape of a poll result (subset of the DSL PollResponse). */
export interface PollPass {
  records: Array<Record<string, unknown>>;
  cursor: unknown;
  hasMore?: boolean;
}

/**
 * Two-pass polling verification (spec §13): the first poll (no cursor) must emit a cursor; the
 * second poll (with that cursor) must apply the cursor/time filter and return no duplicates of
 * the first pass. Dedup uses the connector convention (a `dedup` key, falling back to `id`).
 */
export function verifyPolling(
  pass1: PollPass,
  pass2: PollPass,
  dedup: (r: Record<string, unknown>) => string = defaultDedup,
): Finding[] {
  const findings: Finding[] = [];

  const cursorOut = pass1.cursor;
  const cursorPresent = cursorOut !== undefined && cursorOut !== null && !(typeof cursorOut === 'object' && Object.keys(cursorOut as object).length === 0);
  if (!cursorPresent && (pass1.hasMore ?? pass1.records.length > 0)) {
    findings.push({
      ruleId: 'runtime.poll-no-cursor',
      severity: Severity.CRITICAL,
      category: FindingCategory.PAGINATION,
      confidence: CONFIDENCE.DETERMINISTIC,
      source: 'runtime',
      message: 'First poll returned records but no cursor; the trigger cannot page forward and will re-fetch duplicates.',
    });
  }

  const firstIds = new Set(pass1.records.map(dedup));
  const dupes = pass2.records.map(dedup).filter((id) => firstIds.has(id));
  if (dupes.length > 0) {
    findings.push({
      ruleId: 'runtime.poll-duplicates',
      severity: Severity.WARNING,
      category: FindingCategory.PAGINATION,
      confidence: CONFIDENCE.DETERMINISTIC,
      source: 'runtime',
      message: `Second poll (with cursor) returned ${dupes.length} record(s) already seen in the first poll; the cursor filter is not applied correctly.`,
      details: { duplicateIds: dupes.slice(0, 10) },
    });
  }

  return findings;
}

function defaultDedup(r: Record<string, unknown>): string {
  return String(r.id ?? r.uuid ?? JSON.stringify(r));
}

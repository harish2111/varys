import { type AggregateJob, RunStatus, Severity } from '@varys/contracts';
import { getDb, validationFindings, validationRuns, withOrg } from '@varys/db';
import { eq } from 'drizzle-orm';

/**
 * Report roll-up (spec §5.5): collects the run's findings, generates a consolidated Markdown
 * report (LangGraph §5.5), and marks the run complete.
 */
export class AggregatorService {
  async process(job: AggregateJob): Promise<void> {
    const db = getDb();
    await withOrg(job.orgId, async (tx) => {
      const [run] = await tx.select().from(validationRuns).where(eq(validationRuns.id, job.runId)).limit(1);
      if (!run || run.status === RunStatus.FAILED || run.status === RunStatus.COMPLETED) return;

      const findings = await tx
        .select({
          severity: validationFindings.severity,
          ruleId: validationFindings.ruleId,
          category: validationFindings.category,
          source: validationFindings.source,
          message: validationFindings.message,
          targetPath: validationFindings.targetPath,
          confidenceScore: validationFindings.confidenceScore,
          hitl: validationFindings.hitl,
        })
        .from(validationFindings)
        .where(eq(validationFindings.runId, job.runId));

      const critical = findings.filter((f) => f.severity === Severity.CRITICAL).length;
      const warnings = findings.filter((f) => f.severity === Severity.WARNING).length;
      const reportMd = buildMarkdownReport(job.runId, findings, critical, warnings);

      await tx
        .update(validationRuns)
        .set({
          status: RunStatus.COMPLETED,
          phase: null,
          completedAt: new Date(),
          updatedAt: new Date(),
          reportMd,
          error: critical > 0 ? `${critical} critical finding(s)` : null,
        })
        .where(eq(validationRuns.id, job.runId));
    }, db);
  }
}

interface FindingRow {
  severity: string;
  ruleId: string;
  category: string;
  source: string;
  message: string;
  targetPath: string | null;
  confidenceScore: string | number;
  hitl: boolean;
}

function buildMarkdownReport(runId: string, findings: FindingRow[], critical: number, warnings: number): string {
  const now = new Date().toISOString();
  const total = findings.length;
  const info = total - critical - warnings;

  const lines: string[] = [
    `# Varys Validation Report`,
    ``,
    `**Run ID:** \`${runId}\`  `,
    `**Generated:** ${now}  `,
    `**Total Findings:** ${total} (${critical} critical · ${warnings} warnings · ${info} info)`,
    ``,
    `---`,
    ``,
  ];

  if (total === 0) {
    lines.push('> No findings — all validated elements passed.');
    return lines.join('\n');
  }

  // Group by severity
  for (const sev of [Severity.CRITICAL, Severity.WARNING, Severity.INFO]) {
    const group = findings.filter((f) => f.severity === sev);
    if (group.length === 0) continue;

    lines.push(`## ${sev} (${group.length})`);
    lines.push('');

    for (const f of group) {
      const location = f.targetPath ? ` — \`${f.targetPath}\`` : '';
      const confidence = `${(Number(f.confidenceScore) * 100).toFixed(0)}%`;
      const hitlBadge = f.hitl ? ' ⚠️ HITL' : '';
      lines.push(`### ${f.ruleId}${location}`);
      lines.push('');
      lines.push(`**Category:** ${f.category}  **Source:** ${f.source}  **Confidence:** ${confidence}${hitlBadge}`);
      lines.push('');
      lines.push(f.message);
      lines.push('');
    }
  }

  return lines.join('\n');
}

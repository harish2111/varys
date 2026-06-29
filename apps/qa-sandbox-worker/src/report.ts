import { Severity } from '@varys/contracts';
import type { ValidationState } from './workflow/state';

/**
 * Build a per-element Markdown section from the completed ValidationState. These sections
 * are stored individually and concatenated by the aggregator into the consolidated report.
 */
export function buildElementReport(state: ValidationState): string {
  const statusIcon = state.finalStatus === 'PASS' ? '✅' : state.finalStatus === 'WARNING' ? '⚠️' : '❌';
  const lines: string[] = [
    `## ${statusIcon} ${state.elementType}: \`${state.elementName}\``,
    '',
  ];

  if (state.runtimeError) {
    lines.push(`**Runtime error:** ${state.runtimeError}`);
    if (state.runtimeOom) lines.push('> Out-of-memory: the connector exceeded the 128 MB isolate limit.');
    if (state.runtimeTimeout) lines.push('> Timeout: the connector exceeded the 2 000 ms CPU limit.');
    lines.push('');
  }

  if (state.deterministicFindings.length > 0) {
    lines.push('### Deterministic Findings');
    lines.push('');
    for (const f of state.deterministicFindings) {
      const loc = f.targetPath ? ` (\`${f.targetPath}\`)` : '';
      const badge =
        f.severity === Severity.CRITICAL
          ? '🔴 CRITICAL'
          : f.severity === Severity.WARNING
            ? '🟡 WARNING'
            : 'ℹ️ INFO';
      lines.push(`- **${badge}** \`${f.ruleId}\`${loc}: ${f.message}`);
    }
    lines.push('');
  }

  if (state.llmAnalysis) {
    lines.push('### LLM Analysis');
    lines.push('');
    lines.push(state.llmAnalysis.analysis);
    if (state.llmAnalysis.rootCause) lines.push(`\n**Root cause:** ${state.llmAnalysis.rootCause}`);
    if (state.llmAnalysis.suggestedFix) lines.push(`\n**Suggested fix:** ${state.llmAnalysis.suggestedFix}`);
    lines.push('');
  }

  if (state.retryCount > 0) {
    lines.push(`> *Payload regenerated ${state.retryCount} time(s).*`);
    lines.push('');
  }

  return lines.join('\n');
}

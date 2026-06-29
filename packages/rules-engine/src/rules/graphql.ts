import { CONFIDENCE, ContractKind, FindingCategory, type Finding, Severity } from '@varys/contracts';
import type { Rule, RuleContext } from '../types';

/** GraphQL operations must exist in the schema and supply all required variables. */
export class GraphqlOperationRule implements Rule {
  readonly id = 'graphql.operation';
  readonly requiresContract = true;

  evaluate({ unit, contract }: RuleContext): Finding[] {
    if (!contract || contract.kind !== ContractKind.GRAPHQL) return [];
    const findings: Finding[] = [];
    for (const op of unit.graphqlOps) {
      if (contract.operationName && op.operationName && contract.operationName !== op.operationName) continue;

      if (contract.requiredVariables) {
        const provided = new Set(op.variables);
        for (const reqVar of contract.requiredVariables) {
          if (!provided.has(reqVar)) {
            findings.push({
              ruleId: this.id,
              severity: Severity.CRITICAL,
              category: FindingCategory.SCHEMA,
              confidence: CONFIDENCE.DETERMINISTIC,
              source: 'deterministic',
              targetPath: op.operationName,
              message: `GraphQL operation "${op.operationName || op.rootField}" omits required variable $${reqVar}.`,
            });
          }
        }
      }

      if (contract.availableFields && contract.availableFields.length > 0) {
        const available = new Set(contract.availableFields);
        const unknown = op.selectedFields.filter(
          (f) => f !== op.rootField && f !== op.operationName && !available.has(f) && !/^(query|mutation|input|listInfo)$/.test(f),
        );
        if (unknown.length > 0) {
          findings.push({
            ruleId: this.id,
            severity: Severity.WARNING,
            category: FindingCategory.SCHEMA,
            confidence: CONFIDENCE.DETERMINISTIC,
            source: 'deterministic',
            targetPath: op.rootField,
            message: `GraphQL operation "${op.rootField}" selects field(s) not present in the documented schema: ${unknown.slice(0, 8).join(', ')}.`,
            details: { unknownFields: unknown },
          });
        }
      }
    }
    return findings;
  }
}

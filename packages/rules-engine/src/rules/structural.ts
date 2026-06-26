import {
  AuthScheme,
  CONFIDENCE,
  ElementType,
  FindingCategory,
  type Finding,
  Severity,
} from '@varys/contracts';
import type { Rule, RuleContext } from '../types';

/** An action that issues no HTTP/GraphQL call cannot perform work — guaranteed no-op. */
export class UnitHasOperationRule implements Rule {
  readonly id = 'structural.no-operation';
  readonly requiresContract = false;

  evaluate({ unit }: RuleContext): Finding[] {
    if (unit.elementType !== ElementType.ACTION) return [];
    if (unit.httpCalls.length > 0 || unit.graphqlOps.length > 0) return [];
    return [
      {
        ruleId: this.id,
        severity: Severity.CRITICAL,
        category: FindingCategory.PATH,
        confidence: CONFIDENCE.DETERMINISTIC,
        source: 'deterministic',
        message: `Action "${unit.name}" issues no HTTP or GraphQL call; it cannot execute against any API.`,
      },
    ];
  }
}

/** When the connection requires auth but no call injects any credential, flag it. */
export class AuthPresenceRule implements Rule {
  readonly id = 'structural.missing-auth';
  readonly requiresContract = false;

  evaluate({ connector, unit }: RuleContext): Finding[] {
    const requiresAuth = connector.connection.authType === 'credentials' || connector.connection.authType === 'oauth2' || connector.connection.authType === 'client_credentials';
    if (!requiresAuth || unit.httpCalls.length === 0) return [];
    const anyAuth = unit.httpCalls.some((c) => c.authScheme !== AuthScheme.NONE);
    if (anyAuth) return [];
    return [
      {
        ruleId: this.id,
        severity: Severity.WARNING,
        category: FindingCategory.AUTH,
        confidence: CONFIDENCE.DETERMINISTIC,
        source: 'deterministic',
        message: `Unit "${unit.name}" makes HTTP calls but injects no authentication header, though the connection declares ${connector.connection.authType} auth.`,
      },
    ];
  }
}

/** List-style actions that expose no pagination control (best-practice annotation). */
export class PaginationHintRule implements Rule {
  readonly id = 'structural.no-pagination';
  readonly requiresContract = false;

  evaluate({ unit }: RuleContext): Finding[] {
    const looksLikeList = /^(list|get_all|search)/i.test(unit.key) || /list|search/i.test(unit.name);
    if (!looksLikeList || unit.httpCalls.length === 0) return [];
    const hasPagination = unit.httpCalls.some((c) =>
      c.queryParams.some((q) => /page|cursor|offset|limit|per_page/i.test(q)),
    );
    if (hasPagination) return [];
    return [
      {
        ruleId: this.id,
        severity: Severity.INFO,
        category: FindingCategory.PAGINATION,
        confidence: CONFIDENCE.DETERMINISTIC,
        source: 'deterministic',
        message: `List-style action "${unit.name}" exposes no pagination parameter; verify it handles large result sets.`,
      },
    ];
  }
}

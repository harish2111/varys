import {
  type DocumentationContract,
  type ExtractedConnector,
  type ExtractedUnit,
  type Finding,
  Severity,
  type UnitFindings,
} from '@varys/contracts';
import { matchContract } from './match';
import { GraphqlOperationRule } from './rules/graphql';
import { AuthSchemeRule, MethodPathRule, RequiredPathParamRule, SchemaSubtypeRule } from './rules/rest';
import { AuthPresenceRule, PaginationHintRule, UnitHasOperationRule } from './rules/structural';
import type { Rule, RuleContext } from './types';

/** Default rule set (spec §11). Structural rules run with or without a contract. */
export function defaultRules(): Rule[] {
  return [
    new UnitHasOperationRule(),
    new AuthPresenceRule(),
    new PaginationHintRule(),
    new MethodPathRule(),
    new RequiredPathParamRule(),
    new AuthSchemeRule(),
    new SchemaSubtypeRule(),
    new GraphqlOperationRule(),
  ];
}

/**
 * The deterministic validation engine (spec §11). Runs the rule set over a unit; a CRITICAL
 * finding marks the unit for short-circuit (straight to the report, no LLM spend, §6 Phase 2).
 */
export class DeterministicEngine {
  private readonly rules: Rule[];

  constructor(rules: Rule[] = defaultRules()) {
    this.rules = rules;
  }

  evaluateUnit(connector: ExtractedConnector, unit: ExtractedUnit, candidates: DocumentationContract[] = []): UnitFindings {
    const contract = matchContract(unit, candidates);
    const ctx: RuleContext = { connector, unit, contract, candidates };

    const findings: Finding[] = [];
    for (const rule of this.rules) {
      if (rule.requiresContract && !contract) continue;
      findings.push(...rule.evaluate(ctx));
    }

    return {
      elementKey: unit.key,
      elementName: unit.name,
      findings,
      shortCircuited: findings.some((f) => f.severity === Severity.CRITICAL),
    };
  }

  evaluateConnector(
    connector: ExtractedConnector,
    contractsByUnit: Map<string, DocumentationContract[]> = new Map(),
  ): UnitFindings[] {
    return connector.units.map((u) => this.evaluateUnit(connector, u, contractsByUnit.get(u.key) ?? []));
  }
}

export function hasCritical(findings: Finding[]): boolean {
  return findings.some((f) => f.severity === Severity.CRITICAL);
}

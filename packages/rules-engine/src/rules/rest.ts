import {
  AuthScheme,
  CONFIDENCE,
  ContractKind,
  FindingCategory,
  type Finding,
  type NormalizedField,
  Severity,
} from '@varys/contracts';
import { canonicalizePath } from '../match';
import type { Rule, RuleContext } from '../types';

function det(partial: Omit<Finding, 'confidence' | 'source'>): Finding {
  return { ...partial, confidence: CONFIDENCE.DETERMINISTIC, source: 'deterministic' };
}

/** Method + endpoint must match the documented contract (spec §11 CRITICAL cases). */
export class MethodPathRule implements Rule {
  readonly id = 'rest.method-path';
  readonly requiresContract = true;

  evaluate({ unit, contract }: RuleContext): Finding[] {
    if (!contract || contract.kind !== ContractKind.REST) return [];
    const findings: Finding[] = [];
    const contractPath = canonicalizePath(contract.path);
    for (const call of unit.httpCalls) {
      const callPath = canonicalizePath(call.pathTemplate);
      if (callPath === contractPath) {
        if (contract.method && call.method !== contract.method) {
          findings.push(
            det({
              ruleId: this.id,
              severity: Severity.CRITICAL,
              category: FindingCategory.PATH,
              targetPath: call.pathTemplate,
              message: `HTTP method mismatch on ${call.pathTemplate}: connector uses ${call.method}, documentation specifies ${contract.method}.`,
              details: { connectorMethod: call.method, documentedMethod: contract.method },
            }),
          );
        }
      }
    }
    return findings;
  }
}

/** Every documented path parameter must be supplied by the connector's path template. */
export class RequiredPathParamRule implements Rule {
  readonly id = 'rest.missing-path-param';
  readonly requiresContract = true;

  evaluate({ unit, contract }: RuleContext): Finding[] {
    if (!contract || contract.kind !== ContractKind.REST || !contract.path) return [];
    const docSegments = segments(contract.path);
    const findings: Finding[] = [];
    for (const call of unit.httpCalls) {
      if (canonicalizePath(call.pathTemplate) !== canonicalizePath(contract.path)) continue;
      const callSegments = segments(call.pathTemplate);
      // Same canonical path guarantees alignment, but a defensive count check catches drift.
      docSegments.forEach((seg, i) => {
        if (isParam(seg) && !isParam(callSegments[i] ?? '')) {
          findings.push(
            det({
              ruleId: this.id,
              severity: Severity.CRITICAL,
              category: FindingCategory.PATH,
              targetPath: call.pathTemplate,
              message: `Missing required path parameter ${seg} on ${contract.path}.`,
            }),
          );
        }
      });
    }
    return findings;
  }
}

/** If the documentation requires a specific auth scheme, the connector must inject it. */
export class AuthSchemeRule implements Rule {
  readonly id = 'rest.auth-mismatch';
  readonly requiresContract = true;

  evaluate({ unit, contract }: RuleContext): Finding[] {
    if (!contract || contract.kind !== ContractKind.REST || !contract.auth || contract.auth === AuthScheme.NONE) {
      return [];
    }
    const findings: Finding[] = [];
    for (const call of unit.httpCalls) {
      if (canonicalizePath(call.pathTemplate) !== canonicalizePath(contract.path)) continue;
      if (call.authScheme !== contract.auth) {
        findings.push(
          det({
            ruleId: this.id,
            severity: Severity.CRITICAL,
            category: FindingCategory.AUTH,
            targetPath: call.pathTemplate,
            message: `Auth scheme mismatch on ${call.pathTemplate}: connector injects ${call.authScheme}, documentation requires ${contract.auth}.`,
            details: { connectorAuth: call.authScheme, documentedAuth: contract.auth },
          }),
        );
      }
    }
    return findings;
  }
}

/** Required request fields must be present + required + type-compatible in the connector. */
export class SchemaSubtypeRule implements Rule {
  readonly id = 'rest.schema-subtype';
  readonly requiresContract = true;

  evaluate({ unit, contract }: RuleContext): Finding[] {
    if (!contract || !contract.requestFields || contract.requestFields.length === 0) return [];
    const findings: Finding[] = [];
    const connectorByName = new Map(unit.inputFields.map((f) => [f.name, f]));

    for (const docField of contract.requestFields) {
      const cf = connectorByName.get(docField.name);
      if (docField.required && !cf) {
        findings.push(
          det({
            ruleId: this.id,
            severity: Severity.CRITICAL,
            category: FindingCategory.SCHEMA,
            targetPath: docField.name,
            message: `Required field "${docField.name}" is missing from the connector input schema.`,
          }),
        );
        continue;
      }
      if (!cf) {
        findings.push(
          det({
            ruleId: this.id,
            severity: Severity.WARNING,
            category: FindingCategory.SCHEMA,
            targetPath: docField.name,
            message: `Optional field "${docField.name}" documented by the API is absent from the connector.`,
          }),
        );
        continue;
      }
      if (!typeCompatible(cf, docField)) {
        findings.push(
          det({
            ruleId: this.id,
            severity: Severity.CRITICAL,
            category: FindingCategory.SCHEMA,
            targetPath: docField.name,
            message: `Type mismatch on "${docField.name}": connector declares ${cf.type}, documentation specifies ${docField.type}.`,
            details: { connectorType: cf.type, documentedType: docField.type },
          }),
        );
      }
    }

    // Connector fields not present in the documentation (drift).
    const docNames = new Set(contract.requestFields.map((f) => f.name));
    for (const cf of unit.inputFields) {
      if (!docNames.has(cf.name)) {
        findings.push(
          det({
            ruleId: this.id,
            severity: Severity.WARNING,
            category: FindingCategory.SCHEMA,
            targetPath: cf.name,
            message: `Connector field "${cf.name}" is not present in the documented API contract.`,
          }),
        );
      }
    }
    return findings;
  }
}

// ---- helpers ----------------------------------------------------------------

function segments(path: string): string[] {
  return path.replace(/^\//, '').split('/');
}
function isParam(seg: string): boolean {
  return /^\{.*\}$/.test(seg) || /^:.+/.test(seg);
}

/** Numeric/integer vs string is the canonical incompatibility (spec §11 example). */
function typeCompatible(connector: NormalizedField, doc: NormalizedField): boolean {
  if (connector.type === doc.type) return true;
  // date/date_time are carried over the wire as strings — treat as compatible.
  const stringy = new Set(['string', 'date', 'date_time']);
  if (stringy.has(connector.type) && stringy.has(doc.type)) return true;
  return false;
}

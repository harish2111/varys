import {
  ContractKind,
  ElementType,
  type ExtractedConnection,
  type ExtractedConnector,
  type ExtractedGraphqlOperation,
  type ExtractedHttpCall,
  type ExtractedUnit,
  type ExtractionDiagnostic,
  type NormalizedField,
} from '@varys/contracts';
import { fieldsFromArrayLiteral, fieldsFromSample } from './fields';
import { findGraphqlOperationMaps } from './graphql';
import { HttpResolver } from './http';
import { stableHash } from './hash';
import { literalToValue, propName } from './literals';
import {
  type ScopeIndex,
  buildScopeIndex,
  collectCalls,
  findReturnedArray,
  parseConnector,
  resolveExpr,
  ts,
} from './source';

const TRIGGER_TYPE_TO_ELEMENT: Record<string, ElementType> = {
  poll: ElementType.POLLING_TRIGGER,
  webhook: ElementType.WEBHOOK_TRIGGER,
  static_webhook: ElementType.WEBHOOK_TRIGGER,
  streaming: ElementType.WEBHOOK_TRIGGER,
};

/**
 * Extract a normalized {@link ExtractedConnector} from a Konnectify connector's source.
 * Pure static analysis — the connector is never executed (spec §10).
 */
export function extractConnector(source: string, fileName = 'connector.ts'): ExtractedConnector {
  const sf = parseConnector(source, fileName);
  const scope = buildScopeIndex(sf);
  const diagnostics: ExtractionDiagnostic[] = [];

  const appObj = findAppObject(scope, sf);
  if (!appObj) {
    throw new Error('No Konnectify `App` object found in connector source (expected an object with actions/triggers/connection).');
  }

  const appId = strProp(appObj, 'id', scope) ?? 'unknown';
  const name = strProp(appObj, 'name', scope) ?? appId;
  const version = strProp(appObj, 'version', scope) ?? '0.0.0';
  const namespace = appId;

  const resolver = new HttpResolver(sf, scope);
  const graphqlMaps = findGraphqlOperationMaps(scope);
  const funcs = collectFunctions(sf, scope);

  const connection = extractConnection(appObj, scope);
  const baseUrls = collectBaseUrls(scope);

  const units: ExtractedUnit[] = [];

  // Actions
  const actionsObj = objProp(appObj, 'actions', scope);
  if (actionsObj) {
    for (const { key, value } of objectEntries(actionsObj, scope)) {
      const unit = buildUnit(key, value, ElementType.ACTION, undefined, resolver, graphqlMaps, scope, diagnostics);
      if (unit) units.push(unit);
    }
  }

  // Triggers (object literals OR factory call expressions)
  const triggersObj = objProp(appObj, 'triggers', scope);
  if (triggersObj) {
    for (const { key, valueExpr } of objectEntryExprs(triggersObj, scope)) {
      const resolvedValue = resolveTriggerValue(valueExpr, scope, funcs);
      if (!resolvedValue) {
        diagnostics.push({ level: 'warning', message: `Trigger '${key}' could not be statically resolved`, unitKey: key });
        continue;
      }
      const triggerType = strProp(resolvedValue, 'type', scope);
      const elementType = triggerType
        ? TRIGGER_TYPE_TO_ELEMENT[triggerType] ?? ElementType.WEBHOOK_TRIGGER
        : ElementType.WEBHOOK_TRIGGER;
      const unit = buildUnit(key, resolvedValue, elementType, triggerType, resolver, graphqlMaps, scope, diagnostics);
      if (unit) units.push(unit);
    }
  }

  const hasGraphql = units.some((u) => u.graphqlOps.length > 0);
  const hasRest = units.some((u) => u.httpCalls.length > 0);
  const contractKind = hasGraphql && !hasRest ? ContractKind.GRAPHQL : ContractKind.REST;
  for (const u of units) {
    u.contractKind = u.graphqlOps.length > 0 ? ContractKind.GRAPHQL : ContractKind.REST;
  }

  return {
    appId,
    name,
    version,
    namespace,
    baseUrls,
    connection,
    contractKind,
    units,
    diagnostics,
  };
}

function buildUnit(
  key: string,
  unitObj: ts.ObjectLiteralExpression,
  elementType: ElementType,
  triggerType: string | undefined,
  resolver: HttpResolver,
  graphqlMaps: Map<string, Map<string, ExtractedGraphqlOperation>>,
  scope: ScopeIndex,
  diagnostics: ExtractionDiagnostic[],
): ExtractedUnit | undefined {
  const id = strProp(unitObj, 'id', scope) ?? key;
  const name = strProp(unitObj, 'name', scope) ?? key;
  const title = strProp(unitObj, 'title', scope);

  const inputFields = extractInputFields(unitObj, scope);
  const { outputFields, outputSample } = extractOutput(unitObj, scope);

  const httpCalls = resolver.extractFromBody(unitObj, scope);
  const graphqlOps = extractGraphqlOps(unitObj, resolver, graphqlMaps, scope);

  if (inputFields.length === 0 && outputFields.length === 0) {
    diagnostics.push({
      level: 'info',
      message: `Unit '${key}' has no statically-resolvable schema (likely dynamically generated)`,
      unitKey: key,
    });
  }

  const unit: ExtractedUnit = {
    key,
    id,
    name,
    title,
    elementType,
    triggerType,
    contractKind: graphqlOps.length > 0 ? ContractKind.GRAPHQL : ContractKind.REST,
    inputFields,
    outputFields,
    outputSample,
    httpCalls,
    graphqlOps,
    astHash: '',
  };
  unit.astHash = stableHash({
    elementType,
    inputFields,
    outputFields,
    httpCalls: httpCalls.map((c) => ({ m: c.method, p: c.pathTemplate, a: c.authScheme })),
    graphqlOps: graphqlOps.map((g) => ({ t: g.operationType, n: g.operationName, r: g.rootField })),
  });
  return unit;
}

function extractInputFields(unitObj: ts.ObjectLiteralExpression, scope: ScopeIndex): NormalizedField[] {
  const inputSchema = objProp(unitObj, 'input_schema', scope);
  if (!inputSchema) return [];
  const fieldsExpr = propExpr(inputSchema, 'fields');
  const arr = findReturnedArray(fieldsExpr, scope);
  return arr ? fieldsFromArrayLiteral(arr, scope) : [];
}

function extractOutput(
  unitObj: ts.ObjectLiteralExpression,
  scope: ScopeIndex,
): { outputFields: NormalizedField[]; outputSample?: Record<string, unknown> } {
  // Prefer an explicit `sample` object.
  const sampleExpr = propExpr(unitObj, 'sample');
  if (sampleExpr) {
    const resolved = resolveExpr(sampleExpr, scope);
    if (ts.isObjectLiteralExpression(resolved)) {
      const v = literalToValue(resolved, scope);
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        return { outputFields: fieldsFromSample(v), outputSample: v as Record<string, unknown> };
      }
    }
  }

  // Otherwise inspect output_schema.fields for flatten(sample) or a literal Field[].
  const outputSchema = objProp(unitObj, 'output_schema', scope);
  if (outputSchema) {
    const fieldsExpr = propExpr(outputSchema, 'fields');
    const arr = findReturnedArray(fieldsExpr, scope);
    if (arr) return { outputFields: fieldsFromArrayLiteral(arr, scope) };
    // Look for a flatten-style call with a recoverable object/identifier argument.
    const sample = findFlattenSampleArg(fieldsExpr, scope);
    if (sample) return { outputFields: fieldsFromSample(sample), outputSample: sample as Record<string, unknown> };
  }
  return { outputFields: [] };
}

function findFlattenSampleArg(expr: ts.Expression | undefined, scope: ScopeIndex): unknown {
  if (!expr) return undefined;
  const resolved = resolveExpr(expr, scope);
  for (const call of collectCalls(resolved)) {
    if (
      ts.isIdentifier(call.expression) &&
      /flatten|generate.*schema|schema/i.test(call.expression.text) &&
      call.arguments[0]
    ) {
      const v = literalToValue(call.arguments[0], scope);
      if (v && typeof v === 'object') return v;
    }
  }
  return undefined;
}

function extractGraphqlOps(
  unitObj: ts.ObjectLiteralExpression,
  resolver: HttpResolver,
  graphqlMaps: Map<string, Map<string, ExtractedGraphqlOperation>>,
  scope: ScopeIndex,
): ExtractedGraphqlOperation[] {
  const ops: ExtractedGraphqlOperation[] = [];
  const seen = new Set<string>();
  for (const call of collectCalls(unitObj)) {
    const callee = call.expression;
    if (!ts.isIdentifier(callee)) continue;
    const queryIdx = resolver.isGraphqlHelper(callee.text);
    if (queryIdx === undefined) continue;
    const arg = call.arguments[queryIdx];
    if (!arg) continue;
    const v = literalToValue(arg, scope);
    if (typeof v !== 'string') continue;
    for (const map of graphqlMaps.values()) {
      const op = map.get(v);
      if (op && !seen.has(op.operationName + op.rootField)) {
        seen.add(op.operationName + op.rootField);
        ops.push(op);
      }
    }
  }
  return ops;
}

// ---- App / object navigation -----------------------------------------------

function findAppObject(scope: ScopeIndex, sf: ts.SourceFile): ts.ObjectLiteralExpression | undefined {
  // Prefer a declaration explicitly typed `: App`.
  for (const stmt of sf.statements) {
    if (ts.isVariableStatement(stmt)) {
      for (const d of stmt.declarationList.declarations) {
        if (d.type && ts.isTypeReferenceNode(d.type) && ts.isIdentifier(d.type.typeName) && d.type.typeName.text === 'App' && d.initializer) {
          const r = resolveExpr(d.initializer, scope);
          if (ts.isObjectLiteralExpression(r)) return r;
        }
      }
    }
  }
  // Fallback: any object literal that looks like an App.
  for (const expr of scope.values()) {
    const r = resolveExpr(expr, scope);
    if (ts.isObjectLiteralExpression(r) && looksLikeApp(r)) return r;
  }
  return undefined;
}

function looksLikeApp(obj: ts.ObjectLiteralExpression): boolean {
  const keys = new Set(obj.properties.map((p) => (p.name ? propName(p.name) : undefined)));
  let score = 0;
  for (const k of ['actions', 'triggers', 'connection', 'methods', 'id']) if (keys.has(k)) score++;
  return score >= 2;
}

function extractConnection(appObj: ts.ObjectLiteralExpression, scope: ScopeIndex): ExtractedConnection {
  const conn = objProp(appObj, 'connection', scope);
  if (!conn) return { authType: 'unknown', fieldNames: [] };
  let authType: ExtractedConnection['authType'] = 'unknown';
  const auth = objProp(conn, 'auth', scope);
  if (auth) {
    const t = strProp(auth, 'type', scope);
    if (t === 'credentials' || t === 'oauth2' || t === 'client_credentials') authType = t;
  }
  const fieldNames: string[] = [];
  const fieldsExpr = propExpr(conn, 'fields');
  const arr = fieldsExpr ? findReturnedArray(fieldsExpr, scope) ?? (ts.isArrayLiteralExpression(resolveExpr(fieldsExpr, scope)) ? (resolveExpr(fieldsExpr, scope) as ts.ArrayLiteralExpression) : undefined) : undefined;
  if (arr) {
    for (const el of arr.elements) {
      if (ts.isObjectLiteralExpression(el)) {
        const n = strProp(el, 'name', scope);
        if (n) fieldNames.push(n);
      }
    }
  }
  return { authType, fieldNames };
}

function collectBaseUrls(scope: ScopeIndex): string[] {
  const urls = new Set<string>();
  for (const expr of scope.values()) {
    collectUrlStrings(expr, scope, urls);
  }
  return [...urls];
}

function collectUrlStrings(expr: ts.Expression, scope: ScopeIndex, out: Set<string>): void {
  const v = literalToValue(expr, scope);
  const visit = (val: unknown) => {
    if (typeof val === 'string' && /^https?:\/\//.test(val)) out.add(val);
    else if (Array.isArray(val)) val.forEach(visit);
    else if (val && typeof val === 'object') Object.values(val).forEach(visit);
  };
  visit(v);
}

type FunctionLike = ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression;

function collectFunctions(sf: ts.SourceFile, scope: ScopeIndex): Map<string, FunctionLike> {
  const funcs = new Map<string, FunctionLike>();
  for (const stmt of sf.statements) {
    if (ts.isFunctionDeclaration(stmt) && stmt.name && stmt.body) {
      funcs.set(stmt.name.text, stmt);
    }
  }
  for (const [name, expr] of scope.entries()) {
    const r = resolveExpr(expr, scope);
    if (ts.isArrowFunction(r) || ts.isFunctionExpression(r)) funcs.set(name, r);
  }
  return funcs;
}

function resolveTriggerValue(
  expr: ts.Expression,
  scope: ScopeIndex,
  funcs: Map<string, FunctionLike>,
): ts.ObjectLiteralExpression | undefined {
  const resolved = resolveExpr(expr, scope);
  if (ts.isObjectLiteralExpression(resolved)) return resolved;
  // Factory call: createFathomWebhook(...) -> resolve the factory's returned object literal.
  if (ts.isCallExpression(resolved) && ts.isIdentifier(resolved.expression)) {
    const fn = funcs.get(resolved.expression.text);
    if (fn) return findReturnedObjectLiteral(fn, scope);
  }
  return undefined;
}

function findReturnedObjectLiteral(fn: FunctionLike, scope: ScopeIndex): ts.ObjectLiteralExpression | undefined {
  const body = fn.body;
  if (!body) return undefined;
  if (ts.isParenthesizedExpression(body) && ts.isObjectLiteralExpression(body.expression)) return body.expression;
  if (ts.isObjectLiteralExpression(body)) return body;
  if (ts.isBlock(body)) {
    for (const stmt of body.statements) {
      if (ts.isReturnStatement(stmt) && stmt.expression) {
        let e: ts.Expression = stmt.expression;
        // unwrap `... as any as WebhookTrigger`
        while (ts.isAsExpression(e) || ts.isParenthesizedExpression(e)) e = e.expression;
        if (ts.isObjectLiteralExpression(e)) return e;
      }
    }
  }
  return undefined;
}

// ---- small accessors --------------------------------------------------------

function propExpr(obj: ts.ObjectLiteralExpression, key: string): ts.Expression | undefined {
  for (const p of obj.properties) {
    if (ts.isPropertyAssignment(p) && propName(p.name) === key) return p.initializer;
    if (ts.isMethodDeclaration(p) && propName(p.name) === key) {
      // method shorthand: treat as arrow-equivalent by wrapping — return undefined (handled elsewhere)
      return undefined;
    }
  }
  return undefined;
}

function objProp(obj: ts.ObjectLiteralExpression, key: string, scope: ScopeIndex): ts.ObjectLiteralExpression | undefined {
  const e = propExpr(obj, key);
  if (!e) return undefined;
  const r = resolveExpr(e, scope);
  return ts.isObjectLiteralExpression(r) ? r : undefined;
}

function strProp(obj: ts.ObjectLiteralExpression, key: string, scope: ScopeIndex): string | undefined {
  const e = propExpr(obj, key);
  if (!e) return undefined;
  const v = literalToValue(e, scope);
  return typeof v === 'string' ? v : undefined;
}

function objectEntries(obj: ts.ObjectLiteralExpression, scope: ScopeIndex): { key: string; value: ts.ObjectLiteralExpression }[] {
  const out: { key: string; value: ts.ObjectLiteralExpression }[] = [];
  for (const p of obj.properties) {
    if (ts.isPropertyAssignment(p)) {
      const key = propName(p.name);
      const value = resolveExpr(p.initializer, scope);
      if (key && ts.isObjectLiteralExpression(value)) out.push({ key, value });
    }
  }
  return out;
}

function objectEntryExprs(obj: ts.ObjectLiteralExpression, scope: ScopeIndex): { key: string; valueExpr: ts.Expression }[] {
  const out: { key: string; valueExpr: ts.Expression }[] = [];
  for (const p of obj.properties) {
    if (ts.isPropertyAssignment(p)) {
      const key = propName(p.name);
      if (key) out.push({ key, valueExpr: p.initializer });
    }
  }
  return out;
}

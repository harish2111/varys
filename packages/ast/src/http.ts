import { AuthScheme, type ExtractedHttpCall, type HttpMethod } from '@varys/contracts';
import { literalToValue, propName, resolveStringTemplate } from './literals';
import { type ScopeIndex, collectCalls, isMethodCall, resolveExpr, ts } from './source';

const METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE']);

interface HelperAnalysis {
  kind: 'direct' | 'delegate';
  paramNames: string[];
  // direct
  methodLiteral?: HttpMethod;
  methodParamIndex?: number;
  pathParamIndex?: number;
  baseUrl?: string;
  headerNames: string[];
  authScheme: AuthScheme;
  authHeaderName?: string;
  graphql?: boolean;
  queryNameParamIndex?: number;
  hasBody: boolean;
  // delegate
  innerName?: string;
  innerArgs?: ts.Expression[];
}

/**
 * Resolves REST/GraphQL HTTP calls out of connector bodies, tracing through the request
 * helper functions (makeFathomRequest, makeSuperOpsRequest, fetchAllPages, …) the
 * connectors wrap `context.fetch` in.
 */
export class HttpResolver {
  private readonly functions = new Map<string, ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression>();
  private readonly memo = new Map<string, HelperAnalysis | undefined>();
  private readonly baseUrlConsts: Map<string, string>;
  /** Names of helpers that are GraphQL request wrappers (callee -> queryName param index). */
  readonly graphqlHelpers = new Map<string, number>();

  constructor(
    private readonly sf: ts.SourceFile,
    private readonly scope: ScopeIndex,
  ) {
    this.baseUrlConsts = collectBaseUrlConsts(scope);
    for (const stmt of sf.statements) {
      if (ts.isFunctionDeclaration(stmt) && stmt.name && stmt.body) {
        this.functions.set(stmt.name.text, stmt);
      } else if (ts.isVariableStatement(stmt)) {
        for (const d of stmt.declarationList.declarations) {
          if (ts.isIdentifier(d.name) && d.initializer) {
            const init = resolveExpr(d.initializer, scope);
            if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
              this.functions.set(d.name.text, init);
            }
          }
        }
      }
    }
    // Pre-flag GraphQL helpers so the extractor can recover operation names.
    for (const name of this.functions.keys()) {
      const a = this.analyze(name, 0);
      if (a?.graphql && a.queryNameParamIndex !== undefined) {
        this.graphqlHelpers.set(name, a.queryNameParamIndex);
      }
    }
  }

  /** Extract every REST HTTP call reachable from a unit body. */
  extractFromBody(body: ts.Node, localScope: ScopeIndex): ExtractedHttpCall[] {
    const out: ExtractedHttpCall[] = [];
    for (const call of collectCalls(body)) {
      const line = this.sf.getLineAndCharacterOfPosition(call.getStart(this.sf)).line + 1;
      if (isMethodCall(call, 'context', 'fetch')) {
        const direct = this.directFetchToCall(call, localScope, line);
        if (direct && !direct.graphql) out.push(direct.httpCall);
        continue;
      }
      const callee = call.expression;
      if (ts.isIdentifier(callee) && this.functions.has(callee.text)) {
        const a = this.analyze(callee.text, 0);
        if (!a || a.graphql) continue; // graphql handled separately
        const hc = this.resolveHelperCall(callee.text, [...call.arguments], localScope, 0);
        if (hc) {
          hc.sourceLine = line;
          out.push(hc);
        }
      }
    }
    return dedupeCalls(out);
  }

  /** Names of request helpers (for GraphQL op extraction in the extractor). */
  isGraphqlHelper(name: string): number | undefined {
    return this.graphqlHelpers.get(name);
  }

  private analyze(name: string, depth: number): HelperAnalysis | undefined {
    if (this.memo.has(name)) return this.memo.get(name);
    if (depth > 8) return undefined;
    this.memo.set(name, undefined); // guard against recursion
    const fn = this.functions.get(name);
    if (!fn || !fn.body || !ts.isBlock(fn.body)) return undefined;
    const paramNames = fn.parameters.map((p) => (ts.isIdentifier(p.name) ? p.name.text : ''));
    const local = mergeScope(this.scope, buildLocalScope(fn.body));

    // (a) direct context.fetch
    for (const call of collectCalls(fn.body)) {
      if (isMethodCall(call, 'context', 'fetch')) {
        const info = this.analyzeDirectFetch(call, paramNames, local);
        const result: HelperAnalysis = { kind: 'direct', paramNames, ...info };
        this.memo.set(name, result);
        return result;
      }
    }
    // (b) delegate to another request helper
    for (const call of collectCalls(fn.body)) {
      const callee = call.expression;
      if (ts.isIdentifier(callee) && callee.text !== name && this.functions.has(callee.text)) {
        const inner = this.analyze(callee.text, depth + 1);
        if (inner) {
          const result: HelperAnalysis = {
            kind: 'delegate',
            paramNames,
            innerName: callee.text,
            innerArgs: [...call.arguments],
            headerNames: inner.headerNames,
            authScheme: inner.authScheme,
            authHeaderName: inner.authHeaderName,
            graphql: inner.graphql,
            hasBody: inner.hasBody,
          };
          this.memo.set(name, result);
          return result;
        }
      }
    }
    return undefined;
  }

  private analyzeDirectFetch(
    call: ts.CallExpression,
    paramNames: string[],
    local: ScopeIndex,
  ): Omit<HelperAnalysis, 'kind' | 'paramNames'> {
    const urlArg = call.arguments[0];
    const optsArg = call.arguments[1] ? resolveExpr(call.arguments[1], local) : undefined;
    const opts = optsArg && ts.isObjectLiteralExpression(optsArg) ? optsArg : undefined;

    // method
    let methodLiteral: HttpMethod | undefined;
    let methodParamIndex: number | undefined;
    const methodExpr = opts && getProp(opts, 'method');
    if (methodExpr) {
      const lit = literalToValue(methodExpr, local);
      if (typeof lit === 'string' && METHODS.has(lit)) methodLiteral = lit as HttpMethod;
      else if (ts.isIdentifier(methodExpr)) {
        const idx = paramNames.indexOf(methodExpr.text);
        if (idx >= 0) methodParamIndex = idx;
      }
    }

    // path param + base url (from the url expression)
    const urlResolved = urlArg ? resolveExpr(urlArg, local) : undefined;
    let pathParamIndex: number | undefined;
    let baseUrl: string | undefined;
    if (urlResolved) {
      for (let i = 0; i < paramNames.length; i++) {
        if (paramNames[i] && exprReferencesIdentifier(urlResolved, paramNames[i])) {
          pathParamIndex = i;
          break;
        }
      }
      baseUrl = this.findBaseUrl(urlResolved);
    }

    // headers / auth
    const headersExpr = opts && getProp(opts, 'headers');
    const headerObj = headersExpr ? resolveToObject(headersExpr, local) : undefined;
    const { headerNames, authScheme, authHeaderName } = readHeaders(headerObj, local);

    // graphql detection
    const bodyExpr = opts && getProp(opts, 'body');
    const graphql = bodyExpr ? this.isGraphqlBody(bodyExpr, local) : false;
    let queryNameParamIndex: number | undefined;
    if (graphql) queryNameParamIndex = this.findQueryNameParam(call, paramNames, local);

    return {
      methodLiteral,
      methodParamIndex,
      pathParamIndex,
      baseUrl,
      headerNames,
      authScheme,
      authHeaderName,
      graphql,
      queryNameParamIndex,
      hasBody: !!bodyExpr,
    };
  }

  private directFetchToCall(
    call: ts.CallExpression,
    local: ScopeIndex,
    line: number,
  ): { httpCall: ExtractedHttpCall; graphql: boolean } | undefined {
    const info = this.analyzeDirectFetch(call, [], local);
    const urlArg = call.arguments[0];
    const resolved = urlArg ? resolveStringTemplate(urlArg, local) : undefined;
    const { path, base } = splitUrl(resolved?.text, info.baseUrl);
    const { path: cleanPath, queryParams } = splitPathAndQuery(path);
    const httpCall: ExtractedHttpCall = {
      method: info.methodLiteral ?? 'GET',
      baseUrl: base,
      pathTemplate: cleanPath,
      queryParams,
      headerNames: info.headerNames,
      authScheme: info.authScheme,
      authHeaderName: info.authHeaderName,
      hasBody: info.hasBody,
      sourceLine: line,
    };
    return { httpCall, graphql: !!info.graphql };
  }

  private resolveHelperCall(
    name: string,
    args: ts.Expression[],
    callerScope: ScopeIndex,
    depth: number,
  ): ExtractedHttpCall | undefined {
    if (depth > 8) return undefined;
    const a = this.analyze(name, 0);
    if (!a) return undefined;

    if (a.kind === 'delegate' && a.innerName && a.innerArgs) {
      const paramMap = new Map<string, ts.Expression>();
      a.paramNames.forEach((p, i) => {
        if (p && args[i]) paramMap.set(p, args[i]);
      });
      const substituted = a.innerArgs.map((e) =>
        ts.isIdentifier(e) && paramMap.has(e.text) ? paramMap.get(e.text)! : e,
      );
      return this.resolveHelperCall(a.innerName, substituted, callerScope, depth + 1);
    }

    // direct helper
    let method: HttpMethod = 'GET';
    if (a.methodLiteral) method = a.methodLiteral;
    else if (a.methodParamIndex !== undefined && args[a.methodParamIndex]) {
      const v = literalToValue(args[a.methodParamIndex], callerScope);
      if (typeof v === 'string' && METHODS.has(v)) method = v as HttpMethod;
    }

    let path = '';
    if (a.pathParamIndex !== undefined && args[a.pathParamIndex]) {
      const r = resolveStringTemplate(args[a.pathParamIndex], callerScope);
      if (r) path = r.text;
    }
    const { path: cleanPath, queryParams } = splitPathAndQuery(path);

    return {
      method,
      baseUrl: a.baseUrl,
      pathTemplate: normalizePath(cleanPath),
      queryParams,
      headerNames: a.headerNames,
      authScheme: a.authScheme,
      authHeaderName: a.authHeaderName,
      hasBody: a.hasBody,
    };
  }

  private findBaseUrl(node: ts.Node): string | undefined {
    let found: string | undefined;
    const visit = (n: ts.Node) => {
      if (found) return;
      if (ts.isIdentifier(n) && this.baseUrlConsts.has(n.text)) {
        found = this.baseUrlConsts.get(n.text);
        return;
      }
      ts.forEachChild(n, visit);
    };
    visit(node);
    return found;
  }

  private isGraphqlBody(bodyExpr: ts.Expression, local: ScopeIndex): boolean {
    // JSON.stringify({ query, variables }) or an object containing a `query` property.
    let isGraphql = false;
    const visit = (n: ts.Node) => {
      if (isGraphql) return;
      if (ts.isObjectLiteralExpression(n)) {
        for (const p of n.properties) {
          if ((ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) && propName(p.name) === 'query') {
            isGraphql = true;
            return;
          }
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(resolveExpr(bodyExpr, local));
    return isGraphql;
  }

  private findQueryNameParam(call: ts.CallExpression, paramNames: string[], local: ScopeIndex): number | undefined {
    // Look for `someMap[param]` where param is one of the helper params.
    const fn = call.getSourceFile();
    let idx: number | undefined;
    const visit = (n: ts.Node) => {
      if (idx !== undefined) return;
      if (ts.isElementAccessExpression(n) && ts.isIdentifier(n.argumentExpression)) {
        const p = paramNames.indexOf(n.argumentExpression.text);
        if (p >= 0) idx = p;
      }
      ts.forEachChild(n, visit);
    };
    // Search the enclosing function body for the index access.
    let parent: ts.Node = call;
    while (parent.parent && !ts.isFunctionDeclaration(parent) && !ts.isArrowFunction(parent) && !ts.isFunctionExpression(parent)) {
      parent = parent.parent;
    }
    visit(parent ?? fn);
    return idx;
  }
}

// ---- helpers ----------------------------------------------------------------

function collectBaseUrlConsts(scope: ScopeIndex): Map<string, string> {
  const map = new Map<string, string>();
  for (const [name, expr] of scope.entries()) {
    const v = literalToValue(expr, scope);
    if (typeof v === 'string' && /^https?:\/\//.test(v)) map.set(name, v);
  }
  return map;
}

function buildLocalScope(block: ts.Block): ScopeIndex {
  const local: ScopeIndex = new Map();
  const visit = (n: ts.Node) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) {
      if (!local.has(n.name.text)) local.set(n.name.text, n.initializer);
    }
    ts.forEachChild(n, visit);
  };
  visit(block);
  return local;
}

function mergeScope(base: ScopeIndex, local: ScopeIndex): ScopeIndex {
  const merged: ScopeIndex = new Map(base);
  for (const [k, v] of local.entries()) merged.set(k, v);
  return merged;
}

function getProp(obj: ts.ObjectLiteralExpression, key: string): ts.Expression | undefined {
  for (const p of obj.properties) {
    if (ts.isPropertyAssignment(p) && propName(p.name) === key) return p.initializer;
    if (ts.isShorthandPropertyAssignment(p) && p.name.text === key) return p.name;
  }
  return undefined;
}

function resolveToObject(expr: ts.Expression, scope: ScopeIndex): ts.ObjectLiteralExpression | undefined {
  const r = resolveExpr(expr, scope);
  return ts.isObjectLiteralExpression(r) ? r : undefined;
}

function exprReferencesIdentifier(node: ts.Node, name: string): boolean {
  let found = false;
  const visit = (n: ts.Node) => {
    if (found) return;
    if (ts.isIdentifier(n) && n.text === name) {
      found = true;
      return;
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return found;
}

function readHeaders(
  obj: ts.ObjectLiteralExpression | undefined,
  scope: ScopeIndex,
): { headerNames: string[]; authScheme: AuthScheme; authHeaderName?: string } {
  const headerNames: string[] = [];
  let authScheme = AuthScheme.NONE;
  let authHeaderName: string | undefined;
  if (!obj) return { headerNames, authScheme };
  for (const p of obj.properties) {
    if (!ts.isPropertyAssignment(p)) continue;
    const key = propName(p.name);
    if (!key) continue;
    headerNames.push(key);
    const lower = key.toLowerCase();
    const value = resolveStringTemplate(p.initializer, scope)?.text ?? '';
    if (lower === 'authorization') {
      authHeaderName = key;
      authScheme = /bearer/i.test(value) ? AuthScheme.BEARER : /basic/i.test(value) ? AuthScheme.BASIC : AuthScheme.CUSTOM;
    } else if (/^x-api-key$/i.test(key) || /api[-_]?key/i.test(lower)) {
      authHeaderName = key;
      authScheme = AuthScheme.API_KEY_HEADER;
    }
  }
  return { headerNames, authScheme, authHeaderName };
}

function splitUrl(full: string | undefined, baseHint?: string): { base?: string; path: string } {
  if (!full) return { base: baseHint, path: '' };
  if (baseHint && full.startsWith(baseHint)) {
    return { base: baseHint, path: normalizePath(full.slice(baseHint.length)) };
  }
  const m = full.match(/^(https?:\/\/[^/]+)(\/.*)?$/);
  if (m) return { base: m[1], path: normalizePath(m[2] ?? '') };
  return { base: baseHint, path: normalizePath(full) };
}

/** Split a `path?query` string into a clean path and the list of query parameter names. */
export function splitPathAndQuery(raw: string): { path: string; queryParams: string[] } {
  const qIdx = raw.indexOf('?');
  if (qIdx < 0) return { path: raw, queryParams: [] };
  const path = raw.slice(0, qIdx);
  const query = raw.slice(qIdx + 1);
  const queryParams = query
    .split('&')
    .map((kv) => kv.split('=')[0]?.trim())
    .filter((k): k is string => !!k);
  return { path, queryParams };
}

/** Normalize a path: ensure leading slash, collapse `:id`/`{id}` interpolations to `{param}`. */
export function normalizePath(path: string): string {
  let p = path.trim();
  if (!p) return '/';
  if (!p.startsWith('/')) p = '/' + p;
  p = p.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
  p = p.replace(/\/+/g, '/');
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

function dedupeCalls(calls: ExtractedHttpCall[]): ExtractedHttpCall[] {
  const seen = new Set<string>();
  const out: ExtractedHttpCall[] = [];
  for (const c of calls) {
    const key = `${c.method} ${c.baseUrl ?? ''}${c.pathTemplate}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

import * as ts from 'typescript';

/**
 * Parse a connector's TypeScript source into an AST without executing it (spec §10).
 * Pinned to the TypeScript 5.6.x compiler API — `setParentNodes` is enabled so rule
 * traversal can walk upward.
 */
export function parseConnector(source: string, fileName = 'connector.ts'): ts.SourceFile {
  return ts.createSourceFile(fileName, source, ts.ScriptTarget.ES2022, /* setParentNodes */ true);
}

/**
 * Strip all comments from the source (spec §16 prompt-injection defence — defeats
 * "ignore previous rules" comments before any code reaches the LLM).
 */
export function stripComments(source: string): string {
  const sf = parseConnector(source);
  const printer = ts.createPrinter({ removeComments: true });
  return printer.printFile(sf);
}

/** Index of top-level `const`/`let`/`var` initializers by name, for identifier resolution. */
export type ScopeIndex = Map<string, ts.Expression>;

export function buildScopeIndex(sf: ts.SourceFile): ScopeIndex {
  const index: ScopeIndex = new Map();
  for (const stmt of sf.statements) {
    if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.initializer) {
          index.set(decl.name.text, decl.initializer);
        }
      }
    }
  }
  return index;
}

/** Resolve an expression that may be an identifier referencing a top-level const. */
export function resolveExpr(expr: ts.Expression, scope: ScopeIndex, depth = 0): ts.Expression {
  if (depth > 8) return expr;
  if (ts.isIdentifier(expr)) {
    const target = scope.get(expr.text);
    if (target) return resolveExpr(target, scope, depth + 1);
  }
  if (ts.isAsExpression(expr) || ts.isParenthesizedExpression(expr)) {
    return resolveExpr(expr.expression, scope, depth + 1);
  }
  return expr;
}

/** Find the array literal returned by an arrow/function body, if one is statically present. */
export function findReturnedArray(
  expr: ts.Expression | undefined,
  scope: ScopeIndex,
): ts.ArrayLiteralExpression | undefined {
  if (!expr) return undefined;
  const resolved = resolveExpr(expr, scope);
  let body: ts.ConciseBody | undefined;
  if (ts.isArrowFunction(resolved) || ts.isFunctionExpression(resolved)) {
    body = resolved.body;
  } else if (ts.isArrayLiteralExpression(resolved)) {
    return resolved;
  }
  if (!body) return undefined;
  if (ts.isArrayLiteralExpression(body)) return body;
  if (ts.isBlock(body)) {
    for (const stmt of body.statements) {
      if (ts.isReturnStatement(stmt) && stmt.expression) {
        const r = resolveExpr(stmt.expression, scope);
        if (ts.isArrayLiteralExpression(r)) return r;
      }
    }
  }
  return undefined;
}

/** Collect all CallExpressions in a subtree (used to find context.fetch / helper calls). */
export function collectCalls(node: ts.Node): ts.CallExpression[] {
  const calls: ts.CallExpression[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isCallExpression(n)) calls.push(n);
    ts.forEachChild(n, visit);
  };
  visit(node);
  return calls;
}

export function getLine(sf: ts.SourceFile, node: ts.Node): number {
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}

/** True if a call expression targets `obj.method` (e.g. context.fetch). */
export function isMethodCall(call: ts.CallExpression, obj: string, method: string): boolean {
  const e = call.expression;
  return (
    ts.isPropertyAccessExpression(e) &&
    ts.isIdentifier(e.name) &&
    e.name.text === method &&
    ((ts.isIdentifier(e.expression) && e.expression.text === obj) ||
      (ts.isPropertyAccessExpression(e.expression) && e.expression.name.text === obj))
  );
}

export { ts };

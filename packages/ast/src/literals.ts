import { type ScopeIndex, resolveExpr, ts } from './source';

/**
 * Best-effort conversion of a literal expression node into a plain JS value. Used to
 * recover `sample` objects (which drive output-schema derivation and runtime payloads).
 * Returns undefined when the node is not statically resolvable.
 */
export function literalToValue(expr: ts.Expression, scope: ScopeIndex, depth = 0): unknown {
  if (depth > 12) return undefined;
  const node = resolveExpr(expr, scope);

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
    const inner = literalToValue(node.operand, scope, depth + 1);
    return typeof inner === 'number' ? -inner : undefined;
  }

  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((el) => literalToValue(el, scope, depth + 1));
  }

  if (ts.isObjectLiteralExpression(node)) {
    const obj: Record<string, unknown> = {};
    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const key = propName(prop.name);
        if (key === undefined) continue;
        obj[key] = literalToValue(prop.initializer, scope, depth + 1);
      } else if (ts.isShorthandPropertyAssignment(prop)) {
        const key = prop.name.text;
        const target = scope.get(key);
        obj[key] = target ? literalToValue(target, scope, depth + 1) : undefined;
      }
    }
    return obj;
  }

  return undefined;
}

export function propName(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  if (ts.isNumericLiteral(name)) return name.text;
  return undefined;
}

export interface ResolvedString {
  text: string;
  hadInterpolation: boolean;
}

/**
 * Resolve a string-or-template expression to a normalized string. Template interpolations
 * become `{name}` placeholders (named after the interpolated identifier/last path segment),
 * which is how endpoint paths like `recordings/${recording_id}/transcript` are recovered.
 */
export function resolveStringTemplate(expr: ts.Expression, scope: ScopeIndex, depth = 0): ResolvedString | undefined {
  if (depth > 12) return undefined;
  const node = resolveExpr(expr, scope);

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return { text: node.text, hadInterpolation: false };
  }

  if (ts.isTemplateExpression(node)) {
    let text = node.head.text;
    let hadInterpolation = false;
    for (const span of node.templateSpans) {
      const inner = resolveStringTemplate(span.expression, scope, depth + 1);
      if (inner && !inner.hadInterpolation && inner.text && !/[${}]/.test(inner.text)) {
        text += inner.text;
      } else {
        hadInterpolation = true;
        text += `{${placeholderName(span.expression)}}`;
      }
      text += span.literal.text;
    }
    return { text, hadInterpolation };
  }

  // Binary string concatenation: `a` + `b`
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = resolveStringTemplate(node.left, scope, depth + 1);
    const right = resolveStringTemplate(node.right, scope, depth + 1);
    if (left && right) {
      return { text: left.text + right.text, hadInterpolation: left.hadInterpolation || right.hadInterpolation };
    }
  }

  return undefined;
}

function placeholderName(expr: ts.Expression): string {
  if (ts.isIdentifier(expr)) return expr.text;
  if (ts.isPropertyAccessExpression(expr)) return expr.name.text;
  if (ts.isElementAccessExpression(expr) && ts.isStringLiteral(expr.argumentExpression)) {
    return expr.argumentExpression.text;
  }
  return 'param';
}

import type { DocumentationContract, ExtractedUnit } from '@varys/contracts';

/** System prompt for scoped unit validation (spec §12.2). */
export const UNIT_VALIDATION_SYSTEM = [
  'You are a QA validator for iPaaS connectors.',
  'Compare ONE action\'s AST extraction against ONE official API documentation contract.',
  'Report only real discrepancies in schema, config/auth, and parameter transforms.',
  'Never invent fields. If a claimed discrepancy cannot be traced to the provided contract,',
  'do not report it. Output strictly the JSON matching the provided schema.',
].join(' ');

/** Response schema constraining Gemini to structured JSON (spec §12.2). */
export const UNIT_VALIDATION_RESPONSE_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          finding_type: { type: 'string', enum: ['SCHEMA_MISMATCH', 'AUTH_MISMATCH', 'TRANSFORMATION_ERROR'] },
          severity: { type: 'string', enum: ['CRITICAL', 'WARNING', 'INFO'] },
          target_field: { type: 'string' },
          explanation: { type: 'string' },
          confidence_score: { type: 'number' },
        },
        required: ['finding_type', 'severity', 'explanation', 'confidence_score'],
      },
    },
  },
  required: ['findings'],
};

/** Build the variable payload for a unit-validation call (one unit + one contract). */
export function buildUnitValidationContents(unit: ExtractedUnit, contract: DocumentationContract): string {
  const actionAst = {
    name: unit.name,
    element_type: unit.elementType,
    contract_kind: unit.contractKind,
    input_schema: unit.inputFields,
    output_schema: unit.outputFields,
    http_calls: unit.httpCalls.map((c) => ({
      method: c.method,
      path: c.pathTemplate,
      query_params: c.queryParams,
      auth: c.authScheme,
    })),
    graphql_operations: unit.graphqlOps,
  };
  return JSON.stringify({ action_ast: actionAst, documentation_contract: contract });
}

/** Construct the text embedded for retrieval from a unit's AST (spec §9). */
export function buildEmbeddingQuery(unit: ExtractedUnit): string {
  const parts: string[] = [unit.name];
  for (const c of unit.httpCalls) parts.push(`${c.method} ${c.pathTemplate}`);
  for (const g of unit.graphqlOps) parts.push(`${g.operationType} ${g.rootField}`);
  parts.push(...unit.inputFields.map((f) => f.name));
  return parts.filter(Boolean).join(' ');
}

/** Rerank: order candidate chunks by relevance to the unit query (spec §9.2). */
export const RERANK_RESPONSE_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: { order: { type: 'array', items: { type: 'integer' } } },
  required: ['order'],
};

export function buildRerankContents(query: string, chunks: { id: number; text: string }[]): string {
  return JSON.stringify({
    query,
    instruction: 'Return the indices of the candidates ordered most-relevant first.',
    candidates: chunks.map((c) => ({ index: c.id, content: c.text.slice(0, 1200) })),
  });
}

import { ContractKind, type DocumentationContract } from '@varys/contracts';

/**
 * Parse a GraphQL SDL into one DocumentationContract per Query/Mutation field. Lightweight,
 * dependency-free: recovers operation name, required (non-null) variables, and the available
 * fields of the operation's return type.
 */
export function parseGraphqlSdl(sdl: string, vendor: string, apiVersion: string): DocumentationContract[] {
  const types = parseTypeBlocks(sdl);
  const out: DocumentationContract[] = [];

  for (const opType of ['Query', 'Mutation'] as const) {
    const block = types.get(opType);
    if (!block) continue;
    for (const field of parseFields(block)) {
      const returnTypeName = field.returnType.replace(/[[\]!]/g, '');
      const returnFields = types.has(returnTypeName) ? parseFields(types.get(returnTypeName)!).map((f) => f.name) : [];
      out.push({
        kind: ContractKind.GRAPHQL,
        vendor,
        apiVersion,
        resourceGroup: returnTypeName || field.name,
        title: field.name,
        operationType: opType === 'Query' ? 'query' : 'mutation',
        operationName: field.name,
        requiredVariables: field.requiredArgs,
        availableFields: returnFields,
      });
    }
  }
  return out;
}

function parseTypeBlocks(sdl: string): Map<string, string> {
  const blocks = new Map<string, string>();
  const re = /\b(?:type|input)\s+([A-Za-z0-9_]+)[^{]*\{([\s\S]*?)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sdl)) !== null) {
    blocks.set(m[1], m[2]);
  }
  return blocks;
}

interface ParsedField {
  name: string;
  returnType: string;
  requiredArgs: string[];
}

function parseFields(block: string): ParsedField[] {
  const fields: ParsedField[] = [];
  // Match `name(args): ReturnType` or `name: ReturnType`, ignoring comments.
  const re = /^\s*([A-Za-z0-9_]+)\s*(\(([\s\S]*?)\))?\s*:\s*([A-Za-z0-9_![\]]+)/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    const name = m[1];
    const args = m[3] ?? '';
    const returnType = m[4];
    const requiredArgs = Array.from(args.matchAll(/([A-Za-z0-9_]+)\s*:\s*[A-Za-z0-9_[\]]+!/g)).map((a) => a[1]);
    fields.push({ name, returnType, requiredArgs });
  }
  return fields;
}

import type { DocumentationContract } from '@varys/contracts';

/** A self-describing, embeddable documentation chunk (spec §9.1). */
export interface DocChunk {
  vendor: string;
  apiVersion: string;
  resourceGroup: string;
  httpMethod: string;
  endpointPath: string;
  /** Text to embed + return to the validator (metadata prefix + body). */
  content: string;
  /** Structured contract persisted to raw_openapi_json. */
  contract: DocumentationContract;
}

/**
 * Hierarchical endpoint chunking (spec §9.1): one chunk per endpoint operation, prefixed with
 * semantic context (vendor/version/resource/operation + HTTP line) so retrieval and the model
 * both see what the chunk is about. Character-count chunking is deliberately avoided.
 */
export function buildChunkContent(contract: DocumentationContract): string {
  const lines: string[] = [];
  lines.push(
    `Vendor: ${contract.vendor} | Version: ${contract.apiVersion} | Resource: ${contract.resourceGroup} | Operation: ${contract.title}`,
  );

  if (contract.kind === 'GRAPHQL') {
    lines.push(`GraphQL: ${contract.operationType ?? 'query'} ${contract.operationName ?? ''}`.trim());
    if (contract.requiredVariables?.length) lines.push(`Variables: ${contract.requiredVariables.map((v) => `$${v}`).join(', ')}`);
    if (contract.availableFields?.length) lines.push(`Fields: ${contract.availableFields.join(', ')}`);
    return lines.join('\n');
  }

  lines.push(`HTTP: ${contract.method ?? 'GET'} ${contract.path ?? ''}`.trim());
  if (contract.auth) lines.push(`Auth: ${contract.auth}${contract.authHeaderName ? ` (${contract.authHeaderName})` : ''}`);
  if (contract.requiredQueryParams?.length) lines.push(`Query params: ${contract.requiredQueryParams.join(', ')}`);
  if (contract.requestFields?.length) {
    lines.push('Request fields:');
    for (const f of contract.requestFields) {
      lines.push(`  - ${f.name} (${f.type})${f.required ? ' [required]' : ''}${f.description ? `: ${f.description}` : ''}`);
    }
  }
  if (contract.responseFields?.length) {
    lines.push('Response fields:');
    for (const f of contract.responseFields.slice(0, 40)) {
      lines.push(`  - ${f.name} (${f.type})`);
    }
  }
  return lines.join('\n');
}

export function contractToChunk(contract: DocumentationContract): DocChunk {
  return {
    vendor: contract.vendor,
    apiVersion: contract.apiVersion,
    resourceGroup: contract.resourceGroup,
    httpMethod: contract.kind === 'GRAPHQL' ? 'POST' : contract.method ?? 'GET',
    endpointPath: contract.kind === 'GRAPHQL' ? contract.operationName ?? contract.title : contract.path ?? '/',
    content: buildChunkContent(contract),
    contract,
  };
}

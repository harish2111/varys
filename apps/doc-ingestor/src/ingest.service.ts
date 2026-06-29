import { ContractKind, type DocumentationContract, type IngestionJob } from '@varys/contracts';
import { apiDocumentChunks, apiDocumentNamespaces, getDb, withOrg } from '@varys/db';
import { LlmGatewayClient } from '@varys/llm-client';
import { createLogger } from '@varys/telemetry';
import { and, eq } from 'drizzle-orm';
import { type DocChunk, contractToChunk } from './chunking';
import { parseGraphqlSdl } from './graphql-sdl';
import { parseOpenApi } from './openapi';
import type { AppConfig } from './config';

const logger = createLogger({ service: 'doc-ingestor' });

/**
 * Documentation ingestion (spec §8–9): parse an OpenAPI/GraphQL document into per-endpoint
 * contracts, hierarchically chunk them, embed via the governed gateway, and write versioned
 * chunks into pgvector. Versions get isolated namespaces tracked for re-ingestion.
 */
export class IngestService {
  private readonly gateway: LlmGatewayClient;

  constructor(private readonly config: AppConfig) {
    this.gateway = new LlmGatewayClient(`http://localhost:${config.LLM_GATEWAY_PORT}`, config.INTERNAL_SERVICE_SECRET);
  }

  async ingest(job: IngestionJob): Promise<{ chunks: number }> {
    const contracts = this.parse(job);
    if (contracts.length === 0) {
      logger.warn({ namespace: job.namespace }, 'no contracts parsed from ingestion document');
      return { chunks: 0 };
    }
    const chunks = contracts.map(contractToChunk);

    // Embed each chunk through the governed gateway (RPM/TPM shaped centrally).
    const embeddings: number[][] = [];
    for (const chunk of chunks) {
      const res = await this.gateway.embed(chunk.content, undefined, job.orgId);
      embeddings.push(res.embedding);
    }

    const db = getDb();
    await withOrg(job.orgId, async (tx) => {
      // Upsert the namespace and replace its chunk set (re-ingestion is idempotent).
      const [ns] = await tx
        .insert(apiDocumentNamespaces)
        .values({
          orgId: job.orgId,
          vendor: job.vendor,
          apiVersion: job.apiVersion,
          namespace: job.namespace,
          contractKind: job.contractKind,
          rootUrl: job.rootUrl ?? null,
          allowedDomains: job.allowedDomains ?? [],
          lastCrawledAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [apiDocumentNamespaces.orgId, apiDocumentNamespaces.namespace],
          set: { lastCrawledAt: new Date(), allowedDomains: job.allowedDomains ?? [] },
        })
        .returning({ id: apiDocumentNamespaces.id });

      await tx
        .delete(apiDocumentChunks)
        .where(and(eq(apiDocumentChunks.orgId, job.orgId), eq(apiDocumentChunks.namespaceId, ns.id)));

      await tx.insert(apiDocumentChunks).values(
        chunks.map((c: DocChunk, i: number) => ({
          orgId: job.orgId,
          namespaceId: ns.id,
          vendor: c.vendor,
          apiVersion: c.apiVersion,
          resourceGroup: c.resourceGroup,
          httpMethod: c.httpMethod,
          endpointPath: c.endpointPath.slice(0, 255),
          content: c.content,
          embedding: embeddings[i],
          rawOpenapiJson: c.contract as unknown as Record<string, unknown>,
        })),
      );
    }, db);

    logger.info({ namespace: job.namespace, chunks: chunks.length }, 'ingestion complete');
    return { chunks: chunks.length };
  }

  private parse(job: IngestionJob): DocumentationContract[] {
    if (job.contractKind === ContractKind.GRAPHQL && job.graphqlSdl) {
      return parseGraphqlSdl(job.graphqlSdl, job.vendor, job.apiVersion);
    }
    if (job.openapi) {
      return parseOpenApi(job.openapi as Record<string, unknown>, job.vendor, job.apiVersion);
    }
    // Crawl path (Playwright) is not wired in this build; inline documents are required.
    return [];
  }
}

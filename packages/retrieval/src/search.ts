import { ContractKind, type ExtractedUnit, type RetrievedChunk } from '@varys/contracts';
import type { Database } from '@varys/db';
import { sql } from 'drizzle-orm';
import { type ChunkRow, rowToContract } from './contract-map';
import { buildFtsQuery } from './query';
import { type FusedResult, isFusionDecisive, reciprocalRankFusion } from './rrf';

export interface RetrieveParams {
  db: Database;
  vendor: string;
  apiVersion: string;
  contractKind: ContractKind;
  unit: ExtractedUnit;
  /** Query embedding (768-d) produced via the llm-gateway. */
  embedding: number[];
  /** Optional rerank callback (e.g. Gemini Flash); given candidate texts, returns ordering. */
  rerank?: (query: string, chunks: { id: number; text: string }[]) => Promise<number[]>;
  config: {
    vectorTopK: number;
    ftsTopK: number;
    finalTopK: number;
    rrfK: number;
    rerankEnabled: boolean;
    rerankMargin: number;
  };
}

/**
 * Hybrid per-unit retrieval (spec §9.2): pgvector cosine + PostgreSQL full-text, fused by
 * RRF, optionally reranked, returning the top contracts. Runs inside the caller's RLS-scoped
 * transaction (the db argument is the org-scoped tx).
 */
export async function retrieve(params: RetrieveParams): Promise<RetrievedChunk[]> {
  const { db, vendor, apiVersion, contractKind, unit, embedding, config } = params;
  const vectorLiteral = `[${embedding.map((n) => (Number.isFinite(n) ? n : 0)).join(',')}]`;
  const ftsQuery = buildFtsQuery(unit) || vendor.toLowerCase();

  // Vector search (HNSW cosine), top-N.
  const vectorRows = (await db.execute(sql`
    SELECT id::text AS id
    FROM api_document_chunks
    WHERE vendor = ${vendor} AND api_version = ${apiVersion}
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT ${config.vectorTopK}
  `)) as unknown as { rows: { id: string }[] };

  // Full-text search over method + path components, top-N.
  const ftsRows = (await db.execute(sql`
    SELECT id::text AS id
    FROM api_document_chunks
    WHERE vendor = ${vendor} AND api_version = ${apiVersion}
      AND search_tsv @@ to_tsquery('simple', ${ftsQuery})
    ORDER BY ts_rank(search_tsv, to_tsquery('simple', ${ftsQuery})) DESC
    LIMIT ${config.ftsTopK}
  `)) as unknown as { rows: { id: string }[] };

  const fused: FusedResult[] = reciprocalRankFusion(
    [rowsToIds(vectorRows), rowsToIds(ftsRows)],
    config.rrfK,
  );
  if (fused.length === 0) return [];

  // Hydrate the fused candidate pool.
  const poolIds = fused.slice(0, Math.max(config.finalTopK * 3, config.finalTopK)).map((f) => f.id);
  const chunks = await hydrate(db, poolIds);
  const byId = new Map(chunks.map((c) => [c.id, c]));

  let ordered: { id: string; score: number }[] = fused.filter((f) => byId.has(f.id));

  // Optional rerank when the fusion margin is not already decisive.
  if (
    params.rerank &&
    config.rerankEnabled &&
    ordered.length > 1 &&
    !isFusionDecisive(fused, config.rerankMargin)
  ) {
    const idxToId = ordered.map((o) => o.id);
    const rerankInput = idxToId.map((id, i) => ({ id: i, text: byId.get(id)!.content }));
    const query = buildFtsQuery(unit) || unit.name;
    const order = await params.rerank(query, rerankInput);
    const seen = new Set<number>();
    const reordered: { id: string; score: number }[] = [];
    for (const i of order) {
      if (i >= 0 && i < idxToId.length && !seen.has(i)) {
        seen.add(i);
        reordered.push({ id: idxToId[i], score: 1 - reordered.length / idxToId.length });
      }
    }
    if (reordered.length) ordered = reordered;
  }

  return ordered.slice(0, config.finalTopK).map((o) => {
    const row = byId.get(o.id)!;
    return {
      chunkId: row.id,
      vendor: row.vendor,
      apiVersion: row.apiVersion,
      resourceGroup: row.resourceGroup,
      httpMethod: row.httpMethod,
      endpointPath: row.endpointPath,
      content: row.content,
      contract: rowToContract(row, contractKind),
      score: o.score,
    };
  });
}

function rowsToIds(res: { rows: { id: string }[] }): string[] {
  return (res.rows ?? []).map((r) => r.id);
}

async function hydrate(db: Database, ids: string[]): Promise<ChunkRow[]> {
  if (ids.length === 0) return [];
  const list = sql.join(
    ids.map((id) => sql`${id}::uuid`),
    sql`, `,
  );
  const res = (await db.execute(sql`
    SELECT id::text AS id, vendor, api_version AS "apiVersion", resource_group AS "resourceGroup",
           http_method AS "httpMethod", endpoint_path AS "endpointPath", content,
           raw_openapi_json AS "rawOpenapiJson"
    FROM api_document_chunks
    WHERE id IN (${list})
  `)) as unknown as { rows: ChunkRow[] };
  return res.rows ?? [];
}

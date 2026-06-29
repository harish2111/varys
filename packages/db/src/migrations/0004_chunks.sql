-- Knowledge-base chunk table with HNSW vector index (spec §14.1) plus the full-text
-- search column the spec's §9.2 hybrid retrieval requires (path components + method).
CREATE TABLE api_document_chunks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  namespace_id    UUID NOT NULL REFERENCES api_document_namespaces(id) ON DELETE CASCADE,
  vendor          VARCHAR(100) NOT NULL,
  api_version     VARCHAR(50) NOT NULL,
  resource_group  VARCHAR(100) NOT NULL,
  http_method     VARCHAR(10) NOT NULL,
  endpoint_path   VARCHAR(255) NOT NULL,
  content         TEXT NOT NULL,
  embedding       VECTOR(768) NOT NULL,            -- gemini-embedding-001 @ 768 dims
  raw_openapi_json JSONB,
  -- FTS over method + path components + resource group (catches exact-URL cases where
  -- vectors drift). Path separators are normalized to spaces so `/crm/v3/objects` -> tokens.
  search_tsv tsvector GENERATED ALWAYS AS (
    to_tsvector(
      'simple',
      coalesce(http_method,'') || ' ' ||
      replace(replace(replace(coalesce(endpoint_path,''), '/', ' '), '{', ' '), '}', ' ') || ' ' ||
      coalesce(resource_group,'')
    )
  ) STORED,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chunks_vector ON api_document_chunks
  USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX idx_chunks_lookup ON api_document_chunks (org_id, vendor, api_version, http_method);
CREATE INDEX idx_chunks_search ON api_document_chunks USING gin (search_tsv);

-- Versioned vendor documentation namespaces (spec §8 — versions get isolated namespaces,
-- e.g. hubspot-v3, tracked by ETag/cron diffing).
CREATE TABLE api_document_namespaces (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  vendor          VARCHAR(100) NOT NULL,
  api_version     VARCHAR(50) NOT NULL,
  namespace       VARCHAR(150) NOT NULL,           -- e.g. fathom-1.0.0, hubspot-v3
  contract_kind   VARCHAR(10) NOT NULL DEFAULT 'REST', -- REST | GRAPHQL
  root_url        TEXT,
  allowed_domains TEXT[] NOT NULL DEFAULT '{}',    -- feeds the Squid egress allowlist
  etag            TEXT,
  last_crawled_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, namespace)
);
CREATE INDEX idx_namespaces_lookup ON api_document_namespaces (org_id, vendor, api_version);

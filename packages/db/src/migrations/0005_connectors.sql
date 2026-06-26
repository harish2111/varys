-- A submitted connector (one App object). Source is not persisted by default; only its
-- hash, for provenance and AST-hash short-circuit correlation.
CREATE TABLE connectors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL,
  namespace     VARCHAR(150) NOT NULL,
  app_id        VARCHAR(150) NOT NULL,            -- e.g. fathom-1.0.0
  name          VARCHAR(150) NOT NULL,
  version       VARCHAR(50) NOT NULL,
  contract_kind VARCHAR(10) NOT NULL DEFAULT 'REST',
  source_hash   CHAR(64) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_connectors_lookup ON connectors (org_id, namespace, app_id);

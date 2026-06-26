-- Connector elements (spec §14.2). ast_metadata holds the normalized ExtractedUnit;
-- ast_hash drives the Phase-0 cache short-circuit.
CREATE TABLE connector_elements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL,
  connector_id  UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
  element_type  VARCHAR(20) NOT NULL,             -- ACTION | POLLING_TRIGGER | WEBHOOK_TRIGGER
  name          VARCHAR(100) NOT NULL,
  ast_metadata  JSONB NOT NULL,
  ast_hash      CHAR(64) NOT NULL,                -- SHA-256 for cache short-circuit
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (connector_id, element_type, name)
);
CREATE INDEX idx_elements_hash ON connector_elements (org_id, ast_hash);

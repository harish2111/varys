-- Append-only audit log (spec §5.8 references an audit table).
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL,
  actor_type  VARCHAR(16) NOT NULL,               -- USER | API_KEY | SYSTEM
  actor_id    UUID,
  action      VARCHAR(80) NOT NULL,
  entity      VARCHAR(80),
  entity_id   UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_org ON audit_log (org_id, created_at DESC);

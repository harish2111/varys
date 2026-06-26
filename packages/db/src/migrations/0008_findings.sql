-- Validation findings (spec §14.2).
CREATE TABLE validation_findings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL,
  run_id            UUID NOT NULL REFERENCES validation_runs(id) ON DELETE CASCADE,
  element_id        UUID REFERENCES connector_elements(id) ON DELETE SET NULL,
  rule_id           VARCHAR(100) NOT NULL,
  severity          VARCHAR(10) NOT NULL,         -- CRITICAL | WARNING | INFO
  category          VARCHAR(50) NOT NULL,         -- SCHEMA | PATH | AUTH | PAGINATION | ...
  source            VARCHAR(20) NOT NULL DEFAULT 'deterministic', -- deterministic|llm|runtime
  confidence_score  NUMERIC(3,2) NOT NULL,
  target_path       TEXT,
  message           TEXT NOT NULL,
  hitl              BOOLEAN NOT NULL DEFAULT false,
  hitl_status       VARCHAR(16),                  -- PENDING | ACCEPTED | REJECTED
  details           JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_findings_run ON validation_findings (org_id, run_id, severity);
CREATE INDEX idx_findings_hitl ON validation_findings (org_id, hitl) WHERE hitl = true;

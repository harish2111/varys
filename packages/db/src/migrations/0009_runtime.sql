-- Runtime sandbox executions (spec §13/§14.2 — "runtime_executions follows the same
-- org-scoped pattern").
CREATE TABLE runtime_executions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL,
  run_id        UUID NOT NULL REFERENCES validation_runs(id) ON DELETE CASCADE,
  element_id    UUID REFERENCES connector_elements(id) ON DELETE SET NULL,
  mode          VARCHAR(8) NOT NULL,              -- MOCK | LIVE
  status        VARCHAR(24) NOT NULL,             -- PASSED | FAILED | BLOCKED_CREDENTIALS | ERROR
  captured_request  JSONB,
  captured_response JSONB,
  contract_diff JSONB,
  duration_ms   INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_runtime_run ON runtime_executions (org_id, run_id);

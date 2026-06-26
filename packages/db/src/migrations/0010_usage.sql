-- Per-run Gemini cost metering (spec §14.2, §15).
CREATE TABLE gemini_usage (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL,
  run_id        UUID REFERENCES validation_runs(id) ON DELETE CASCADE,
  model         VARCHAR(50) NOT NULL,
  operation     VARCHAR(24) NOT NULL DEFAULT 'validation', -- validation | embedding | rerank | ingestion
  input_tokens  INT NOT NULL DEFAULT 0,
  cached_tokens INT NOT NULL DEFAULT 0,
  output_tokens INT NOT NULL DEFAULT 0,
  cost_usd      NUMERIC(10,5) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_usage_run ON gemini_usage (org_id, run_id);
CREATE INDEX idx_usage_daily ON gemini_usage (org_id, created_at);

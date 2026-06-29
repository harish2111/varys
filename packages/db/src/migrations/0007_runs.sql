-- A validation run (spec §14.2 — "validation_runs follows the same org-scoped pattern").
CREATE TABLE validation_runs (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                 UUID NOT NULL,
  connector_id           UUID REFERENCES connectors(id) ON DELETE SET NULL,
  status                 VARCHAR(24) NOT NULL DEFAULT 'QUEUED',
  phase                  VARCHAR(24),
  options                JSONB NOT NULL DEFAULT '{}'::jsonb,
  units_total            INT NOT NULL DEFAULT 0,
  units_completed        INT NOT NULL DEFAULT 0,
  units_short_circuited  INT NOT NULL DEFAULT 0,
  queue_position         INT,
  error                  TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at           TIMESTAMPTZ
);
CREATE INDEX idx_runs_org_status ON validation_runs (org_id, status, created_at DESC);

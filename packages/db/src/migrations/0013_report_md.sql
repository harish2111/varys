-- Migration 0013: Markdown report column on validation_runs (spec §5.5, LangGraph aggregation)
ALTER TABLE validation_runs
  ADD COLUMN IF NOT EXISTS report_md TEXT,
  ADD COLUMN IF NOT EXISTS runtime_units_total   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS runtime_units_completed INTEGER NOT NULL DEFAULT 0;

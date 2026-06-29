-- Row-Level Security (spec §16). Every tenant table is filtered by org_id, which the
-- gateway sets per transaction via `SET LOCAL app.current_org_id = '<uuid>'`. The second
-- argument `true` to current_setting makes an unset GUC return NULL (=> zero rows) instead
-- of erroring — a safe default that denies access when no org context is established.

-- Ensure the application role exists and can use tenant tables (idempotent for fresh prod DBs).
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'varys_app') THEN
    CREATE ROLE varys_app LOGIN;
  END IF;
END
$$;
GRANT USAGE ON SCHEMA public TO varys_app;

DO $$
DECLARE
  t text;
  tenant_tables text[] := ARRAY[
    'api_document_namespaces',
    'api_document_chunks',
    'connectors',
    'connector_elements',
    'validation_runs',
    'validation_findings',
    'runtime_executions',
    'gemini_usage',
    'audit_log'
  ];
BEGIN
  FOREACH t IN ARRAY tenant_tables LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO varys_app', t);
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY org_isolation ON %I USING (org_id = current_setting(''app.current_org_id'', true)::uuid) WITH CHECK (org_id = current_setting(''app.current_org_id'', true)::uuid)',
      t
    );
  END LOOP;
END
$$;

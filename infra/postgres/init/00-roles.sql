-- Bootstrap the non-superuser application role used for all RLS-enforced queries.
-- The migration runner connects as varys_owner (object owner); the app connects as
-- varys_app, which is subject to Row-Level Security on every tenant table.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'varys_app') THEN
    CREATE ROLE varys_app LOGIN PASSWORD 'varys_app_pw';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE varys TO varys_app;
GRANT USAGE ON SCHEMA public TO varys_app;
-- Default privileges: varys_owner-created tables are usable by varys_app (still RLS-gated).
ALTER DEFAULT PRIVILEGES FOR ROLE varys_owner IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO varys_app;
ALTER DEFAULT PRIVILEGES FOR ROLE varys_owner IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO varys_app;

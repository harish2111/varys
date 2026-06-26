import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';

/**
 * Minimal, dependency-light forward migration runner. Applies *.sql files in lexical order
 * exactly once, tracked in the _migrations table. Runs as the object-owner role over the
 * DIRECT (non-pooled) connection because some statements (roles, GUC-dependent policies)
 * require session-level features unavailable through PgBouncer transaction pooling.
 */
export async function runMigrations(opts?: { directUrl?: string; migrationsDir?: string }): Promise<string[]> {
  const url = opts?.directUrl ?? process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_DIRECT_URL (or DATABASE_URL) must be set to run migrations');

  const dir = opts?.migrationsDir ?? join(__dirname, 'migrations');
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  const client = new Client({ connectionString: url });
  await client.connect();
  const applied: string[] = [];
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name        TEXT PRIMARY KEY,
        applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    for (const file of files) {
      const exists = await client.query('SELECT 1 FROM _migrations WHERE name = $1', [file]);
      if (exists.rowCount && exists.rowCount > 0) continue;

      const sql = readFileSync(join(dir, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        applied.push(file);
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${file} failed: ${(err as Error).message}`);
      }
    }
  } finally {
    await client.end();
  }
  return applied;
}

// CLI entrypoint: `node dist/migrate.js`
if (require.main === module) {
  runMigrations()
    .then((applied) => {
      if (applied.length === 0) console.log('No pending migrations.');
      else console.log(`Applied ${applied.length} migration(s):\n${applied.map((m) => `  - ${m}`).join('\n')}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

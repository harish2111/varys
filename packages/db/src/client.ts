import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { schema } from './schema';

export type Database = NodePgDatabase<typeof schema>;

let pool: Pool | undefined;
let db: Database | undefined;

export interface DbOptions {
  url?: string;
  max?: number;
}

/** Lazily create the shared connection pool + Drizzle instance. */
export function getDb(opts: DbOptions = {}): Database {
  if (db) return db;
  pool = new Pool({
    connectionString: opts.url ?? process.env.DATABASE_URL,
    max: opts.max ?? Number(process.env.DATABASE_POOL_MAX ?? 10),
  });
  db = drizzle(pool, { schema });
  return db;
}

export function getPool(): Pool {
  if (!pool) getDb();
  return pool!;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Run `fn` inside a transaction with the RLS org context established via
 * `SET LOCAL app.current_org_id`. Because PgBouncer runs in transaction-pooling mode,
 * SET LOCAL (transaction-scoped) is mandatory — a session-level SET could leak the org
 * context onto another tenant's borrowed connection.
 *
 * The orgId is validated as a UUID before interpolation: `SET LOCAL` does not accept bind
 * parameters, so this guard is the injection defence.
 */
export async function withOrg<T>(
  orgId: string,
  fn: (tx: Database) => Promise<T>,
  database: Database = getDb(),
): Promise<T> {
  if (!UUID_RE.test(orgId)) {
    throw new Error(`withOrg: invalid orgId (must be a UUID): ${orgId}`);
  }
  return database.transaction(async (tx) => {
    await tx.execute(sql.raw(`SET LOCAL app.current_org_id = '${orgId}'`));
    return fn(tx as unknown as Database);
  });
}

/**
 * Run `fn` in a transaction WITHOUT an org context — used only by the auth path (which
 * queries the non-RLS organizations/users/memberships/api_keys tables).
 */
export async function withoutOrg<T>(fn: (tx: Database) => Promise<T>, database: Database = getDb()): Promise<T> {
  return database.transaction(async (tx) => fn(tx as unknown as Database));
}

export async function closeDb(): Promise<void> {
  await pool?.end();
  pool = undefined;
  db = undefined;
}

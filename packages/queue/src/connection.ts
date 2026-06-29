import { Redis } from 'ioredis';

let connection: Redis | undefined;

/**
 * Shared ioredis connection for BullMQ. `maxRetriesPerRequest: null` is required by BullMQ
 * for blocking commands. The queue logical DB (0) uses a no-eviction policy (spec §5.8).
 */
export function getRedis(url = process.env.REDIS_URL): Redis {
  if (connection) return connection;
  if (!url) throw new Error('REDIS_URL is required');
  connection = new Redis(url, { maxRetriesPerRequest: null });
  return connection;
}

export async function closeRedis(): Promise<void> {
  await connection?.quit();
  connection = undefined;
}

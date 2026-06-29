import { Controller, Get } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { getDb } from '@varys/db';

@Controller()
export class HealthController {
  @Get('healthz')
  liveness() {
    return { status: 'ok' };
  }

  @Get('readyz')
  async readiness() {
    try {
      await getDb().execute(sql`SELECT 1`);
      return { status: 'ready', db: 'up' };
    } catch {
      return { status: 'degraded', db: 'down' };
    }
  }
}

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { loadConfig } from '@varys/config';
import { createLogger } from '@varys/telemetry';
import { AppModule } from './app.module';

async function bootstrap() {
  loadConfig();
  const logger = createLogger({ service: 'qa-orchestrator' });
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  app.enableShutdownHooks();
  logger.info('qa-orchestrator worker started');
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start qa-orchestrator', err);
  process.exit(1);
});

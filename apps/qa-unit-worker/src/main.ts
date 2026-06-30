import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { loadConfig } from '@varys/config';
import { createLogger, startTelemetry } from '@varys/telemetry';
import { AppModule } from './app.module';

async function bootstrap() {
  startTelemetry({ serviceName: 'qa-unit-worker' });
  loadConfig();
  const logger = createLogger({ service: 'qa-unit-worker' });
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  app.enableShutdownHooks();
  logger.info('qa-unit-worker started');
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start qa-unit-worker', err);
  process.exit(1);
});

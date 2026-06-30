import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { loadConfig } from '@varys/config';
import { createLogger, startTelemetry } from '@varys/telemetry';
import { AppModule } from './app.module';

async function bootstrap() {
  startTelemetry({ serviceName: 'qa-aggregator' });
  loadConfig();
  const logger = createLogger({ service: 'qa-aggregator' });
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  app.enableShutdownHooks();
  logger.info('qa-aggregator worker started');
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start qa-aggregator', err);
  process.exit(1);
});

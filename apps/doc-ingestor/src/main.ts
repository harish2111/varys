import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { loadConfig } from '@varys/config';
import { createLogger, startTelemetry } from '@varys/telemetry';
import { AppModule } from './app.module';

async function bootstrap() {
  startTelemetry({ serviceName: 'doc-ingestor' });
  loadConfig();
  const logger = createLogger({ service: 'doc-ingestor' });
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  app.enableShutdownHooks();
  logger.info('doc-ingestor worker started');
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start doc-ingestor', err);
  process.exit(1);
});

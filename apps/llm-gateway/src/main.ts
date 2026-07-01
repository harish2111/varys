import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { loadConfig } from '@varys/config';
import { createLogger, startTelemetry } from '@varys/telemetry';
import { AppModule } from './app.module';

async function bootstrap() {
  startTelemetry({ serviceName: 'llm-gateway' });
  const config = loadConfig();
  const logger = createLogger({ service: 'llm-gateway' });
  const app = await NestFactory.create(AppModule, { logger: false });
  app.enableShutdownHooks();
  await app.listen(config.LLM_GATEWAY_PORT);
  logger.info({ port: config.LLM_GATEWAY_PORT }, 'llm-gateway listening');
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start llm-gateway', err);
  process.exit(1);
});

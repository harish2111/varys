import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { loadConfig } from '@varys/config';
import { createLogger, startTelemetry } from '@varys/telemetry';
import { AppModule } from './app.module';

async function bootstrap() {
  startTelemetry({ serviceName: 'qa-gateway' });
  const config = loadConfig();
  const logger = createLogger({ service: 'qa-gateway' });

  const app = await NestFactory.create(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableShutdownHooks();

  await app.listen(config.GATEWAY_PORT);
  logger.info({ port: config.GATEWAY_PORT }, 'qa-gateway listening');
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start qa-gateway', err);
  process.exit(1);
});

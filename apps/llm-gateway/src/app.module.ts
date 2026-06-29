import { Module } from '@nestjs/common';
import { configProvider } from './config';
import { HealthController } from './health.controller';
import { InternalGuard } from './internal.guard';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';

@Module({
  controllers: [LlmController, HealthController],
  providers: [configProvider, LlmService, InternalGuard],
})
export class AppModule {}

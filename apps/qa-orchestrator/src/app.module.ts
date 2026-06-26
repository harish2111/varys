import { Module } from '@nestjs/common';
import { configProvider } from './config';
import { OrchestratorService } from './orchestrator.service';
import { OrchestratorWorker } from './orchestrator.worker';

@Module({
  providers: [configProvider, OrchestratorService, OrchestratorWorker],
})
export class AppModule {}

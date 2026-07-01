import { Module } from '@nestjs/common';
import { configProvider } from './config';
import { SandboxWorker } from './sandbox.worker';

@Module({
  providers: [configProvider, SandboxWorker],
})
export class AppModule {}

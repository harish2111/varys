import { Module } from '@nestjs/common';
import { configProvider } from './config';
import { IngestWorker } from './ingest.worker';

@Module({
  providers: [configProvider, IngestWorker],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { configProvider } from './config';
import { AggregatorService } from './aggregator.service';
import { AggregatorWorker } from './aggregator.worker';

@Module({
  providers: [configProvider, AggregatorService, AggregatorWorker],
})
export class AppModule {}

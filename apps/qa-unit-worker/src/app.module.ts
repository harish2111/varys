import { Module } from '@nestjs/common';
import { configProvider } from './config';
import { UnitWorker } from './unit.worker';

@Module({
  providers: [configProvider, UnitWorker],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConnectorsModule } from './connectors/connectors.module';
import { HealthController } from './health.controller';
import { RunsModule } from './runs/runs.module';

@Module({
  imports: [AuthModule, ConnectorsModule, RunsModule],
  controllers: [HealthController],
})
export class AppModule {}

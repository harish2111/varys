import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { IngestionController } from './ingestion.controller';

@Module({
  imports: [AuthModule],
  controllers: [IngestionController],
})
export class IngestionModule {}

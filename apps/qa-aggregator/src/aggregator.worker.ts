import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import type { AggregateJob } from '@varys/contracts';
import { QUEUE, type Worker, createWorker } from '@varys/queue';
import { createLogger } from '@varys/telemetry';
import { CONFIG, type AppConfig } from './config';
import { AggregatorService } from './aggregator.service';

const logger = createLogger({ service: 'qa-aggregator' });

@Injectable()
export class AggregatorWorker implements OnModuleInit, OnModuleDestroy {
  private worker?: Worker<AggregateJob>;

  constructor(
    private readonly service: AggregatorService,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}

  onModuleInit(): void {
    this.worker = createWorker<AggregateJob>(
      QUEUE.AGGREGATE,
      async (job) => {
        await this.service.process(job.data);
        logger.info({ runId: job.data.runId }, 'run finalized');
      },
      { concurrency: 4 },
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}

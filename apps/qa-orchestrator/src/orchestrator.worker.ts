import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import type { AppJob } from '@varys/contracts';
import { QUEUE, type Worker, createWorker } from '@varys/queue';
import { createLogger } from '@varys/telemetry';
import { CONFIG, type AppConfig } from './config';
import { OrchestratorService } from './orchestrator.service';

const logger = createLogger({ service: 'qa-orchestrator' });

/**
 * BullMQ consumer for the app queue. Worker concurrency equals APP_QUEUE_CONCURRENCY, which
 * is the global admission limit (spec §4.3) — at most that many apps process concurrently.
 */
@Injectable()
export class OrchestratorWorker implements OnModuleInit, OnModuleDestroy {
  private worker?: Worker<AppJob>;

  constructor(
    private readonly service: OrchestratorService,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}

  onModuleInit(): void {
    this.worker = createWorker<AppJob>(
      QUEUE.APP,
      async (job) => {
        logger.info({ runId: job.data.runId, namespace: job.data.namespace }, 'processing app job');
        try {
          await this.service.process(job.data);
          logger.info({ runId: job.data.runId }, 'app job complete');
        } catch (err) {
          logger.error({ runId: job.data.runId, err: (err as Error).message }, 'app job failed');
          await this.service.fail(job.data, (err as Error).message);
          throw err;
        }
      },
      { concurrency: this.config.APP_QUEUE_CONCURRENCY },
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}

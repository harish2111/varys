import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import type { UnitJob } from '@varys/contracts';
import { QUEUE, type Worker, createWorker } from '@varys/queue';
import { createLogger } from '@varys/telemetry';
import { CONFIG, type AppConfig } from './config';
import { UnitService } from './unit.service';

const logger = createLogger({ service: 'qa-unit-worker' });

/**
 * Consumes the unit queue. Each pod runs several concurrent in-flight jobs (I/O-bound on
 * Gemini); the llm-gateway governor — not the pod count — is the true throttle (spec §4.3).
 */
@Injectable()
export class UnitWorker implements OnModuleInit, OnModuleDestroy {
  private worker?: Worker<UnitJob>;
  private readonly service: UnitService;

  constructor(@Inject(CONFIG) private readonly config: AppConfig) {
    this.service = new UnitService(config);
  }

  onModuleInit(): void {
    this.worker = createWorker<UnitJob>(
      QUEUE.UNIT,
      async (job) => {
        await this.service.process(job.data);
        logger.info({ runId: job.data.runId, unit: job.data.unit.key }, 'unit validated');
      },
      { concurrency: this.config.UNIT_WORKER_CONCURRENCY },
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}

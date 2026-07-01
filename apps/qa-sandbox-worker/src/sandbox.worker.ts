import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import type { RuntimeJob } from '@varys/contracts';
import { QUEUE, type Worker, createWorker } from '@varys/queue';
import { createLogger } from '@varys/telemetry';
import { CONFIG, type AppConfig } from './config';
import { SandboxService } from './sandbox.service';

const logger = createLogger({ service: 'qa-sandbox-worker' });

/**
 * Consumes the runtime queue. Each job runs a full LangGraph validation workflow for one
 * element (Action or Trigger) — transpile → isolate → diff → LLM analysis → retry.
 */
@Injectable()
export class SandboxWorker implements OnModuleInit, OnModuleDestroy {
  private worker?: Worker<RuntimeJob>;
  private readonly service: SandboxService;

  constructor(@Inject(CONFIG) private readonly config: AppConfig) {
    this.service = new SandboxService(config);
  }

  onModuleInit(): void {
    this.worker = createWorker<RuntimeJob>(
      QUEUE.RUNTIME,
      async (job) => {
        await this.service.process(job.data);
        logger.info({ runId: job.data.runId, unit: job.data.unit.key }, 'sandbox run complete');
      },
      { concurrency: this.config.SANDBOX_WORKER_CONCURRENCY ?? 4 },
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}

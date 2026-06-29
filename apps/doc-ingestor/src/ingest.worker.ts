import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import type { IngestionJob } from '@varys/contracts';
import { QUEUE, type Worker, createWorker } from '@varys/queue';
import { createLogger } from '@varys/telemetry';
import { CONFIG, type AppConfig } from './config';
import { IngestService } from './ingest.service';

const logger = createLogger({ service: 'doc-ingestor' });

@Injectable()
export class IngestWorker implements OnModuleInit, OnModuleDestroy {
  private worker?: Worker<IngestionJob>;
  private readonly service: IngestService;

  constructor(@Inject(CONFIG) private readonly config: AppConfig) {
    this.service = new IngestService(config);
  }

  onModuleInit(): void {
    this.worker = createWorker<IngestionJob>(
      QUEUE.INGESTION,
      async (job) => {
        const res = await this.service.ingest(job.data);
        logger.info({ namespace: job.data.namespace, chunks: res.chunks }, 'ingestion job done');
      },
      { concurrency: 2 },
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}

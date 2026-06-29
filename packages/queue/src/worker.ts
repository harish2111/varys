import { runWithTrace } from '@varys/telemetry';
import { type Job, type Processor, Worker, type WorkerOptions } from 'bullmq';
import { getRedis } from './connection';
import type { QueueName } from './queues';

export interface WorkerConfig {
  concurrency: number;
}

/**
 * Create a BullMQ worker that restores the OpenTelemetry trace context carried in the job
 * payload before invoking the processor (spec §17 — trace propagates across BullMQ).
 */
export function createWorker<T extends { trace?: unknown }>(
  queue: QueueName,
  processor: Processor<T>,
  config: WorkerConfig,
): Worker<T> {
  const wrapped: Processor<T> = (job: Job<T>, token?: string) =>
    runWithTrace((job.data as { trace?: never }).trace, () => processor(job, token));

  const opts: WorkerOptions = { connection: getRedis(), concurrency: config.concurrency };
  return new Worker<T>(queue, wrapped, opts);
}

import type { AggregateJob, AppJob, IngestionJob, RuntimeJob, UnitJob } from '@varys/contracts';
import { Queue, type QueueOptions } from 'bullmq';
import { getRedis } from './connection';

/** The two-tier queue topology (spec §4.1) plus runtime, aggregate, and ingestion queues. */
export const QUEUE = {
  APP: 'qa-app',
  UNIT: 'qa-unit',
  RUNTIME: 'qa-runtime',
  AGGREGATE: 'qa-aggregate',
  INGESTION: 'qa-ingestion',
} as const;

export type QueueName = (typeof QUEUE)[keyof typeof QUEUE];

const defaultJobOptions: QueueOptions['defaultJobOptions'] = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: { age: 86400, count: 5000 },
  removeOnFail: { age: 604800 },
};

function makeQueue<T>(name: QueueName): Queue<T> {
  return new Queue<T>(name, { connection: getRedis(), defaultJobOptions });
}

let appQueue: Queue<AppJob> | undefined;
let unitQueue: Queue<UnitJob> | undefined;
let runtimeQueue: Queue<RuntimeJob> | undefined;
let aggregateQueue: Queue<AggregateJob> | undefined;
let ingestionQueue: Queue<IngestionJob> | undefined;

export const getAppQueue = () => (appQueue ??= makeQueue<AppJob>(QUEUE.APP));
export const getUnitQueue = () => (unitQueue ??= makeQueue<UnitJob>(QUEUE.UNIT));
export const getRuntimeQueue = () => (runtimeQueue ??= makeQueue<RuntimeJob>(QUEUE.RUNTIME));
export const getAggregateQueue = () => (aggregateQueue ??= makeQueue<AggregateJob>(QUEUE.AGGREGATE));
export const getIngestionQueue = () => (ingestionQueue ??= makeQueue<IngestionJob>(QUEUE.INGESTION));

export async function closeQueues(): Promise<void> {
  await Promise.all([
    appQueue?.close(),
    unitQueue?.close(),
    runtimeQueue?.close(),
    aggregateQueue?.close(),
    ingestionQueue?.close(),
  ]);
  appQueue = unitQueue = runtimeQueue = aggregateQueue = ingestionQueue = undefined;
}

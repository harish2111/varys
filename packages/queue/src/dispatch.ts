import type { UnitJob } from '@varys/contracts';
import { getUnitQueue } from './queues';

/**
 * Enqueue a connector's units with weighted-fair interleaving across apps (spec §4.1).
 *
 * BullMQ priority: a lower value is dequeued first. By assigning each unit a priority equal
 * to its 1-based position within its own app batch, the Nth unit of every active app is
 * scheduled ahead of the (N+1)th unit of any app. The result is round-robin across the
 * active app groups, so a 300-unit connector cannot starve a 25-unit one — each active app
 * makes simultaneous forward progress.
 */
export async function enqueueUnitsFair(units: UnitJob[]): Promise<void> {
  const queue = getUnitQueue();
  await queue.addBulk(
    units.map((unit, idx) => ({
      name: unit.appGroup,
      data: unit,
      opts: {
        // position within this app's batch -> fair interleave; capped to BullMQ's range.
        priority: Math.min(idx + 1, 2_000_000),
        jobId: `${unit.runId}:${unit.unit.key}`,
      },
    })),
  );
}

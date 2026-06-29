import { createHash } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { extractConnector } from '@varys/ast';
import { type SubmitConnectorDto, type SubmitConnectorResponse } from '@varys/contracts';
import { connectors, getDb, validationRuns, withOrg } from '@varys/db';
import { getAppQueue } from '@varys/queue';
import { injectTrace } from '@varys/telemetry';
import type { Principal } from '../auth/principal';

@Injectable()
export class ConnectorsService {
  async submit(principal: Principal, dto: SubmitConnectorDto): Promise<SubmitConnectorResponse> {
    // Phase 1 static extraction up front so we can report unit count and fail fast on bad source.
    let extracted;
    try {
      extracted = extractConnector(dto.source);
    } catch (err) {
      throw new BadRequestException(`Connector parse failed: ${(err as Error).message}`);
    }

    const namespace = dto.meta.namespace ?? extracted.namespace;
    const sourceHash = createHash('sha256').update(dto.source).digest('hex');
    const db = getDb();

    const runId = await withOrg(principal.orgId, async (tx) => {
      const [connector] = await tx
        .insert(connectors)
        .values({
          orgId: principal.orgId,
          namespace,
          appId: extracted.appId,
          name: dto.meta.name ?? extracted.name,
          version: extracted.version,
          contractKind: extracted.contractKind,
          sourceHash,
        })
        .returning({ id: connectors.id });

      const [run] = await tx
        .insert(validationRuns)
        .values({
          orgId: principal.orgId,
          connectorId: connector.id,
          status: 'QUEUED',
          options: dto.options,
          unitsTotal: extracted.units.length,
        })
        .returning({ id: validationRuns.id });
      return run.id;
    }, db);

    // Admission: the app queue's worker concurrency (= APP_QUEUE_CONCURRENCY) is the global
    // limit; the 11th app simply waits in the queue rather than degrading the nine in flight.
    const appQueue = getAppQueue();
    await appQueue.add(
      'app',
      {
        runId,
        orgId: principal.orgId,
        source: dto.source,
        namespace,
        deterministicOnly: dto.options.deterministicOnly,
        runtime: dto.options.runtime,
        live: dto.options.live,
        trace: injectTrace(),
      },
      { jobId: runId },
    );
    const waiting = await appQueue.getWaitingCount();

    return {
      runId,
      status: 'QUEUED',
      unitsDiscovered: extracted.units.length,
      admitted: true,
      queuePosition: waiting,
    };
  }
}

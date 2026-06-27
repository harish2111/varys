import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { IngestionJob } from '@varys/contracts';
import { getIngestionQueue } from '@varys/queue';
import { injectTrace } from '@varys/telemetry';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentPrincipal, type Principal } from '../auth/principal';

interface IngestionRequest {
  namespace: string;
  vendor: string;
  apiVersion: string;
  contractKind: 'REST' | 'GRAPHQL';
  openapi?: unknown;
  graphqlSdl?: string;
  rootUrl?: string;
  allowedDomains?: string[];
}

@Controller('v1/ingestion')
@UseGuards(AuthGuard)
export class IngestionController {
  @Post('run')
  async run(@CurrentPrincipal() principal: Principal, @Body() body: IngestionRequest) {
    if (!body.namespace || !body.vendor || !body.apiVersion) {
      throw new BadRequestException('namespace, vendor and apiVersion are required');
    }
    if (!body.openapi && !body.graphqlSdl && !body.rootUrl) {
      throw new BadRequestException('one of openapi, graphqlSdl or rootUrl is required');
    }
    const job: IngestionJob = {
      orgId: principal.orgId,
      namespace: body.namespace,
      vendor: body.vendor,
      apiVersion: body.apiVersion,
      contractKind: body.contractKind ?? 'REST',
      openapi: body.openapi,
      graphqlSdl: body.graphqlSdl,
      rootUrl: body.rootUrl,
      allowedDomains: body.allowedDomains,
      trace: injectTrace(),
    };
    await getIngestionQueue().add('ingest', job, { jobId: `ingest:${principal.orgId}:${body.namespace}` });
    return { accepted: true, namespace: body.namespace };
  }
}

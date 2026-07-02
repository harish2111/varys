import { Body, Controller, Get, Header, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentPrincipal, type Principal } from '../auth/principal';
import { RunsService } from './runs.service';

@Controller('v1/runs')
@UseGuards(AuthGuard)
export class RunsController {
  constructor(private readonly runs: RunsService) {}

  @Get()
  list(@CurrentPrincipal() principal: Principal, @Query('limit') limit?: string) {
    return this.runs.list(principal, limit ? Number(limit) : 50);
  }

  @Get(':id')
  status(@CurrentPrincipal() principal: Principal, @Param('id') id: string) {
    return this.runs.getStatus(principal, id);
  }

  @Get(':id/report')
  report(@CurrentPrincipal() principal: Principal, @Param('id') id: string) {
    return this.runs.getReport(principal, id);
  }

  /** GET /v1/runs/:id/report/markdown — returns the consolidated Markdown report as plain text. */
  @Get(':id/report/markdown')
  @Header('Content-Type', 'text/markdown; charset=utf-8')
  reportMarkdown(@CurrentPrincipal() principal: Principal, @Param('id') id: string) {
    return this.runs.getReportMarkdown(principal, id);
  }

  /** POST /v1/runs/:runId/findings/:findingId/repair — generate a patch suggestion for a finding. */
  @Post(':runId/findings/:findingId/repair')
  repairFinding(
    @CurrentPrincipal() principal: Principal,
    @Param('runId') runId: string,
    @Param('findingId') findingId: string,
    @Body('source') source: string,
  ) {
    return this.runs.repairFinding(principal, runId, findingId, source);
  }

  /** PATCH /v1/runs/:runId/findings/:findingId/review — record HITL approve/reject decision. */
  @Patch(':runId/findings/:findingId/review')
  reviewFinding(
    @CurrentPrincipal() principal: Principal,
    @Param('runId') runId: string,
    @Param('findingId') findingId: string,
    @Body('decision') decision: 'APPROVED' | 'REJECTED',
    @Body('note') note?: string,
  ) {
    return this.runs.reviewFinding(principal, runId, findingId, decision, note);
  }
}

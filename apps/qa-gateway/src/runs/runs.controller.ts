import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
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
}

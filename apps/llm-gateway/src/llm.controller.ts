import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { ValidateUnitRequest } from '@varys/llm-client';
import { InternalGuard } from './internal.guard';
import { LlmService } from './llm.service';

@Controller('v1/llm')
@UseGuards(InternalGuard)
export class LlmController {
  constructor(private readonly llm: LlmService) {}

  @Post('validate-unit')
  validateUnit(@Body() body: ValidateUnitRequest) {
    return this.llm.validateUnit(body);
  }

  @Post('embed')
  embed(@Body() body: { text: string; runId?: string; orgId?: string }) {
    return this.llm.embed(body.text, body.runId, body.orgId);
  }
}

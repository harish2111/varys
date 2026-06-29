import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { submitConnectorSchema } from '@varys/contracts';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentPrincipal, type Principal } from '../auth/principal';
import { ConnectorsService } from './connectors.service';

@Controller('v1/connectors')
@UseGuards(AuthGuard)
export class ConnectorsController {
  constructor(private readonly connectors: ConnectorsService) {}

  /** Submit a connector (stringified .ts) for validation. Returns a run id immediately. */
  @Post('validate')
  async validate(@CurrentPrincipal() principal: Principal, @Body() body: unknown) {
    const parsed = submitConnectorSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
    }
    return this.connectors.submit(principal, parsed.data);
  }
}

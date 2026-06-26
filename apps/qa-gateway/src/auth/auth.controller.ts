import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentPrincipal, type Principal } from './principal';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string; orgName: string }) {
    return this.auth.register(body.email, body.password, body.orgName);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  @Post('api-keys')
  @UseGuards(AuthGuard)
  createApiKey(@CurrentPrincipal() principal: Principal, @Body() body: { name: string }) {
    return this.auth.createApiKey(principal.orgId, body.name, principal.actorId);
  }
}

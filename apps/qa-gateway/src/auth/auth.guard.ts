import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

/** Authenticates via `Authorization: Bearer <jwt>` or `X-Api-Key: <prefix.secret>`. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const apiKey = req.headers['x-api-key'];
    if (typeof apiKey === 'string' && apiKey.length > 0) {
      req.principal = await this.auth.verifyApiKey(apiKey);
      return true;
    }
    const authz = req.headers['authorization'];
    if (typeof authz === 'string' && authz.startsWith('Bearer ')) {
      req.principal = this.auth.verifyJwt(authz.slice(7));
      return true;
    }
    throw new UnauthorizedException('Missing credentials');
  }
}

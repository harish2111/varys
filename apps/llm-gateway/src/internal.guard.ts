import { type CanActivate, type ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CONFIG, type AppConfig } from './config';

/** Cluster-internal auth: only services holding INTERNAL_SERVICE_SECRET may call the gateway. */
@Injectable()
export class InternalGuard implements CanActivate {
  constructor(@Inject(CONFIG) private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const provided = req.headers['x-internal-auth'];
    if (provided !== this.config.INTERNAL_SERVICE_SECRET) {
      throw new UnauthorizedException('Invalid internal credentials');
    }
    return true;
  }
}

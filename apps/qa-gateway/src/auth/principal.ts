import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

/** The authenticated caller, resolved by AuthGuard and attached to the request. */
export interface Principal {
  orgId: string;
  actorId: string;
  role: string;
  type: 'user' | 'api_key';
}

export const CurrentPrincipal = createParamDecorator((_data: unknown, ctx: ExecutionContext): Principal => {
  const req = ctx.switchToHttp().getRequest();
  return req.principal as Principal;
});

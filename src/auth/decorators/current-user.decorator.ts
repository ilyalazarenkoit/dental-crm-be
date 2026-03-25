import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  sub: string;          // user ID
  org: string;          // organization ID (M-1: added to JWT payload)
  jti: string;          // JWT ID for blacklist lookup
  fingerprint: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

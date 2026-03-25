import { Injectable, Inject, Scope, UnauthorizedException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CurrentUserPayload } from '@/auth/decorators/current-user.decorator';

/**
 * Reads organizationId directly from the JWT payload (field `org`).
 * No DB query needed — eliminates the extra SELECT on every request (M-1).
 * Uses REQUEST scope to access the request object.
 */
@Injectable({ scope: Scope.REQUEST })
export class OrganizationContextService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  // C-2: Throws UnauthorizedException (HTTP 401) instead of raw Error
  getOrganizationId(): string {
    const userPayload = this.request['user'] as CurrentUserPayload | undefined;

    if (!userPayload?.sub) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!userPayload?.org) {
      // Old token without org claim — force re-login
      throw new UnauthorizedException('Please log in again to continue');
    }

    return userPayload.org;
  }
}

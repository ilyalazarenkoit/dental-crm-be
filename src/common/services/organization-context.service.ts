import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { CurrentUserPayload } from '@/auth/decorators/current-user.decorator';

/**
 * Service for managing organization context in multi-tenant architecture
 * Gets organizationId from current user's JWT token
 * Uses REQUEST scope to access request object
 */
@Injectable({ scope: Scope.REQUEST })
export class OrganizationContextService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get organization ID from current authenticated user
   * Gets userId from JWT token and retrieves organizationId from database
   */
  async getOrganizationId(): Promise<string> {
    // Get user from request (set by JwtAuthGuard)
    const userPayload = this.request['user'] as CurrentUserPayload | undefined;

    if (!userPayload || !userPayload.sub) {
      throw new Error('User not authenticated');
    }

    // Get user from database to get organizationId
    const user = await this.userRepository.findOne({
      where: { id: userPayload.sub },
      select: ['id', 'organizationId'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.organizationId;
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { OrganizationContextService } from '../services/organization-context.service';

/**
 * Interceptor to pre-load organization context for the current request
 * This ensures organizationId is available throughout the request lifecycle
 */
@Injectable()
export class OrganizationContextInterceptor implements NestInterceptor {
  constructor(private organizationContextService: OrganizationContextService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // Pre-load organization ID to cache it
    try {
      await this.organizationContextService.getOrganizationId();
    } catch (error) {
      // If user is not authenticated, let the guard handle it
      // This is fine for public routes
    }

    return next.handle();
  }
}

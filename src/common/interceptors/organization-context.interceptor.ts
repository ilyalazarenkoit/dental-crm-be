import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * After M-1 (organizationId read from JWT payload), there is nothing to pre-load —
 * getOrganizationId() is a pure synchronous read from request.user.org with no side effects.
 * The interceptor is retained in the pipeline for backward compatibility but is a no-op.
 *
 * Root cause of the removed injection: OrganizationContextService is REQUEST-scoped
 * (it holds @Inject(REQUEST)), which cannot be injected into a singleton interceptor
 * obtained via app.get(). The pre-loading logic that justified the injection no longer exists.
 */
@Injectable()
export class OrganizationContextInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle();
  }
}

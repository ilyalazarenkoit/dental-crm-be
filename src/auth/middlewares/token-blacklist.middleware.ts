import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * H-1: Blacklist enforcement has been moved to JwtAuthGuard where the DB lookup
 * is done asynchronously by jti. This middleware is retained as a no-op to avoid
 * breaking the middleware pipeline — it can be removed in a future cleanup.
 */
@Injectable()
export class TokenBlacklistMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    next();
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface ExtendedRequest extends Request {
  userAgent?: string;
  clientIp?: string;
}

/**
 * M-7: Removed dead cookie logic — cookies 'jwt' and 'access_token' were never
 * set by the login endpoint (access token is returned in response body and stored
 * in memory by the client). The middleware now only enriches the request with
 * fingerprinting metadata used by TokenService.
 *
 * M-6: getClientIp() uses req.ip which respects the Express 'trust proxy' setting,
 * making it resistant to spoofed x-forwarded-for headers when configured correctly.
 */
@Injectable()
export class JwtCookieMiddleware implements NestMiddleware {
  use(req: ExtendedRequest, res: Response, next: NextFunction) {
    req.userAgent = req.headers['user-agent'] || 'unknown';
    req.clientIp = this.getClientIp(req);
    next();
  }

  private getClientIp(req: Request): string {
    // req.ip respects Express trust proxy setting (set in bootstrap for production)
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}

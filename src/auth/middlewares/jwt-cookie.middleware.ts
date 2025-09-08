import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

// Extended Request interface with custom properties
interface ExtendedRequest extends Request {
  userAgent?: string;
  clientIp?: string;
}

@Injectable()
export class JwtCookieMiddleware implements NestMiddleware {
  use(req: ExtendedRequest, res: Response, next: NextFunction) {
    // Extract JWT token from cookie
    const token = req.cookies?.jwt || req.cookies?.access_token;

    if (token) {
      req.headers.authorization = `Bearer ${token}`;
    }

    // Add information for fingerprinting
    req.userAgent = req.headers["user-agent"] || "unknown";
    req.clientIp = this.getClientIp(req);

    next();
  }

  private getClientIp(req: Request): string {
    // Check various headers to get real IP
    const xForwardedFor = req.headers["x-forwarded-for"];
    const xRealIp = req.headers["x-real-ip"];
    const cfConnectingIp = req.headers["cf-connecting-ip"];

    if (cfConnectingIp) {
      return Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp;
    }

    if (xRealIp) {
      return Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
    }

    if (xForwardedFor) {
      const ips = Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : xForwardedFor;
      return ips.split(",")[0].trim();
    }

    return (
      req.connection.remoteAddress || req.socket.remoteAddress || "unknown"
    );
  }
}

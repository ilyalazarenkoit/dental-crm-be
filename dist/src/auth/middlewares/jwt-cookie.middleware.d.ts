import { NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
interface ExtendedRequest extends Request {
    userAgent?: string;
    clientIp?: string;
}
export declare class JwtCookieMiddleware implements NestMiddleware {
    use(req: ExtendedRequest, res: Response, next: NextFunction): void;
    private getClientIp;
}
export {};

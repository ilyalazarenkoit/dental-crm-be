import { NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { TokenBlacklistService } from "../services/token-blacklist.service";
export declare class TokenBlacklistMiddleware implements NestMiddleware {
    private tokenBlacklistService;
    constructor(tokenBlacklistService: TokenBlacklistService);
    use(req: Request, res: Response, next: NextFunction): void;
}

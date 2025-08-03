import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { TokenBlacklistService } from "../services/token-blacklist.service";

@Injectable()
export class TokenBlacklistMiddleware implements NestMiddleware {
  constructor(private tokenBlacklistService: TokenBlacklistService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);

      // Проверяем, находится ли токен в черном списке
      if (this.tokenBlacklistService.isTokenBlacklisted(token)) {
        throw new UnauthorizedException("Token has been invalidated");
      }
    }

    next();
  }
}

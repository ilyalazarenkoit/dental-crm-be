import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class JwtCookieMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Если заголовок Authorization уже есть, не трогаем его
    if (req.headers.authorization) {
      next();
      return;
    }

    // Проверяем наличие токена в cookie
    const token = req.cookies["accessToken"];

    if (token) {
      // Добавляем токен в заголовок Authorization
      req.headers.authorization = `Bearer ${token}`;
    }

    next();
  }
}

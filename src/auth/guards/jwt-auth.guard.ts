import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtService } from "@nestjs/jwt";
import { TokenBlacklistService } from "../services/token-blacklist.service";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(
    private jwtService: JwtService,
    private tokenBlacklistService: TokenBlacklistService,
    private reflector: Reflector
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Проверяем, помечен ли маршрут как публичный
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Пробуем получить токен из заголовка Authorization
    let token = this.extractTokenFromHeader(request);

    // Если токена нет в заголовке, пробуем получить из cookie
    if (!token) {
      token = request.cookies["accessToken"];
    }

    if (!token) {
      throw new UnauthorizedException("JWT token is missing");
    }

    try {
      // Проверяем, не находится ли токен в черном списке
      if (this.tokenBlacklistService.isTokenBlacklisted(token)) {
        throw new UnauthorizedException("Token has been invalidated");
      }

      // Проверяем валидность токена
      const payload = this.jwtService.verify(token);

      // Сохраняем payload в request для дальнейшего использования
      request["user"] = payload;

      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid JWT token");
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}

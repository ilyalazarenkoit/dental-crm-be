import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private tokenService: TokenService,
    private tokenBlacklistService: TokenBlacklistService,
    private reflector: Reflector,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    let token = this.extractTokenFromHeader(request);
    if (!token) {
      token = request.cookies['accessToken'];
    }

    if (!token) {
      throw new UnauthorizedException('JWT token is missing');
    }

    try {
      if (this.tokenBlacklistService.isTokenBlacklisted(token)) {
        throw new UnauthorizedException('Token has been invalidated');
      }

      const payload = this.tokenService.verifyToken(token);

      if (!payload) {
        throw new UnauthorizedException('Invalid JWT token');
      }

      request['user'] = payload;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid JWT token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

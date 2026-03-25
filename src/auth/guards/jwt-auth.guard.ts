import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private tokenService: TokenService,
    private tokenBlacklistService: TokenBlacklistService,
    private reflector: Reflector,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
      const payload = this.tokenService.verifyToken(token);

      if (!payload) {
        throw new UnauthorizedException('Invalid JWT token');
      }

      // H-1: Check DB blacklist by jti (survives restarts, works multi-pod)
      const jti = payload?.jti as string | undefined;
      if (jti && (await this.tokenBlacklistService.isTokenBlacklisted(jti))) {
        throw new UnauthorizedException('Token has been revoked');
      }

      request['user'] = payload;
      return true;
    } catch (error) {
      // L-9: Re-throw HttpExceptions as-is; only wrap unexpected errors
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Unexpected error in JwtAuthGuard', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

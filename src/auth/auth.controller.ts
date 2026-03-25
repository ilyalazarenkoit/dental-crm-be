import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Headers,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './decorators/public.decorator';

interface ExtendedRequest extends Request {
  userAgent?: string;
  clientIp?: string;
}

// L-4: Single source of truth for refresh token cookie options
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/auth/refresh',
    maxAge: REFRESH_COOKIE_MAX_AGE,
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // C-1: Strict rate limit for registration: 3 attempts/hour per IP
  @Public()
  @Throttle({ short: { ttl: 3600000, limit: 3 } })
  @Post('register/owner')
  async registerOwner(@Body() registerOwnerDto: RegisterOwnerDto) {
    return this.authService.registerOwner(registerOwnerDto);
  }

  // C-1: Strict rate limit for login: 5 attempts/minute per IP
  @Public()
  @Throttle({ short: { ttl: 60000, limit: 5 } })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: ExtendedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const userAgent = request.headers['user-agent'];
    const clientIp = request.clientIp || request.ip || 'unknown';

    const result = await this.authService.login(loginDto, userAgent, clientIp);

    response.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Public()
  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Req() request: ExtendedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const userAgent = request.headers['user-agent'];
    const clientIp = request.clientIp || request.ip || 'unknown';

    const result = await this.authService.verifyEmail(
      token,
      userAgent,
      clientIp,
    );

    if ('user' in result && result.user && 'accessToken' in result) {
      if ('refreshToken' in result) {
        response.cookie(
          'refreshToken',
          result.refreshToken,
          getRefreshCookieOptions(),
        );
      }

      return {
        accessToken: result.accessToken,
        user: result.user,
      };
    }

    return result;
  }

  // C-1: Rate limit resend: 3 attempts/hour per IP
  @Public()
  @Throttle({ short: { ttl: 3600000, limit: 3 } })
  @Post('resend-verification')
  async resendVerificationEmail(@Body() { email }: { email: string }) {
    return this.authService.resendVerificationEmail(email);
  }

  // C-1: Rate limit forgot-password: 3 attempts/hour per IP
  @Public()
  @Throttle({ short: { ttl: 3600000, limit: 3 } })
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  // C-1: Rate limit reset-password: 5 attempts/hour per IP
  @Public()
  @Throttle({ short: { ttl: 3600000, limit: 5 } })
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('logout')
  async logout(
    @Headers('authorization') authHeader: string,
    @Req() request: ExtendedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.logout(authHeader);

    response.clearCookie('refreshToken', {
      path: '/auth/refresh',
    });

    return result;
  }

  @Public()
  @Post('refresh')
  async refreshToken(
    @Req() request: ExtendedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken;
    const userAgent = request.headers['user-agent'];
    const clientIp = request.clientIp || request.ip || 'unknown';

    // C-2: Proper HTTP exception instead of raw Error
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.authService.refreshToken(
      refreshToken,
      userAgent,
      clientIp,
    );

    response.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }
}

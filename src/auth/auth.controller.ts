import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Headers,
  Res,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './decorators/public.decorator';

// Extended Request interface with custom properties
interface ExtendedRequest extends Request {
  userAgent?: string;
  clientIp?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register/owner')
  async registerOwner(@Body() registerOwnerDto: RegisterOwnerDto) {
    return this.authService.registerOwner(registerOwnerDto);
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: ExtendedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Get user agent and IP for fingerprinting
    const userAgent = request.headers['user-agent'];
    const clientIp = request.clientIp || request.ip || 'unknown';

    const result = await this.authService.login(loginDto, userAgent, clientIp);

    // Set refresh token cookie (long lifetime) - SECURE SETTINGS
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // More secure than "lax"
      path: '/auth/refresh', // Restrict to refresh endpoint only
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return only access token in JSON (NOT in cookie for security)
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

    if (result.user && 'accessToken' in result) {
      // Set refresh token cookie with secure settings
      if ('refreshToken' in result) {
        response.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/auth/refresh',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }

      // Return only access token in JSON
      return {
        accessToken: result.accessToken,
        user: result.user,
      };
    }

    return result;
  }

  @Public()
  @Post('resend-verification')
  async resendVerificationEmail(@Body() { email }: { email: string }) {
    return this.authService.resendVerificationEmail(email);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
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

    // Clear refresh token cookie on logout
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

    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const result = await this.authService.refreshToken(
      refreshToken,
      userAgent,
      clientIp,
    );

    // Update refresh token cookie with new rotated token
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return only access token in JSON (NOT refresh token)
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }
}

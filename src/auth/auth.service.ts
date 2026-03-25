import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from './services/token.service';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { RegistrationService } from './services/registration.service';
import { EmailVerificationService } from './services/email-verification.service';
import { LoginService } from './services/login.service';
import { LoginDto } from './dto/login.dto';
import { PasswordRecoveryService } from './services/password-recovery.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LogoutService } from './services/logout.service';
import { User } from '@/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private registrationService: RegistrationService,
    private emailVerificationService: EmailVerificationService,
    private loginService: LoginService,
    private passwordRecoveryService: PasswordRecoveryService,
    private logoutService: LogoutService,
    private tokenService: TokenService,
  ) {}

  async registerOwner(registerOwnerDto: RegisterOwnerDto) {
    return this.registrationService.registerOwner(registerOwnerDto);
  }

  async verifyEmail(token: string, userAgent?: string, ip?: string) {
    const result = await this.emailVerificationService.verifyEmail(token);

    if ('user' in result && result.user) {
      // Create full User object for passing to TokenService
      const user = new User();
      Object.assign(user, result.user);

      // Generate secure tokens
      const accessToken = this.tokenService.generateAccessToken(
        user,
        result.user.organizationId,
        userAgent,
        ip,
      );

      const refreshToken = await this.tokenService.generateRefreshToken(
        user,
        userAgent,
        ip,
      );

      return {
        ...result,
        accessToken,
        refreshToken,
      };
    }

    return result;
  }

  async login(loginDto: LoginDto, userAgent?: string, ip?: string) {
    return this.loginService.login(
      loginDto.email,
      loginDto.password,
      userAgent,
      ip,
    );
  }

  async resendVerificationEmail(email: string) {
    return this.emailVerificationService.resendVerificationEmail(email);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    return this.passwordRecoveryService.forgotPassword(forgotPasswordDto.email);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.passwordRecoveryService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }

  async logout(token: string) {
    return this.logoutService.logout(token);
  }

  async refreshToken(refreshToken: string, userAgent?: string, ip?: string) {
    // Validate refresh token against database
    const validationResult =
      await this.tokenService.validateRefreshTokenFromDB(refreshToken);
    // C-2: Proper HTTP exceptions instead of raw Error
    if (!validationResult) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { decoded } = validationResult;

    const user = await this.registrationService.getUserById(decoded.sub);
    if (!user) {
      throw new UnauthorizedException('User account not found');
    }

    // Generate new access token
    const newAccessToken = this.tokenService.generateAccessToken(
      user,
      user.organizationId,
      userAgent,
      ip,
    );

    // Rotate refresh token (invalidate old, create new)
    const newRefreshToken = await this.tokenService.rotateRefreshToken(
      refreshToken,
      user,
      userAgent,
      ip,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }
}

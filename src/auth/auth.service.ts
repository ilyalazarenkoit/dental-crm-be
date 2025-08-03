import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { RegisterOwnerDto } from "./dto/register-owner.dto";
import { RegistrationService } from "./services/registration.service";
import { EmailVerificationService } from "./services/email-verification.service";
import { LoginService } from "./services/login.service";
import { LoginDto } from "./dto/login.dto";
import { PasswordRecoveryService } from "./services/password-recovery.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { LogoutService } from "./services/logout.service";

@Injectable()
export class AuthService {
  constructor(
    private registrationService: RegistrationService,
    private emailVerificationService: EmailVerificationService,
    private loginService: LoginService,
    private passwordRecoveryService: PasswordRecoveryService,
    private logoutService: LogoutService,
    private jwtService: JwtService
  ) {}

  async registerOwner(registerOwnerDto: RegisterOwnerDto) {
    return this.registrationService.registerOwner(registerOwnerDto);
  }

  async verifyEmail(token: string) {
    const result = await this.emailVerificationService.verifyEmail(token);

    if (result.user) {
      const accessToken = this.jwtService.sign({
        sub: result.user.id,
        email: result.user.email,
        role: result.user.role,
        organizationId: result.user.organizationId,
      });

      return {
        ...result,
        accessToken,
      };
    }

    return result;
  }

  async login(loginDto: LoginDto) {
    return this.loginService.login(loginDto.email, loginDto.password);
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
      resetPasswordDto.password
    );
  }

  async logout(token: string) {
    return this.logoutService.logout(token);
  }
}

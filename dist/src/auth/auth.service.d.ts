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
export declare class AuthService {
    private registrationService;
    private emailVerificationService;
    private loginService;
    private passwordRecoveryService;
    private logoutService;
    private tokenService;
    constructor(registrationService: RegistrationService, emailVerificationService: EmailVerificationService, loginService: LoginService, passwordRecoveryService: PasswordRecoveryService, logoutService: LogoutService, tokenService: TokenService);
    registerOwner(registerOwnerDto: RegisterOwnerDto): Promise<{
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            mobilePhone: string;
            role: import("../types/enums").UserRole;
            organizationId: string;
            status: import("../types/enums").UserStatus;
        };
        message: string;
    }>;
    verifyEmail(token: string, userAgent?: string, ip?: string): Promise<{
        message: string;
        user?: undefined;
    } | {
        accessToken: string;
        refreshToken: string;
        message: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: import("../types/enums").UserRole;
            organizationId: string;
            status: import("../types/enums").UserStatus.ACTIVE;
        };
    }>;
    login(loginDto: LoginDto, userAgent?: string, ip?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            userId: string;
            firstName: string;
            lastName: string;
            email: string;
            role: import("../types/enums").UserRole;
            organizationId: string;
        };
    }>;
    resendVerificationEmail(email: string): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    logout(token: string): Promise<{
        message: string;
    }>;
    refreshToken(refreshToken: string, userAgent?: string, ip?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            userId: string;
            firstName: string;
            lastName: string;
            email: string;
            role: import("../types/enums").UserRole;
            organizationId: string;
        };
    }>;
}

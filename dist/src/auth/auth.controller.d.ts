import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
interface ExtendedRequest extends Request {
    userAgent?: string;
    clientIp?: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    login(loginDto: LoginDto, request: ExtendedRequest, response: Response): Promise<{
        accessToken: string;
        user: {
            userId: string;
            firstName: string;
            lastName: string;
            email: string;
            role: import("../types/enums").UserRole;
            organizationId: string;
        };
    }>;
    verifyEmail(token: string, request: ExtendedRequest, response: Response): Promise<{
        message: string;
        user?: undefined;
    } | {
        accessToken: string;
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
    resendVerificationEmail({ email }: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    logout(authHeader: string, request: ExtendedRequest, response: Response): Promise<{
        message: string;
    }>;
    refreshToken(request: ExtendedRequest, response: Response): Promise<{
        accessToken: string;
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
export {};

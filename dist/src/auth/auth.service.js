"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const token_service_1 = require("./services/token.service");
const registration_service_1 = require("./services/registration.service");
const email_verification_service_1 = require("./services/email-verification.service");
const login_service_1 = require("./services/login.service");
const password_recovery_service_1 = require("./services/password-recovery.service");
const logout_service_1 = require("./services/logout.service");
const user_entity_1 = require("../entities/user.entity");
let AuthService = class AuthService {
    constructor(registrationService, emailVerificationService, loginService, passwordRecoveryService, logoutService, tokenService) {
        this.registrationService = registrationService;
        this.emailVerificationService = emailVerificationService;
        this.loginService = loginService;
        this.passwordRecoveryService = passwordRecoveryService;
        this.logoutService = logoutService;
        this.tokenService = tokenService;
    }
    async registerOwner(registerOwnerDto) {
        return this.registrationService.registerOwner(registerOwnerDto);
    }
    async verifyEmail(token, userAgent, ip) {
        const result = await this.emailVerificationService.verifyEmail(token);
        if (result.user) {
            const user = new user_entity_1.User();
            Object.assign(user, result.user);
            const accessToken = this.tokenService.generateAccessToken(user, result.user.organizationId, userAgent, ip);
            const refreshToken = await this.tokenService.generateRefreshToken(user, userAgent, ip);
            return {
                ...result,
                accessToken,
                refreshToken,
            };
        }
        return result;
    }
    async login(loginDto, userAgent, ip) {
        return this.loginService.login(loginDto.email, loginDto.password, userAgent, ip);
    }
    async resendVerificationEmail(email) {
        return this.emailVerificationService.resendVerificationEmail(email);
    }
    async forgotPassword(forgotPasswordDto) {
        return this.passwordRecoveryService.forgotPassword(forgotPasswordDto.email);
    }
    async resetPassword(resetPasswordDto) {
        return this.passwordRecoveryService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
    }
    async logout(token) {
        return this.logoutService.logout(token);
    }
    async refreshToken(refreshToken, userAgent, ip) {
        const validationResult = await this.tokenService.validateRefreshTokenFromDB(refreshToken);
        if (!validationResult) {
            throw new Error('Invalid refresh token');
        }
        const { decoded } = validationResult;
        const user = await this.registrationService.getUserById(decoded.sub);
        if (!user) {
            throw new Error('User not found');
        }
        const newAccessToken = this.tokenService.generateAccessToken(user, user.organizationId, userAgent, ip);
        const newRefreshToken = await this.tokenService.rotateRefreshToken(refreshToken, user, userAgent, ip);
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [registration_service_1.RegistrationService,
        email_verification_service_1.EmailVerificationService,
        login_service_1.LoginService,
        password_recovery_service_1.PasswordRecoveryService,
        logout_service_1.LogoutService,
        token_service_1.TokenService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
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
const jwt_1 = require("@nestjs/jwt");
const registration_service_1 = require("./services/registration.service");
const email_verification_service_1 = require("./services/email-verification.service");
const login_service_1 = require("./services/login.service");
const password_recovery_service_1 = require("./services/password-recovery.service");
const logout_service_1 = require("./services/logout.service");
let AuthService = class AuthService {
    constructor(registrationService, emailVerificationService, loginService, passwordRecoveryService, logoutService, jwtService) {
        this.registrationService = registrationService;
        this.emailVerificationService = emailVerificationService;
        this.loginService = loginService;
        this.passwordRecoveryService = passwordRecoveryService;
        this.logoutService = logoutService;
        this.jwtService = jwtService;
    }
    async registerOwner(registerOwnerDto) {
        return this.registrationService.registerOwner(registerOwnerDto);
    }
    async verifyEmail(token) {
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
    async login(loginDto) {
        return this.loginService.login(loginDto.email, loginDto.password);
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [registration_service_1.RegistrationService,
        email_verification_service_1.EmailVerificationService,
        login_service_1.LoginService,
        password_recovery_service_1.PasswordRecoveryService,
        logout_service_1.LogoutService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
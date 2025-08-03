"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const user_entity_1 = require("../entities/user.entity");
const organization_entity_1 = require("../entities/organization.entity");
const mail_module_1 = require("../mail/mail.module");
const registration_service_1 = require("./services/registration.service");
const email_verification_service_1 = require("./services/email-verification.service");
const login_service_1 = require("./services/login.service");
const password_recovery_service_1 = require("./services/password-recovery.service");
const token_blacklist_service_1 = require("./services/token-blacklist.service");
const logout_service_1 = require("./services/logout.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, organization_entity_1.Organization]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const jwtConfig = configService.get("jwt");
                    return {
                        secret: jwtConfig.accessToken.secret,
                        signOptions: {
                            expiresIn: jwtConfig.accessToken.expiresIn,
                        },
                    };
                },
            }),
            mail_module_1.MailModule,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            registration_service_1.RegistrationService,
            email_verification_service_1.EmailVerificationService,
            login_service_1.LoginService,
            password_recovery_service_1.PasswordRecoveryService,
            token_blacklist_service_1.TokenBlacklistService,
            logout_service_1.LogoutService,
        ],
        exports: [auth_service_1.AuthService, token_blacklist_service_1.TokenBlacklistService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map
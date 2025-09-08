import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { User } from "@/entities/user.entity";
import { Organization } from "@/entities/organization.entity";
import { RefreshToken } from "@/entities/refresh-token.entity";
import { MailModule } from "@/mail/mail.module";
import { RegistrationService } from "./services/registration.service";
import { EmailVerificationService } from "./services/email-verification.service";
import { LoginService } from "./services/login.service";
import { PasswordRecoveryService } from "./services/password-recovery.service";
import { TokenBlacklistService } from "./services/token-blacklist.service";
import { LogoutService } from "./services/logout.service";
import { TokenService } from "./services/token.service";
import { RefreshTokenStorageService } from "./services/refresh-token-storage.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization, RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtConfig = configService.get("jwt");
        return {
          secret: jwtConfig.accessToken.secret,
          signOptions: {
            expiresIn: jwtConfig.accessToken.expiresIn,
            // Remove issuer and audience from signOptions since we set them in payload
            notBefore: 0, // Token is valid immediately
          },
          verifyOptions: {
            // Remove issuer and audience from verifyOptions since we validate them manually
            ignoreExpiration: false,
            ignoreNotBefore: false,
          },
        };
      },
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RegistrationService,
    EmailVerificationService,
    LoginService,
    PasswordRecoveryService,
    TokenBlacklistService,
    LogoutService,
    TokenService,
    RefreshTokenStorageService,
  ],
  exports: [AuthService, TokenBlacklistService, TokenService],
})
export class AuthModule {}

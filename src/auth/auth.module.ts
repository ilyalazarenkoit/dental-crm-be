import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { User } from "@/entities/user.entity";
import { Organization } from "@/entities/organization.entity";
import { RefreshToken } from "@/entities/refresh-token.entity";
import { RevokedToken } from "@/entities/revoked-token.entity";
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
    // H-1: RevokedToken added for DB-backed access token blacklist
    TypeOrmModule.forFeature([User, Organization, RefreshToken, RevokedToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtConfig = configService.get("jwt");
        return {
          secret: jwtConfig.accessToken.secret,
          signOptions: {
            expiresIn: jwtConfig.accessToken.expiresIn,
            notBefore: 0,
          },
          verifyOptions: {
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

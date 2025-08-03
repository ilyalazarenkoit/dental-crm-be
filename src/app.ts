import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import jwtConfig from "./config/jwt.config";
import { TokenBlacklistMiddleware } from "./auth/middlewares/token-blacklist.middleware";
import { JwtCookieMiddleware } from "./auth/middlewares/jwt-cookie.middleware";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: "postgres",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432", 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: ["dist/**/*.entity{.ts,.js}"],
        migrations: ["dist/migrations/*{.ts,.js}"],
        synchronize: process.env.NODE_ENV !== "production",
        logging: process.env.NODE_ENV !== "production",
        autoLoadEntities: true,
      }),
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Applying JwtCookieMiddleware for all routes
    consumer.apply(JwtCookieMiddleware).forRoutes("*");

    // Applying TokenBlacklistMiddleware for all routes, except /auth/login and /auth/register
    consumer
      .apply(TokenBlacklistMiddleware)
      .exclude(
        { path: "auth/login", method: RequestMethod.POST },
        { path: "auth/register/owner", method: RequestMethod.POST },
        { path: "auth/verify-email", method: RequestMethod.GET },
        { path: "auth/resend-verification", method: RequestMethod.POST },
        { path: "auth/forgot-password", method: RequestMethod.POST },
        { path: "auth/reset-password", method: RequestMethod.POST }
      )
      .forRoutes("*");
  }
}

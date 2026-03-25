import {
  Module,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import jwtConfig from './config/jwt.config';
import { JwtCookieMiddleware } from './auth/middlewares/jwt-cookie.middleware';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    PatientsModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [jwtConfig],
    }),
    // L-7 / H-1: Required for @Cron decorators
    ScheduleModule.forRoot(),
    // C-1: Global rate limiting - 10 req/min short, 100 req/hour long
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 10,
      },
      {
        name: 'long',
        ttl: 3600000,
        limit: 100,
      },
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: ['dist/migrations/*{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV !== 'production',
        autoLoadEntities: true,
        // M-3: Always verify SSL certificate for RDS connections
        ssl: process.env.DB_HOST?.includes('.rds.amazonaws.com')
          ? { rejectUnauthorized: true }
          : false,
        schema: 'core',
      }),
    }),
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // C-1: ThrottlerGuard runs after JwtAuthGuard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // JwtCookieMiddleware: enriches request with fingerprinting data
    consumer.apply(JwtCookieMiddleware).forRoutes('*');
    // TokenBlacklistMiddleware removed: blacklist enforcement moved to JwtAuthGuard (H-1)
  }
}

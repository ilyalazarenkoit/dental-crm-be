"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const jwt_config_1 = require("./config/jwt.config");
const token_blacklist_middleware_1 = require("./auth/middlewares/token-blacklist.middleware");
const jwt_cookie_middleware_1 = require("./auth/middlewares/jwt-cookie.middleware");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(jwt_cookie_middleware_1.JwtCookieMiddleware).forRoutes("*");
        consumer
            .apply(token_blacklist_middleware_1.TokenBlacklistMiddleware)
            .exclude({ path: "auth/login", method: common_1.RequestMethod.POST }, { path: "auth/register/owner", method: common_1.RequestMethod.POST }, { path: "auth/verify-email", method: common_1.RequestMethod.GET }, { path: "auth/resend-verification", method: common_1.RequestMethod.POST }, { path: "auth/forgot-password", method: common_1.RequestMethod.POST }, { path: "auth/reset-password", method: common_1.RequestMethod.POST })
            .forRoutes("*");
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ".env",
                load: [jwt_config_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
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
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.js.map
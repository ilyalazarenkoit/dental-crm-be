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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const token_service_1 = require("./token.service");
const bcrypt = require("bcrypt");
const enums_1 = require("../../types/enums");
let LoginService = class LoginService {
    constructor(userRepository, tokenService) {
        this.userRepository = userRepository;
        this.tokenService = tokenService;
    }
    async login(email, password, userAgent, ip) {
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException("Invalid email or password");
        }
        if (!user.isEmailVerified) {
            throw new common_1.UnauthorizedException("Please verify your email first");
        }
        if (user.status !== enums_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException("Your account is not active");
        }
        const isPasswordValid = await this.comparePasswords(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException("Invalid email or password");
        }
        const accessToken = this.tokenService.generateAccessToken(user, user.organizationId, userAgent, ip);
        const refreshToken = await this.tokenService.generateRefreshToken(user, userAgent, ip);
        return {
            accessToken,
            refreshToken,
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
    async comparePasswords(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
};
exports.LoginService = LoginService;
exports.LoginService = LoginService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        token_service_1.TokenService])
], LoginService);
//# sourceMappingURL=login.service.js.map
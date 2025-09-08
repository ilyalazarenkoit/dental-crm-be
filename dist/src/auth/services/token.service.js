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
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const config_1 = require("@nestjs/config");
const refresh_token_storage_service_1 = require("./refresh-token-storage.service");
let TokenService = class TokenService {
    constructor(jwtService, configService, refreshTokenStorageService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.refreshTokenStorageService = refreshTokenStorageService;
    }
    generateAccessToken(user, organizationId, userAgent, ip) {
        const payload = {
            sub: user.id,
            jti: this.generateJti(),
            iss: this.configService.get("jwt.issuer", "dentalcrm-backend"),
            aud: this.configService.get("jwt.audience", "dentalcrm-frontend"),
            fingerprint: this.generateFingerprint(userAgent, ip),
        };
        return this.jwtService.sign(payload);
    }
    async generateRefreshToken(user, userAgent, ip) {
        const payload = {
            sub: user.id,
            jti: this.generateJti(),
            type: "refresh",
            iss: this.configService.get("jwt.issuer", "dentalcrm-backend"),
            aud: this.configService.get("jwt.audience", "dentalcrm-frontend"),
            fingerprint: this.generateFingerprint(userAgent, ip),
        };
        const refreshSecret = this.configService.get("jwt.refreshToken.secret");
        const refreshExpiresIn = this.configService.get("jwt.refreshToken.expiresIn", "7d");
        const refreshToken = this.jwtService.sign(payload, {
            secret: refreshSecret,
            expiresIn: refreshExpiresIn,
        });
        const expiresAt = new Date();
        const expiresInDays = parseInt(refreshExpiresIn.replace("d", ""));
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
        await this.refreshTokenStorageService.storeRefreshToken(refreshToken, user.id, userAgent || "unknown", ip || "unknown", this.generateFingerprint(userAgent, ip), expiresAt);
        return refreshToken;
    }
    generateJti() {
        return (0, crypto_1.randomBytes)(16).toString("hex");
    }
    generateFingerprint(userAgent, ip) {
        const data = `${userAgent || "unknown"}|${ip || "unknown"}`;
        return (0, crypto_1.createHash)("sha256").update(data).digest("hex").substring(0, 16);
    }
    verifyToken(token) {
        try {
            const decoded = this.jwtService.verify(token);
            const expectedIssuer = this.configService.get("jwt.issuer", "dentalcrm-backend");
            const expectedAudience = this.configService.get("jwt.audience", "dentalcrm-frontend");
            if (decoded.iss !== expectedIssuer) {
                throw new Error("Invalid token issuer");
            }
            if (decoded.aud !== expectedAudience) {
                throw new Error("Invalid token audience");
            }
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
    verifyRefreshToken(token) {
        try {
            const decoded = this.jwtService.verify(token, {
                secret: this.configService.get("jwt.refreshToken.secret"),
            });
            if (decoded.type !== "refresh") {
                throw new Error("Invalid refresh token type");
            }
            const expectedIssuer = this.configService.get("jwt.issuer", "dentalcrm-backend");
            const expectedAudience = this.configService.get("jwt.audience", "dentalcrm-frontend");
            if (decoded.iss !== expectedIssuer) {
                throw new Error("Invalid token issuer");
            }
            if (decoded.aud !== expectedAudience) {
                throw new Error("Invalid token audience");
            }
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
    decodeToken(token) {
        return this.jwtService.decode(token);
    }
    generateVerificationToken() {
        return (0, crypto_1.randomBytes)(32).toString("hex");
    }
    generateTokenExpiration(hoursValid = 24) {
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + hoursValid);
        return expirationDate;
    }
    getUserInfoFromToken(token) {
        const decoded = this.decodeToken(token);
        if (decoded && typeof decoded === "object") {
            return {
                userId: decoded.sub,
                jti: decoded.jti,
                fingerprint: decoded.fingerprint,
            };
        }
        return null;
    }
    generateFingerprintForVerification(userAgent, ip) {
        return this.generateFingerprint(userAgent, ip);
    }
    async rotateRefreshToken(oldRefreshToken, user, userAgent, ip) {
        await this.refreshTokenStorageService.invalidateRefreshToken(oldRefreshToken);
        return this.generateRefreshToken(user, userAgent, ip);
    }
    async validateRefreshTokenFromDB(token) {
        const decoded = this.verifyRefreshToken(token);
        if (!decoded) {
            return null;
        }
        const storedToken = await this.refreshTokenStorageService.validateRefreshToken(token);
        if (!storedToken) {
            return null;
        }
        const expectedFingerprint = this.generateFingerprintForVerification(storedToken.userAgent, storedToken.ipAddress);
        if (decoded.fingerprint !== expectedFingerprint) {
            return null;
        }
        return { decoded, storedToken };
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        refresh_token_storage_service_1.RefreshTokenStorageService])
], TokenService);
//# sourceMappingURL=token.service.js.map
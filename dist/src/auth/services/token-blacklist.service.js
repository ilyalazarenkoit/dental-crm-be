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
exports.TokenBlacklistService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let TokenBlacklistService = class TokenBlacklistService {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.blacklistedTokens = new Map();
        setInterval(() => this.cleanupExpiredTokens(), 3600000);
    }
    async blacklistToken(token) {
        try {
            const decoded = this.jwtService.decode(token);
            if (decoded && decoded["exp"]) {
                this.blacklistedTokens.set(token, decoded["exp"]);
            }
        }
        catch (error) {
            console.error("Error blacklisting token:", error);
        }
    }
    isTokenBlacklisted(token) {
        return this.blacklistedTokens.has(token);
    }
    cleanupExpiredTokens() {
        const now = Math.floor(Date.now() / 1000);
        for (const [token, expiry] of this.blacklistedTokens.entries()) {
            if (expiry < now) {
                this.blacklistedTokens.delete(token);
            }
        }
    }
};
exports.TokenBlacklistService = TokenBlacklistService;
exports.TokenBlacklistService = TokenBlacklistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], TokenBlacklistService);
//# sourceMappingURL=token-blacklist.service.js.map
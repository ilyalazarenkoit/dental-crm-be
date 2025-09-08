import { JwtService } from '@nestjs/jwt';
export declare class TokenBlacklistService {
    private jwtService;
    private blacklistedTokens;
    constructor(jwtService: JwtService);
    blacklistToken(token: string): Promise<void>;
    isTokenBlacklisted(token: string): boolean;
    private cleanupExpiredTokens;
    decodeToken(token: string): unknown;
}

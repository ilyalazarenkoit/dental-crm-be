import { JwtService } from "@nestjs/jwt";
import { User } from "@/entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { RefreshTokenStorageService } from "./refresh-token-storage.service";
export declare class TokenService {
    private jwtService;
    private configService;
    private refreshTokenStorageService;
    constructor(jwtService: JwtService, configService: ConfigService, refreshTokenStorageService: RefreshTokenStorageService);
    generateAccessToken(user: User, organizationId: string, userAgent?: string, ip?: string): string;
    generateRefreshToken(user: User, userAgent?: string, ip?: string): Promise<string>;
    private generateJti;
    private generateFingerprint;
    verifyToken(token: string): any;
    verifyRefreshToken(token: string): any;
    decodeToken(token: string): any;
    generateVerificationToken(): string;
    generateTokenExpiration(hoursValid?: number): Date;
    getUserInfoFromToken(token: string): {
        userId: any;
        jti: any;
        fingerprint: any;
    } | null;
    generateFingerprintForVerification(userAgent?: string, ip?: string): string;
    rotateRefreshToken(oldRefreshToken: string, user: User, userAgent?: string, ip?: string): Promise<string>;
    validateRefreshTokenFromDB(token: string): Promise<{
        decoded: any;
        storedToken: import("../../entities/refresh-token.entity").RefreshToken;
    } | null>;
}

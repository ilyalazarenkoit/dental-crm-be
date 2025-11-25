import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'crypto';
import { User } from '@/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenStorageService } from './refresh-token-storage.service';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private refreshTokenStorageService: RefreshTokenStorageService,
  ) {}

  generateAccessToken(
    user: User,
    organizationId: string,
    userAgent?: string,
    ip?: string,
  ) {
    const payload = {
      sub: user.id,
      jti: this.generateJti(),
      iss: this.configService.get('jwt.issuer', 'dentalcrm-backend'),
      aud: this.configService.get('jwt.audience', 'dentalcrm-frontend'),
      fingerprint: this.generateFingerprint(userAgent, ip),
    };

    return this.jwtService.sign(payload);
  }

  async generateRefreshToken(
    user: User,
    userAgent?: string,
    ip?: string,
  ): Promise<string> {
    const payload = {
      sub: user.id,
      jti: this.generateJti(),
      type: 'refresh',
      iss: this.configService.get('jwt.issuer', 'dentalcrm-backend'),
      aud: this.configService.get('jwt.audience', 'dentalcrm-frontend'),
      fingerprint: this.generateFingerprint(userAgent, ip),
    };

    const refreshSecret = this.configService.get('jwt.refreshToken.secret');
    const refreshExpiresIn = this.configService.get(
      'jwt.refreshToken.expiresIn',
      '7d',
    );

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    const expiresAt = new Date();
    const expiresInDays = parseInt(refreshExpiresIn.replace('d', ''));
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await this.refreshTokenStorageService.storeRefreshToken(
      refreshToken,
      user.id,
      userAgent || 'unknown',
      ip || 'unknown',
      this.generateFingerprint(userAgent, ip),
      expiresAt,
    );

    return refreshToken;
  }

  private generateJti(): string {
    return randomBytes(16).toString('hex');
  }

  private generateFingerprint(userAgent?: string, ip?: string): string {
    const data = `${userAgent || 'unknown'}|${ip || 'unknown'}`;
    return createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  verifyToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);

      const expectedIssuer = this.configService.get(
        'jwt.issuer',
        'dentalcrm-backend',
      );
      const expectedAudience = this.configService.get(
        'jwt.audience',
        'dentalcrm-frontend',
      );

      if (decoded.iss !== expectedIssuer) {
        throw new Error('Invalid token issuer');
      }

      if (decoded.aud !== expectedAudience) {
        throw new Error('Invalid token audience');
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  verifyRefreshToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.refreshToken.secret'),
      });

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token type');
      }

      const expectedIssuer = this.configService.get(
        'jwt.issuer',
        'dentalcrm-backend',
      );
      const expectedAudience = this.configService.get(
        'jwt.audience',
        'dentalcrm-frontend',
      );

      if (decoded.iss !== expectedIssuer) {
        throw new Error('Invalid token issuer');
      }

      if (decoded.aud !== expectedAudience) {
        throw new Error('Invalid token audience');
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }

  generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  generateTokenExpiration(hoursValid: number = 24): Date {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + hoursValid);
    return expirationDate;
  }

  getUserInfoFromToken(token: string) {
    const decoded = this.decodeToken(token);
    if (decoded && typeof decoded === 'object') {
      return {
        userId: decoded.sub,
        jti: decoded.jti,
        fingerprint: decoded.fingerprint,
      };
    }
    return null;
  }

  generateFingerprintForVerification(userAgent?: string, ip?: string): string {
    return this.generateFingerprint(userAgent, ip);
  }

  /**
   * Rotate refresh token - invalidate old and create new
   * @param oldRefreshToken Current refresh token
   * @param user User object
   * @param userAgent User agent
   * @param ip IP address
   * @returns New refresh token
   */
  async rotateRefreshToken(
    oldRefreshToken: string,
    user: User,
    userAgent?: string,
    ip?: string,
  ): Promise<string> {
    await this.refreshTokenStorageService.invalidateRefreshToken(
      oldRefreshToken,
    );

    return this.generateRefreshToken(user, userAgent, ip);
  }

  /**
   * Validate refresh token against database
   * @param token Refresh token
   * @returns Decoded token if valid, null otherwise
   */
  async validateRefreshTokenFromDB(token: string) {
    const decoded = this.verifyRefreshToken(token);
    if (!decoded) {
      return null;
    }

    const storedToken =
      await this.refreshTokenStorageService.validateRefreshToken(token);
    if (!storedToken) {
      return null;
    }

    const expectedFingerprint = this.generateFingerprintForVerification(
      storedToken.userAgent,
      storedToken.ipAddress,
    );
    if (decoded.fingerprint !== expectedFingerprint) {
      return null;
    }

    return { decoded, storedToken };
  }
}

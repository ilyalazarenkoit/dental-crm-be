import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'crypto';
import { User } from '@/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenStorageService } from './refresh-token-storage.service';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private refreshTokenStorageService: RefreshTokenStorageService,
  ) {}

  // M-1: organizationId is now included in the JWT payload as `org`
  // This eliminates the extra DB lookup on every authenticated request
  generateAccessToken(
    user: User,
    organizationId: string,
    userAgent?: string,
    ip?: string,
  ) {
    const payload = {
      sub: user.id,
      org: organizationId,
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

    // M-8: Use robust parser that handles s/m/h/d/w formats
    const expiresAt = new Date(
      Date.now() + this.parseExpiresInToMs(refreshExpiresIn),
    );

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

  /**
   * M-8: Parse JWT expiresIn strings like '7d', '24h', '60m', '30s', '2w'
   * Falls back to 7 days if the format is unrecognised.
   */
  private parseExpiresInToMs(expiresIn: string): number {
    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
    };

    const match = expiresIn.match(/^(\d+)([smhdw])$/);
    if (!match) {
      this.logger.warn(
        `Invalid expiresIn format: "${expiresIn}", defaulting to 7d`,
      );
      return 7 * 24 * 60 * 60 * 1000;
    }

    const [, value, unit] = match;
    return parseInt(value, 10) * units[unit];
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

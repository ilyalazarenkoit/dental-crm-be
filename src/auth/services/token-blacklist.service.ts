import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RevokedToken } from '@/entities/revoked-token.entity';

/**
 * H-1: DB-backed token blacklist — survives restarts and works in multi-pod deployments.
 * Stores only the jti (JWT ID) rather than the full token to minimise storage.
 * L-7: Expired entries are purged daily via a @Cron job.
 */
@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);

  constructor(
    @InjectRepository(RevokedToken)
    private revokedTokenRepository: Repository<RevokedToken>,
    private jwtService: JwtService,
  ) {}

  /**
   * Blacklist an access token by persisting its jti.
   * Called on logout.
   */
  async blacklistToken(token: string): Promise<void> {
    try {
      const decoded = this.jwtService.decode(token);
      if (!decoded || !decoded['jti'] || !decoded['exp']) return;

      const expiresAt = new Date(decoded['exp'] * 1000);

      // upsert avoids duplicate-key error if token is blacklisted twice
      await this.revokedTokenRepository.upsert(
        { jti: decoded['jti'], expiresAt },
        ['jti'],
      );
    } catch (error) {
      this.logger.error('Failed to blacklist token', error);
    }
  }

  /**
   * Check if a given jti has been revoked.
   * Returns true only if the entry is present AND has not expired.
   */
  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const count = await this.revokedTokenRepository.count({
      where: { jti, expiresAt: MoreThan(new Date()) },
    });
    return count > 0;
  }

  /**
   * Utility: decode a JWT without verification.
   * Used by LogoutService to extract the user sub.
   */
  decodeToken(token: string): unknown {
    try {
      return this.jwtService.decode(token);
    } catch {
      return null;
    }
  }

  /**
   * L-7 / H-1: Daily cleanup of expired revoked token entries.
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async scheduledCleanup(): Promise<void> {
    const result = await this.revokedTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    this.logger.log(`Cleaned up ${result.affected} expired revoked tokens`);
  }
}

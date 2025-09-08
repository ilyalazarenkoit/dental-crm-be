import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan, In, MoreThan } from "typeorm";
import { RefreshToken } from "@/entities/refresh-token.entity";
import { createHash } from "crypto";

@Injectable()
export class RefreshTokenStorageService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>
  ) {}

  /**
   * Store refresh token in database
   * @param token Plain refresh token
   * @param userId User ID
   * @param userAgent User agent string
   * @param ipAddress IP address
   * @param fingerprint Security fingerprint
   * @param expiresAt Token expiration date
   */
  async storeRefreshToken(
    token: string,
    userId: string,
    userAgent: string,
    ipAddress: string,
    fingerprint: string,
    expiresAt: Date
  ): Promise<void> {
    const tokenHash = this.hashToken(token);

    // Check if user already has too many active tokens
    await this.cleanupOldTokens(userId);

    const refreshToken = this.refreshTokenRepository.create({
      tokenHash,
      userId,
      userAgent,
      ipAddress,
      fingerprint,
      expiresAt,
      isActive: true,
    });

    await this.refreshTokenRepository.save(refreshToken);
  }

  /**
   * Validate refresh token and return stored data
   * @param token Plain refresh token
   * @returns Refresh token data if valid, null otherwise
   */
  async validateRefreshToken(token: string): Promise<RefreshToken | null> {
    const tokenHash = this.hashToken(token);

    const refreshToken = await this.refreshTokenRepository.findOne({
      where: {
        tokenHash,
        isActive: true,
        expiresAt: MoreThan(new Date()), // Check if not expired
      },
      relations: ["user"],
    });

    return refreshToken;
  }

  /**
   * Invalidate refresh token (mark as inactive)
   * @param token Plain refresh token
   */
  async invalidateRefreshToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);

    await this.refreshTokenRepository.update(
      { tokenHash, isActive: true },
      { isActive: false }
    );
  }

  /**
   * Invalidate all refresh tokens for a user
   * @param userId User ID
   */
  async invalidateAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isActive: true },
      { isActive: false }
    );
  }

  /**
   * Clean up expired and old tokens
   * @param userId User ID (optional, if not provided cleans all users)
   */
  async cleanupOldTokens(userId?: string): Promise<void> {
    const maxTokensPerUser = 5; // Maximum active tokens per user
    const now = new Date();

    // First, mark expired tokens as inactive
    await this.refreshTokenRepository.update(
      {
        expiresAt: LessThan(now),
        isActive: true,
        ...(userId && { userId }),
      },
      { isActive: false }
    );

    if (userId) {
      // Get active tokens for user, ordered by creation date
      const activeTokens = await this.refreshTokenRepository.find({
        where: { userId, isActive: true },
        order: { createdAt: "DESC" },
      });

      // If user has more than max tokens, invalidate oldest ones
      if (activeTokens.length > maxTokensPerUser) {
        const tokensToInvalidate = activeTokens.slice(maxTokensPerUser);
        const tokenIds = tokensToInvalidate.map((token) => token.id);

        await this.refreshTokenRepository.update(
          { id: In(tokenIds) },
          { isActive: false }
        );
      }
    }
  }

  /**
   * Get active tokens count for user
   * @param userId User ID
   * @returns Number of active tokens
   */
  async getActiveTokensCount(userId: string): Promise<number> {
    return this.refreshTokenRepository.count({
      where: { userId, isActive: true },
    });
  }

  /**
   * Hash token using SHA-256
   * @param token Plain token
   * @returns Hashed token
   */
  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  /**
   * Clean up all expired tokens (should be called periodically)
   */
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.refreshTokenRepository.update(
      {
        expiresAt: LessThan(now),
        isActive: true,
      },
      { isActive: false }
    );
  }
}

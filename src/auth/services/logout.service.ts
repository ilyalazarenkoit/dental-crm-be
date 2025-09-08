import { Injectable } from '@nestjs/common';
import { TokenBlacklistService } from './token-blacklist.service';
import { RefreshTokenStorageService } from './refresh-token-storage.service';

@Injectable()
export class LogoutService {
  constructor(
    private tokenBlacklistService: TokenBlacklistService,
    private refreshTokenStorageService: RefreshTokenStorageService,
  ) {}

  /**
   * Logout user by adding their token to blacklist and invalidating all refresh tokens
   * @param token JWT token for adding to blacklist
   * @returns Object with success message
   */
  async logout(token: string): Promise<{ message: string }> {
    // Remove "Bearer " prefix from token if it exists
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

    // Add access token to blacklist
    await this.tokenBlacklistService.blacklistToken(tokenValue);

    // Get user ID from token to invalidate all refresh tokens
    try {
      const decoded = this.tokenBlacklistService.decodeToken(tokenValue) as any;
      if (decoded && decoded.sub) {
        // Invalidate all refresh tokens for this user
        await this.refreshTokenStorageService.invalidateAllUserTokens(
          decoded.sub,
        );
      }
    } catch (error) {
      // Log error without console in production
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          'Error invalidating refresh tokens during logout:',
          error,
        );
      }
    }

    return { message: 'Logout successful' };
  }
}

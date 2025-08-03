import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenBlacklistService {
  private blacklistedTokens: Map<string, number> = new Map();

  constructor(private jwtService: JwtService) {
    setInterval(() => this.cleanupExpiredTokens(), 3600000);
  }

  /**
   * Adding token to blacklist
   * @param token JWT token for adding to blacklist
   */
  async blacklistToken(token: string): Promise<void> {
    try {
      const decoded = this.jwtService.decode(token);

      if (decoded && decoded["exp"]) {
        this.blacklistedTokens.set(token, decoded["exp"]);
      }
    } catch (error) {
      console.error("Error blacklisting token:", error);
    }
  }

  /**
   * Checking if token is blacklisted
   * @param token JWT token for checking
   * @returns true if token is blacklisted, otherwise false
   */
  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Clear expired tokens from blacklist
   */
  private cleanupExpiredTokens(): void {
    const now = Math.floor(Date.now() / 1000);

    for (const [token, expiry] of this.blacklistedTokens.entries()) {
      if (expiry < now) {
        this.blacklistedTokens.delete(token);
      }
    }
  }
}

import { Injectable } from "@nestjs/common";
import { TokenBlacklistService } from "./token-blacklist.service";

@Injectable()
export class LogoutService {
  constructor(private tokenBlacklistService: TokenBlacklistService) {}

  /**
   * Logout user by adding their token to blacklist
   * @param token JWT token for adding to blacklist
   * @returns Object with success message
   */
  async logout(token: string): Promise<{ message: string }> {
    // Remove "Bearer " prefix from token if it exists
    const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;

    // Добавляем токен в черный список
    await this.tokenBlacklistService.blacklistToken(tokenValue);

    return { message: "Logout successful" };
  }
}

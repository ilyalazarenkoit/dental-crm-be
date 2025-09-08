import { TokenBlacklistService } from './token-blacklist.service';
import { RefreshTokenStorageService } from './refresh-token-storage.service';
export declare class LogoutService {
    private tokenBlacklistService;
    private refreshTokenStorageService;
    constructor(tokenBlacklistService: TokenBlacklistService, refreshTokenStorageService: RefreshTokenStorageService);
    logout(token: string): Promise<{
        message: string;
    }>;
}

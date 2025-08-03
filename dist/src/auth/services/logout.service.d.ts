import { TokenBlacklistService } from "./token-blacklist.service";
export declare class LogoutService {
    private tokenBlacklistService;
    constructor(tokenBlacklistService: TokenBlacklistService);
    logout(token: string): Promise<{
        message: string;
    }>;
}

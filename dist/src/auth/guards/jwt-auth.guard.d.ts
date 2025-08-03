import { ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokenBlacklistService } from "../services/token-blacklist.service";
import { Reflector } from "@nestjs/core";
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    private jwtService;
    private tokenBlacklistService;
    private reflector;
    constructor(jwtService: JwtService, tokenBlacklistService: TokenBlacklistService, reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
    private extractTokenFromHeader;
}
export {};

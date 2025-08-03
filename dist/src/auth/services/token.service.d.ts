import { JwtService } from "@nestjs/jwt";
import { User } from "@/entities/user.entity";
export declare class TokenService {
    private jwtService;
    constructor(jwtService: JwtService);
    generateJwtToken(user: User, organizationId: number): string;
    generateVerificationToken(): string;
    generateTokenExpiration(hoursValid?: number): Date;
}

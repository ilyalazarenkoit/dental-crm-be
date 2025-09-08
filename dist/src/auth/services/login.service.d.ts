import { Repository } from "typeorm";
import { User } from "@/entities/user.entity";
import { TokenService } from "./token.service";
export declare class LoginService {
    private userRepository;
    private tokenService;
    constructor(userRepository: Repository<User>, tokenService: TokenService);
    login(email: string, password: string, userAgent?: string, ip?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            userId: string;
            firstName: string;
            lastName: string;
            email: string;
            role: import("@/types/enums").UserRole;
            organizationId: string;
        };
    }>;
    private comparePasswords;
}

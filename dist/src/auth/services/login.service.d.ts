import { Repository } from "typeorm";
import { User } from "@/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
export declare class LoginService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: import("@/types/enums").UserRole;
            organizationId: string;
        };
    }>;
    private comparePasswords;
}

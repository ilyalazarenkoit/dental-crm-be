import { Repository } from "typeorm";
import { User } from "@/entities/user.entity";
import { MailService } from "@/mail/mail.service";
import { UserStatus } from "@/types/enums";
export declare class EmailVerificationService {
    private userRepository;
    private mailService;
    constructor(userRepository: Repository<User>, mailService: MailService);
    verifyEmail(token: string): Promise<{
        message: string;
        user?: undefined;
    } | {
        message: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: import("@/types/enums").UserRole;
            organizationId: string;
            status: UserStatus.ACTIVE;
        };
    }>;
    resendVerificationEmail(email: string): Promise<{
        message: string;
    }>;
    prepareForVerification(user: User): Promise<{
        user: User;
        verificationToken: string;
    }>;
    private generateVerificationToken;
    private generateTokenExpiration;
}

import { Repository } from "typeorm";
import { User } from "@/entities/user.entity";
import { MailService } from "@/mail/mail.service";
export declare class PasswordRecoveryService {
    private userRepository;
    private mailService;
    constructor(userRepository: Repository<User>, mailService: MailService);
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    private generateResetToken;
}

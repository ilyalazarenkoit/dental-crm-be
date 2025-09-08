import { Repository } from "typeorm";
import { User } from "@/entities/user.entity";
import { Organization } from "@/entities/organization.entity";
import { RegisterOwnerDto } from "../dto/register-owner.dto";
import { UserRole, UserStatus } from "@/types/enums";
import { MailService } from "@/mail/mail.service";
export declare class RegistrationService {
    private userRepository;
    private organizationRepository;
    private mailService;
    constructor(userRepository: Repository<User>, organizationRepository: Repository<Organization>, mailService: MailService);
    registerOwner(registerOwnerDto: RegisterOwnerDto): Promise<{
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            mobilePhone: string;
            role: UserRole;
            organizationId: string;
            status: UserStatus;
        };
        message: string;
    }>;
    private generateVerificationToken;
    getUserById(id: string): Promise<User | null>;
}

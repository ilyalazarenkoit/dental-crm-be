import { UserRole, UserStatus } from "@/types/enums";
import { Organization } from "@/entities/organization.entity";
export declare class User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobilePhone: string;
    role: UserRole;
    status: UserStatus;
    verificationToken: string;
    verificationTokenExpires: Date;
    isEmailVerified: boolean;
    resetPasswordToken: string;
    resetPasswordExpires: Date;
    organization: Organization;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
}

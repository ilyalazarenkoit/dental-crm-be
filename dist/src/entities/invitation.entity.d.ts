import { UserRole, InvitationStatus } from "@/types/enums";
import { Organization } from "@entities/organization.entity";
export declare class Invitation {
    id: string;
    token: string;
    email: string;
    role: UserRole;
    status: InvitationStatus;
    organization: Organization;
    organizationId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

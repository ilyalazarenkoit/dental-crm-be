import { UserRole } from '@/types/enums';
export interface CreateOrganizationDto {
    name: string;
    subscriptionStartDate: Date;
    subscriptionEndDate: Date;
    ownerLimit?: number;
    adminLimit?: number;
    doctorLimit?: number;
}
export interface CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    organizationId: string;
}
export interface CreateInvitationDto {
    email: string;
    role: UserRole;
    organizationId: string;
    expiresAt: Date;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface TokenPayload {
    userId: string;
    email: string;
    role: UserRole;
    organizationId: string;
}
export interface AuthResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        organizationId: string;
    };
}

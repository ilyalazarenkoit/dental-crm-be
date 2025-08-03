import { SubscriptionStatus } from "@/types/enums";
import { User } from "@/entities/user.entity";
export declare class Organization {
    id: string;
    name: string;
    subscriptionStartDate: Date;
    subscriptionEndDate: Date;
    subscriptionStatus: SubscriptionStatus;
    ownerLimit: number;
    adminLimit: number;
    doctorLimit: number;
    users: User[];
    createdAt: Date;
    updatedAt: Date;
}

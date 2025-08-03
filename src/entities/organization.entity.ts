import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { SubscriptionStatus } from "@/types/enums";
import { User } from "@/entities/user.entity";

@Entity("organizations")
export class Organization {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "timestamp" })
  subscriptionStartDate: Date;

  @Column({ type: "timestamp" })
  subscriptionEndDate: Date;

  @Column({
    type: "enum",
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  subscriptionStatus: SubscriptionStatus;

  @Column({ type: "integer", default: 1 })
  ownerLimit: number;

  @Column({ type: "integer", default: 1 })
  adminLimit: number;

  @Column({ type: "integer", default: 10 })
  doctorLimit: number;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

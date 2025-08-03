import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from "typeorm";
import { UserRole, UserStatus } from "@/types/enums";
import { Organization } from "@/entities/organization.entity";
import * as bcrypt from "bcryptjs";
import { Exclude } from "class-transformer";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: false })
  mobilePhone: string;

  @Column({ type: "enum", enum: UserRole })
  role: UserRole;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @Column({ nullable: true, type: "varchar" })
  @Exclude()
  verificationToken: string;

  @Column({ nullable: true, type: "timestamp" })
  verificationTokenExpires: Date;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, type: "varchar" })
  @Exclude()
  resetPasswordToken: string;

  @Column({ nullable: true, type: "timestamp" })
  resetPasswordExpires: Date;

  @ManyToOne(() => Organization, (organization) => organization.users)
  organization: Organization;

  @Column()
  organizationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

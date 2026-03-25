import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { UserRole, UserStatus } from '@/types/enums';
import { Organization } from '@/entities/organization.entity';
// M-5: Unified bcrypt — removed bcryptjs to avoid dual-library divergence
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

// M-10: Indexes on frequently queried fields to avoid full table scans
@Entity('users')
@Index(['organizationId'])
@Index(['verificationToken'])
@Index(['resetPasswordToken'])
export class User {
  @PrimaryGeneratedColumn('uuid')
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

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  // L-1: type is string | null — set to null (not '') after use
  @Column({ nullable: true, type: 'varchar' })
  @Exclude()
  verificationToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  verificationTokenExpires: Date | null;

  @Column({ default: false })
  isEmailVerified: boolean;

  // L-1: type is string | null — set to null (not '') after use
  @Column({ nullable: true, type: 'varchar' })
  @Exclude()
  resetPasswordToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  resetPasswordExpires: Date | null;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string | null;

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

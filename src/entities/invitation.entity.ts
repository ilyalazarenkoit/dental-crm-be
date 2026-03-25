import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserRole, InvitationStatus } from '@/types/enums';
import { Organization } from '@entities/organization.entity';

// M-10: Indexes prevent full table scans on all lookup fields
@Entity('invitations')
@Index(['token'])
@Index(['organizationId'])
@Index(['email'])
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  // L-8: CASCADE ensures invitations are removed when organization is deleted
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column()
  organizationId: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

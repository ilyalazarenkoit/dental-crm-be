import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { BillingStatus } from '@/types/enums';
import { Patient } from '@/entities/patient.entity';
import { Visit } from '@/entities/visit.entity';

@Entity('billings')
@Index(['patientId'])
@Index(['visitId'])
@Index(['status'])
export class Billing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, {
    onDelete: 'CASCADE',
  })
  patient: Patient;

  @Column()
  patientId: string;

  @ManyToOne(() => Visit, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  visit: Visit;

  @Column({ nullable: true })
  visitId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: BillingStatus,
    default: BillingStatus.PENDING,
  })
  status: BillingStatus;

  @Column({ type: 'varchar', nullable: true })
  invoiceUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

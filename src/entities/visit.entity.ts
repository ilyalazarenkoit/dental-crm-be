import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { VisitType, VisitStatus } from '@/types/enums';
import { Patient } from '@/entities/patient.entity';
import { Doctor } from '@/entities/doctor.entity';

@Entity('visits')
@Index(['patientId'])
@Index(['doctorId'])
@Index(['date'])
@Index(['status'])
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  patient: Patient;

  @Column()
  patientId: string;

  // H-5: nullable:true required — SET NULL would violate NOT NULL constraint otherwise
  @ManyToOne(() => Doctor, { nullable: true, onDelete: 'SET NULL' })
  doctor: Doctor | null;

  @Column({ nullable: true })
  doctorId: string | null;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({
    type: 'enum',
    enum: VisitType,
  })
  type: VisitType;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: VisitStatus,
    default: VisitStatus.PLANNED,
  })
  status: VisitStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

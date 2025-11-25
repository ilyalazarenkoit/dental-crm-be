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

  @ManyToOne(() => Doctor, { onDelete: 'SET NULL' })
  doctor: Doctor;

  @Column()
  doctorId: string;

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

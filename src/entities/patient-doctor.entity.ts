import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { DoctorRole } from '@/types/enums';
import { Patient } from '@/entities/patient.entity';
import { Doctor } from '@/entities/doctor.entity';

@Entity('patient_doctors')
@Unique(['patientId', 'doctorId'])
@Index(['patientId'])
@Index(['doctorId'])
export class PatientDoctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, {
    onDelete: 'CASCADE',
  })
  patient: Patient;

  @Column()
  patientId: string;

  @ManyToOne(() => Doctor, {
    onDelete: 'CASCADE',
  })
  doctor: Doctor;

  @Column()
  doctorId: string;

  @Column({
    type: 'enum',
    enum: DoctorRole,
    default: DoctorRole.PRIMARY,
  })
  role: DoctorRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

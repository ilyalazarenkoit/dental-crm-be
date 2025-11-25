import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PatientStatus } from '@/types/enums';
import { Organization } from '@/entities/organization.entity';

@Entity('patients')
@Index(['organizationId'])
@Index(['email'])
@Index(['status'])
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
  gender: 'male' | 'female' | 'other' | null;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  // Structured address
  @Column({ type: 'varchar', nullable: true })
  addressStreet: string;

  @Column({ type: 'varchar', nullable: true })
  addressCity: string;

  @Column({ type: 'varchar', nullable: true })
  addressZip: string;

  @Column({ type: 'varchar', nullable: true })
  addressCountry: string;

  @Column({ type: 'varchar', nullable: true })
  photoUrl: string;

  @Column({
    type: 'enum',
    enum: PatientStatus,
    default: PatientStatus.NEW,
  })
  status: PatientStatus;

  // Tags as PostgreSQL array
  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column()
  organizationId: string;

  // Relations are defined on the child entities (Visit, PatientDoctor, Billing)
  // Access them via queries: patientRepository.find({ relations: ['visits'] })

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

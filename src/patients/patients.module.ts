import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { Patient } from '@/entities/patient.entity';
import { Doctor } from '@/entities/doctor.entity';
import { Visit } from '@/entities/visit.entity';
import { PatientDoctor } from '@/entities/patient-doctor.entity';
import { Billing } from '@/entities/billing.entity';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, Doctor, Visit, PatientDoctor, Billing]),
    CommonModule,
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}

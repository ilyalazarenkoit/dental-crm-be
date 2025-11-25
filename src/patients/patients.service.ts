import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '@/entities/patient.entity';
import { GetPatientsDto } from './dto/get-patients.dto';
import { OrganizationContextService } from '@/common/services/organization-context.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private organizationContextService: OrganizationContextService,
  ) {}

  /**
   * Get paginated list of patients for the user's organization
   * Automatically filtered by organizationId from current user context
   */
  async getPatients(query: GetPatientsDto): Promise<{
    data: Patient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const skip = (page - 1) * limit;

    const organizationId =
      await this.organizationContextService.getOrganizationId();

    const queryBuilder = this.patientRepository
      .createQueryBuilder('patient')
      .where('patient.organizationId = :organizationId', { organizationId });

    if (status) {
      queryBuilder.andWhere('patient.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(patient.firstName ILIKE :search OR patient.lastName ILIKE :search OR patient.email ILIKE :search OR patient.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const orderBy =
      sortBy === 'dateOfBirth' ? 'patient.dateOfBirth' : `patient.${sortBy}`;
    queryBuilder.orderBy(orderBy, sortOrder);

    const total = await queryBuilder.getCount();

    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single patient by ID (only from user's organization)
   * Automatically filtered by organizationId from current user context
   */
  async getPatientById(patientId: string): Promise<Patient> {
    const organizationId =
      await this.organizationContextService.getOrganizationId();

    const patient = await this.patientRepository.findOne({
      where: { id: patientId, organizationId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }
}

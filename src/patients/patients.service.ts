import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '@/entities/patient.entity';
import { GetPatientsDto } from './dto/get-patients.dto';
import { OrganizationContextService } from '@/common/services/organization-context.service';

@Injectable()
export class PatientsService {
  // C-5: Second-layer allowlist as defense-in-depth against ORDER BY injection
  private readonly ALLOWED_SORT_FIELDS = new Set([
    'firstName',
    'lastName',
    'createdAt',
    'dateOfBirth',
  ]);

  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private organizationContextService: OrganizationContextService,
  ) {}

  private getSafeOrderBy(sortBy: string): string {
    if (!this.ALLOWED_SORT_FIELDS.has(sortBy)) {
      return 'patient.createdAt';
    }
    return sortBy === 'dateOfBirth'
      ? 'patient.dateOfBirth'
      : `patient.${sortBy}`;
  }

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

    // C-5: Always use the allowlist-validated column name
    queryBuilder.orderBy(this.getSafeOrderBy(sortBy), sortOrder);

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

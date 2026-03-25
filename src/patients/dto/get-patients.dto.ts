import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PatientStatus } from '@/types/enums';

// C-5: Explicit allowlist prevents SQL injection via ORDER BY parameter
const ALLOWED_SORT_FIELDS = [
  'firstName',
  'lastName',
  'createdAt',
  'dateOfBirth',
] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];

export class GetPatientsDto {
  @ApiPropertyOptional({
    description: 'Page number (starts from 1)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search by first name, last name, email, or phone',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by patient status',
    enum: PatientStatus,
    example: PatientStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(PatientStatus)
  status?: PatientStatus;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    enum: ALLOWED_SORT_FIELDS,
  })
  @IsOptional()
  @IsEnum(ALLOWED_SORT_FIELDS)
  sortBy?: SortField = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

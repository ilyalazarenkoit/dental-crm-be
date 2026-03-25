import {
  Controller,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { GetPatientsDto } from './dto/get-patients.dto';

@ApiTags('Patients')
@Controller('patients')
@ApiBearerAuth()
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of patients',
    description:
      "Returns paginated list of patients for the authenticated user's organization. Requires authentication.",
  })
  @ApiResponse({
    status: 200,
    description: 'List of patients retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              dateOfBirth: { type: 'string', format: 'date' },
              gender: { type: 'string', enum: ['male', 'female', 'other'] },
              phone: { type: 'string' },
              email: { type: 'string' },
              addressStreet: { type: 'string' },
              addressCity: { type: 'string' },
              addressZip: { type: 'string' },
              addressCountry: { type: 'string' },
              photoUrl: { type: 'string' },
              status: {
                type: 'string',
                enum: ['new', 'active', 'vip', 'archived'],
              },
              tags: { type: 'array', items: { type: 'string' } },
              organizationId: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getPatients(@Query() query: GetPatientsDto) {
    // Organization ID is automatically retrieved from user context
    return this.patientsService.getPatients(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get patient by ID',
    description:
      "Returns a single patient by ID. Only patients from the authenticated user's organization are accessible.",
  })
  @ApiResponse({
    status: 200,
    description: 'Patient retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getPatientById(@Param('id', ParseUUIDPipe) id: string) {
    // Organization ID is automatically retrieved from user context
    return this.patientsService.getPatientById(id);
  }
}

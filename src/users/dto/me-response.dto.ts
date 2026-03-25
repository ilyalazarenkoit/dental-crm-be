import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@/types/enums';

export class UserDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole, enumName: 'UserRole' })
  role: UserRole;

  @ApiProperty({ nullable: true, example: 'https://cdn.example.com/avatar.png' })
  avatarUrl: string | null;
}

export class OrganizationDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true, example: 'https://cdn.example.com/logo.png' })
  logoUrl: string | null;
}

export class MeResponseDto {
  @ApiProperty({ type: UserDto })
  user: UserDto;

  @ApiProperty({ type: OrganizationDto })
  organization: OrganizationDto;
}

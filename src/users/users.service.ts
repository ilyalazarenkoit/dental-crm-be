import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { MeResponseDto } from './dto/me-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getMe(userId: string, organizationId: string): Promise<MeResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, organizationId },
      relations: ['organization'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        logoUrl: user.organization.logoUrl ?? null,
      },
    };
  }
}

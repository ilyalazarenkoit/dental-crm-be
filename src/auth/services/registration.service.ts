import {
  Injectable,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '@/entities/user.entity';
import { Organization } from '@/entities/organization.entity';
import { RegisterOwnerDto } from '../dto/register-owner.dto';
import { UserRole, UserStatus, SubscriptionStatus } from '@/types/enums';
import { MailService } from '@/mail/mail.service';
import { randomBytes } from 'crypto';

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private mailService: MailService,
    // H-4: DataSource for atomic transactions
    private dataSource: DataSource,
  ) {}

  async registerOwner(registerOwnerDto: RegisterOwnerDto) {
    const { firstName, lastName, email, password, mobilePhone, organizationName } =
      registerOwnerDto;

    // Fast pre-check before opening a transaction
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    let result: {
      savedUser: User;
      savedOrg: Organization;
      verificationToken: string;
    };

    try {
      // H-4: Both inserts are atomic — an Organization is never created without its owner
      result = await this.dataSource.transaction(async (manager) => {
        const verificationToken = this.generateVerificationToken();
        const verificationTokenExpires = new Date();
        verificationTokenExpires.setHours(
          verificationTokenExpires.getHours() + 24,
        );

        const organization = manager.create(Organization, {
          name: organizationName,
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ),
          subscriptionStatus: SubscriptionStatus.ACTIVE,
        });
        const savedOrg = await manager.save(Organization, organization);

        const user = manager.create(User, {
          firstName,
          lastName,
          email,
          password,
          mobilePhone,
          role: UserRole.OWNER,
          status: UserStatus.PENDING_VERIFICATION,
          verificationToken,
          verificationTokenExpires,
          isEmailVerified: false,
          organization: savedOrg,
        });
        const savedUser = await manager.save(User, user);

        return { savedUser, savedOrg, verificationToken };
      });
    } catch (error) {
      // PostgreSQL unique violation (race condition on email)
      if (error.code === '23505') {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }

    // Email is sent outside the transaction — it cannot be rolled back,
    // but a failed email send doesn't invalidate the registration.
    try {
      await this.mailService.sendVerificationEmail(
        result.savedUser.email,
        result.verificationToken,
      );
    } catch (emailError) {
      this.logger.error(
        `Failed to send verification email for user ${result.savedUser.id}`,
        emailError,
      );
    }

    return {
      user: {
        id: result.savedUser.id,
        firstName: result.savedUser.firstName,
        lastName: result.savedUser.lastName,
        email: result.savedUser.email,
        mobilePhone: result.savedUser.mobilePhone,
        role: result.savedUser.role,
        organizationId: result.savedOrg.id,
        status: result.savedUser.status,
      },
      message:
        'Registration successful. Please verify your email to activate your account.',
    };
  }

  private generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}

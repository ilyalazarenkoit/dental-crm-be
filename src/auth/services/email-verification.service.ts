import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { MailService } from '@/mail/mail.service';
import { UserStatus } from '@/types/enums';
import { randomBytes } from 'crypto';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService,
  ) {}

  async verifyEmail(token: string) {
    this.logger.debug('verifyEmail called');

    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      this.logger.warn('verifyEmail: token not found in DB');
      throw new NotFoundException('Verification token not found');
    }

    if (user.isEmailVerified) {
      return { message: 'Email already verified' };
    }

    if (
      !user.verificationTokenExpires ||
      user.verificationTokenExpires < new Date()
    ) {
      this.logger.warn(`verifyEmail: token expired for user ${user.id}`);
      throw new BadRequestException('Verification token has expired');
    }

    user.isEmailVerified = true;
    user.status = UserStatus.ACTIVE;
    // L-1: Clear used tokens properly with null
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    await this.userRepository.save(user);
    this.logger.log(`Email verified for user ${user.id}`);

    return {
      message: 'Email verification successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        status: user.status,
      },
    };
  }

  // H-3: Prevent user enumeration — always return 200 with a neutral message
  async resendVerificationEmail(email: string) {
    const standardResponse = {
      message:
        'If this email is registered and unverified, a new verification email has been sent.',
    };

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || user.isEmailVerified) {
      return standardResponse;
    }

    const verificationToken = this.generateVerificationToken();
    const verificationTokenExpires = this.generateTokenExpiration(24);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;

    await this.userRepository.save(user);

    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        verificationToken,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send verification email for user ${user.id}`,
        error,
      );
    }

    return standardResponse;
  }

  async prepareForVerification(user: User) {
    const verificationToken = this.generateVerificationToken();
    const verificationTokenExpires = this.generateTokenExpiration(24);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    user.isEmailVerified = false;
    user.status = UserStatus.PENDING_VERIFICATION;

    return {
      user,
      verificationToken,
    };
  }

  private generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  private generateTokenExpiration(hoursValid: number = 24): Date {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + hoursValid);
    return expirationDate;
  }
}

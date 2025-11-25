import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { MailService } from '@/mail/mail.service';
import { UserStatus } from '@/types/enums';
import { randomBytes } from 'crypto';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService,
  ) {}

  async verifyEmail(token: string) {
    console.log(
      '🔍 EmailVerificationService.verifyEmail - Starting verification',
    );
    console.log('🔍 Token received:', token);

    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });
    console.log('🔍 User found in DB:', user ? 'YES' : 'NO');
    if (user) {
      console.log('🔍 User details:', {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        status: user.status,
        verificationToken: user.verificationToken,
        verificationTokenExpires: user.verificationTokenExpires,
      });
    }

    if (!user) {
      console.log('❌ User not found with verification token');
      throw new NotFoundException('Verification token not found');
    }

    if (user.isEmailVerified) {
      console.log('⚠️ Email already verified');
      return { message: 'Email already verified' };
    }

    if (
      !user.verificationTokenExpires ||
      user.verificationTokenExpires < new Date()
    ) {
      console.log('❌ Verification token expired');
      throw new BadRequestException('Verification token has expired');
    }

    console.log('✅ Token is valid, proceeding with verification');

    user.isEmailVerified = true;
    user.status = UserStatus.ACTIVE;
    user.verificationToken = '';
    user.verificationTokenExpires = new Date();

    console.log('💾 Saving user to database...');
    await this.userRepository.save(user);
    console.log('✅ User saved successfully');

    const result = {
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

    console.log('🔍 Returning result:', result);
    return result;
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const verificationToken = this.generateVerificationToken();
    const verificationTokenExpires = this.generateTokenExpiration(24);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;

    await this.userRepository.save(user);

    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return {
      message: 'Verification email resent successfully',
    };
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

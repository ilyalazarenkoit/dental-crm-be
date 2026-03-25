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
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordRecoveryService {
  private readonly logger = new Logger(PasswordRecoveryService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService,
  ) {}

  // H-2: Prevent user enumeration — always return 200 with a neutral message
  async forgotPassword(email: string): Promise<{ message: string }> {
    const standardResponse = {
      message:
        'If this email is registered, you will receive reset instructions shortly.',
    };

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return standardResponse;
    }

    const resetToken = this.generateResetToken();
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await this.userRepository.save(user);

    try {
      await this.mailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email for user ${user.id}`,
        error,
      );
    }

    return standardResponse;
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired password reset token');
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Password reset token has expired');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    // L-1: Clear used tokens properly with null
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);

    return {
      message: 'Password has been successfully reset',
    };
  }

  private generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }
}

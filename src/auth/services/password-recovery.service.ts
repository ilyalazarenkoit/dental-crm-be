import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { MailService } from '@/mail/mail.service';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordRecoveryService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService,
  ) {}

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException(
        'We have sent an email with further instructions if the address is registered.',
      );
    }

    const resetToken = this.generateResetToken();

    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await this.userRepository.save(user);

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: 'Password reset instructions have been sent to your email',
    };
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
    user.resetPasswordToken = '';
    user.resetPasswordExpires = new Date();

    await this.userRepository.save(user);

    return {
      message: 'Password has been successfully reset',
    };
  }

  private generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }
}

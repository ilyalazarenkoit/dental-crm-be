import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@/entities/user.entity";
import { MailService } from "@/mail/mail.service";
import { UserStatus } from "@/types/enums";
import { randomBytes } from "crypto";

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService
  ) {}

  async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new NotFoundException("Verification token not found");
    }

    if (user.isEmailVerified) {
      return { message: "Email already verified" };
    }

    if (
      !user.verificationTokenExpires ||
      user.verificationTokenExpires < new Date()
    ) {
      throw new BadRequestException("Verification token has expired");
    }

    user.isEmailVerified = true;
    user.status = UserStatus.ACTIVE;
    user.verificationToken = "";
    user.verificationTokenExpires = new Date();

    await this.userRepository.save(user);

    return {
      message: "Email verification successful",
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

  async resendVerificationEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.isEmailVerified) {
      throw new BadRequestException("Email already verified");
    }

    const verificationToken = this.generateVerificationToken();
    const verificationTokenExpires = this.generateTokenExpiration(24);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;

    await this.userRepository.save(user);

    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return {
      message: "Verification email resent successfully",
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
    return randomBytes(32).toString("hex");
  }

  private generateTokenExpiration(hoursValid: number = 24): Date {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + hoursValid);
    return expirationDate;
  }
}

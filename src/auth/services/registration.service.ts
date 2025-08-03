import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@/entities/user.entity";
import { Organization } from "@/entities/organization.entity";
import { RegisterOwnerDto } from "../dto/register-owner.dto";
import { UserRole, UserStatus, SubscriptionStatus } from "@/types/enums";
import { MailService } from "@/mail/mail.service";
import { randomBytes } from "crypto";

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    private mailService: MailService
  ) {}

  async registerOwner(registerOwnerDto: RegisterOwnerDto) {
    const {
      firstName,
      lastName,
      email,
      password,
      mobilePhone,
      organizationName,
    } = registerOwnerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const organization = this.organizationRepository.create({
      name: organizationName,
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subscriptionStatus: SubscriptionStatus.ACTIVE,
    });

    try {
      const savedOrganization =
        await this.organizationRepository.save(organization);

      const verificationToken = this.generateVerificationToken();
      const verificationTokenExpires = new Date();
      verificationTokenExpires.setHours(
        verificationTokenExpires.getHours() + 24
      );

      const user = this.userRepository.create({
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
        organization: savedOrganization,
      });

      const savedUser = await this.userRepository.save(user);

      await this.mailService.sendVerificationEmail(
        savedUser.email,
        verificationToken
      );

      return {
        user: {
          id: savedUser.id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          mobilePhone: savedUser.mobilePhone,
          role: savedUser.role,
          organizationId: savedOrganization.id,
          status: savedUser.status,
        },
        message:
          "Registration successful. Please verify your email to activate your account.",
      };
    } catch (error) {
      throw new InternalServerErrorException("Error during registration");
    }
  }

  private generateVerificationToken(): string {
    return randomBytes(32).toString("hex");
  }
}

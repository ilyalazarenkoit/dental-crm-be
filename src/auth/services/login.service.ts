import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@/entities/user.entity";
import { TokenService } from "./token.service";
import * as bcrypt from "bcrypt";
import { UserStatus } from "@/types/enums";

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private tokenService: TokenService
  ) {}

  async login(
    email: string,
    password: string,
    userAgent?: string,
    ip?: string
  ) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException("Please verify your email first");
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("Your account is not active");
    }

    const isPasswordValid = await this.comparePasswords(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Generate secure tokens
    const accessToken = this.tokenService.generateAccessToken(
      user,
      user.organizationId,
      userAgent,
      ip
    );

    const refreshToken = await this.tokenService.generateRefreshToken(
      user,
      userAgent,
      ip
    );

    return {
      accessToken,
      refreshToken,
      user: {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  private async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

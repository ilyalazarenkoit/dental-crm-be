import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomBytes } from "crypto";
import { User } from "@/entities/user.entity";

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  generateJwtToken(user: User, organizationId: number) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: organizationId || user.organizationId,
    };

    return this.jwtService.sign(payload);
  }

  generateVerificationToken(): string {
    return randomBytes(32).toString("hex");
  }

  generateTokenExpiration(hoursValid: number = 24): Date {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + hoursValid);
    return expirationDate;
  }
}

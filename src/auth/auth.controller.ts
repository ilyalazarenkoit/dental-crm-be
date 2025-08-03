import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Headers,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterOwnerDto } from "./dto/register-owner.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { Public } from "./decorators/public.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register/owner")
  async registerOwner(@Body() registerOwnerDto: RegisterOwnerDto) {
    return this.authService.registerOwner(registerOwnerDto);
  }

  @Public()
  @Post("login")
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.login(loginDto);

    // Setting cookie with token
    response.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // In production should be true
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return result;
  }

  @Public()
  @Get("verify-email")
  async verifyEmail(
    @Query("token") token: string,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.verifyEmail(token);

    if (result.user && "accessToken" in result) {
      response.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
    }

    return result;
  }

  @Public()
  @Post("resend-verification")
  async resendVerificationEmail(@Body() { email }: { email: string }) {
    return this.authService.resendVerificationEmail(email);
  }

  @Public()
  @Post("forgot-password")
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post("reset-password")
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post("logout")
  async logout(
    @Headers("authorization") authHeader: string,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.logout(authHeader);

    // Clearing cookie on logout
    response.clearCookie("accessToken");

    return result;
  }
}

import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { BrevoService } from "./brevo.service";

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private smtpTransporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly brevoService: BrevoService
  ) {}

  onModuleInit() {
    this.initSmtpTransport();
    this.logger.log("Mail service initialized with Brevo");
  }

  private initSmtpTransport() {
    const host = this.configService.get<string>("brevo.smtpHost");
    const port = this.configService.get<number>("brevo.smtpPort");
    const user = this.configService.get<string>("brevo.smtpUser");
    const pass = this.configService.get<string>("brevo.smtpPassword");

    if (!host || !port || !user || !pass) {
      this.logger.warn(
        "Brevo SMTP configuration is incomplete. SMTP transport will not be available."
      );
      return;
    }

    this.smtpTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    this.logger.log("Brevo SMTP transport initialized");
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    // Trying to send through SMTP, if not successful - using Brevo API
    if (this.smtpTransporter) {
      try {
        this.logger.log(
          `[SMTP] Attempting to send verification email to: ${email}`
        );

        const verificationLink = `${this.configService.get<string>("brevo.frontendUrl")}/verify-email?token=${token}`;
        const from = this.configService.get<string>("brevo.from");

        const mailOptions = {
          to: email,
          from,
          subject: "Please verify your email address",
          text: `
Welcome to Dental CRM!

Thank you for registering. Please verify your email address by visiting the link below:

${verificationLink}

This link will expire in 24 hours.

If you did not register for Dental CRM, please ignore this email.
          `,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4a4a4a;">Welcome to Dental CRM!</h2>
              <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
              <a href="${verificationLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 15px 0;">
                Verify Email
              </a>
              <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
              <p>${verificationLink}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you did not register for Dental CRM, please ignore this email.</p>
            </div>
          `,
        };

        const info = await this.smtpTransporter.sendMail(mailOptions);
        this.logger.log(`[SMTP] Email sent successfully to: ${email}`);
        this.logger.log(`[SMTP] Message ID: ${info.messageId}`);
        this.logger.debug(`[SMTP] Full response:`, info);
        return;
      } catch (error) {
        this.logger.error(`[SMTP] Error sending verification email:`, error);
        this.logger.warn(`[SMTP] Falling back to Brevo API...`);
      }
    }

    // Fallback to Brevo API
    try {
      await this.brevoService.sendVerificationEmail(email, token);
    } catch (error) {
      this.logger.error(`[Brevo] Error sending verification email:`, error);
      throw new InternalServerErrorException(
        "Failed to send verification email"
      );
    }
  }

  /**
   * Sending password reset email
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // Trying to send through SMTP, if not successful - using Brevo API
    if (this.smtpTransporter) {
      try {
        this.logger.log(
          `[SMTP] Attempting to send password reset email to: ${email}`
        );

        const resetLink = `${this.configService.get<string>("brevo.frontendUrl")}/reset-password?token=${token}`;
        const from = this.configService.get<string>("brevo.from");

        const mailOptions = {
          to: email,
          from,
          subject: "Reset your password",
          text: `
Hello,

You have requested to reset your password for Dental CRM. Please click on the link below to set a new password:

${resetLink}

This link will expire in 1 hour.

If you did not request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The Dental CRM Team
          `,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4a4a4a;">Reset Your Password</h2>
              <p>You have requested to reset your password for Dental CRM. Please click the button below to set a new password:</p>
              <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 15px 0;">
                Reset Password
              </a>
              <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
              <p>${resetLink}</p>
              <p>This link will expire in 1 hour.</p>
              <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
              <p>Best regards,<br>The Dental CRM Team</p>
            </div>
          `,
        };

        const info = await this.smtpTransporter.sendMail(mailOptions);
        this.logger.log(
          `[SMTP] Password reset email sent successfully to: ${email}`
        );
        this.logger.log(`[SMTP] Message ID: ${info.messageId}`);
        this.logger.debug(`[SMTP] Full response:`, info);
        return;
      } catch (error) {
        this.logger.error(`[SMTP] Error sending password reset email:`, error);
        this.logger.warn(`[SMTP] Falling back to Brevo API...`);
      }
    }

    // Fallback to Brevo API
    try {
      await this.brevoService.sendPasswordResetEmail(email, token);
    } catch (error) {
      this.logger.error(`[Brevo] Error sending password reset email:`, error);
      throw new InternalServerErrorException(
        "Failed to send password reset email"
      );
    }
  }
}

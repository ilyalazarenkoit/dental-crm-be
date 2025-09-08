import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";

@Injectable()
export class BrevoService {
  private readonly logger = new Logger(BrevoService.name);
  private apiInstance: TransactionalEmailsApi;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>("brevo.apiKey");
    if (!apiKey) {
      throw new Error("BREVO_API_KEY is not set in environment variables!");
    }

    this.apiInstance = new TransactionalEmailsApi();
    this.apiInstance.setApiKey(0, apiKey); // 0 is the index for apiKey in TransactionalEmailsApiApiKeys
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
    sender?: { name?: string; email: string }
  ): Promise<void> {
    const from = sender || {
      email: this.configService.get<string>("brevo.from"),
      name: "Dental CRM",
    };

    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = from;
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    if (textContent) {
      sendSmtpEmail.textContent = textContent;
    }

    try {
      this.logger.log(`[Brevo] Attempting to send email to: ${to}`);
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`[Brevo] Email sent successfully to: ${to}`);
      this.logger.log(`[Brevo] Response:`, response);
    } catch (error) {
      this.logger.error(`[Brevo] Error sending email:`, error);
      throw new InternalServerErrorException("Failed to send email via Brevo");
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationLink = `${this.configService.get<string>("brevo.frontendUrl")}/verify-email?token=${token}`;

    const htmlContent = `
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
    `;

    const textContent = `
Welcome to Dental CRM!

Thank you for registering. Please verify your email address by visiting the link below:

${verificationLink}

This link will expire in 24 hours.

If you did not register for Dental CRM, please ignore this email.
    `;

    await this.sendEmail(
      email,
      "Please verify your email address",
      htmlContent,
      textContent
    );
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetLink = `${this.configService.get<string>("brevo.frontendUrl")}/reset-password?token=${token}`;

    const htmlContent = `
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
    `;

    const textContent = `
Hello,

You have requested to reset your password for Dental CRM. Please click on the link below to set a new password:

${resetLink}

This link will expire in 1 hour.

If you did not request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The Dental CRM Team
    `;

    await this.sendEmail(
      email,
      "Reset your password",
      htmlContent,
      textContent
    );
  }
}

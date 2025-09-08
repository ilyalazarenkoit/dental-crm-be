"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const brevo_service_1 = require("./brevo.service");
let MailService = MailService_1 = class MailService {
    constructor(configService, brevoService) {
        this.configService = configService;
        this.brevoService = brevoService;
        this.logger = new common_1.Logger(MailService_1.name);
    }
    onModuleInit() {
        this.initSmtpTransport();
        this.logger.log("Mail service initialized with Brevo");
    }
    initSmtpTransport() {
        const host = this.configService.get("brevo.smtpHost");
        const port = this.configService.get("brevo.smtpPort");
        const user = this.configService.get("brevo.smtpUser");
        const pass = this.configService.get("brevo.smtpPassword");
        if (!host || !port || !user || !pass) {
            this.logger.warn("Brevo SMTP configuration is incomplete. SMTP transport will not be available.");
            return;
        }
        this.smtpTransporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user,
                pass,
            },
        });
        this.logger.log("Brevo SMTP transport initialized");
    }
    async sendVerificationEmail(email, token) {
        if (this.smtpTransporter) {
            try {
                this.logger.log(`[SMTP] Attempting to send verification email to: ${email}`);
                const verificationLink = `${this.configService.get("brevo.frontendUrl")}/verify-email?token=${token}`;
                const from = this.configService.get("brevo.from");
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
            }
            catch (error) {
                this.logger.error(`[SMTP] Error sending verification email:`, error);
                this.logger.warn(`[SMTP] Falling back to Brevo API...`);
            }
        }
        try {
            await this.brevoService.sendVerificationEmail(email, token);
        }
        catch (error) {
            this.logger.error(`[Brevo] Error sending verification email:`, error);
            throw new common_1.InternalServerErrorException("Failed to send verification email");
        }
    }
    async sendPasswordResetEmail(email, token) {
        if (this.smtpTransporter) {
            try {
                this.logger.log(`[SMTP] Attempting to send password reset email to: ${email}`);
                const resetLink = `${this.configService.get("brevo.frontendUrl")}/reset-password?token=${token}`;
                const from = this.configService.get("brevo.from");
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
                this.logger.log(`[SMTP] Password reset email sent successfully to: ${email}`);
                this.logger.log(`[SMTP] Message ID: ${info.messageId}`);
                this.logger.debug(`[SMTP] Full response:`, info);
                return;
            }
            catch (error) {
                this.logger.error(`[SMTP] Error sending password reset email:`, error);
                this.logger.warn(`[SMTP] Falling back to Brevo API...`);
            }
        }
        try {
            await this.brevoService.sendPasswordResetEmail(email, token);
        }
        catch (error) {
            this.logger.error(`[Brevo] Error sending password reset email:`, error);
            throw new common_1.InternalServerErrorException("Failed to send password reset email");
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        brevo_service_1.BrevoService])
], MailService);
//# sourceMappingURL=mail.service.js.map
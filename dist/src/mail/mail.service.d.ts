import { OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BrevoService } from "./brevo.service";
export declare class MailService implements OnModuleInit {
    private readonly configService;
    private readonly brevoService;
    private readonly logger;
    private smtpTransporter;
    constructor(configService: ConfigService, brevoService: BrevoService);
    onModuleInit(): void;
    private initSmtpTransport;
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
}

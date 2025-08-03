import { OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
export declare class MailService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private smtpTransporter;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    private initSmtpTransport;
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
}

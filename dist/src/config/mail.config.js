"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)("brevo", () => ({
    apiKey: process.env.BREVO_API_KEY,
    from: process.env.BREVO_FROM_EMAIL,
    smtpHost: process.env.BREVO_SMTP_HOST,
    smtpPort: process.env.BREVO_SMTP_PORT,
    smtpUser: process.env.BREVO_SMTP_USER,
    smtpPassword: process.env.BREVO_SMTP_PASSWORD,
    frontendUrl: process.env.FRONTEND_URL,
}));
//# sourceMappingURL=mail.config.js.map
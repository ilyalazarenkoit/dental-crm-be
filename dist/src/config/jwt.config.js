"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)("jwt", () => ({
    accessToken: {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    },
    refreshToken: {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },
    issuer: process.env.JWT_ISSUER || "dentalcrm-backend",
    audience: process.env.JWT_AUDIENCE || "dentalcrm-frontend",
    enableFingerprinting: process.env.JWT_ENABLE_FINGERPRINTING !== "false",
    maxTokensPerUser: parseInt(process.env.JWT_MAX_TOKENS_PER_USER || "5", 10),
}));
//# sourceMappingURL=jwt.config.js.map
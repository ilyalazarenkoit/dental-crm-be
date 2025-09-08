import { registerAs } from "@nestjs/config";

export default registerAs("jwt", () => ({
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m", // Short lifetime for access token
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d", // Long lifetime for refresh token
  },
  // Additional security parameters
  issuer: process.env.JWT_ISSUER || "dentalcrm-backend",
  audience: process.env.JWT_AUDIENCE || "dentalcrm-frontend",
  // Fingerprinting settings
  enableFingerprinting: process.env.JWT_ENABLE_FINGERPRINTING !== "false", // Enabled by default
  // Rate limiting settings
  maxTokensPerUser: parseInt(process.env.JWT_MAX_TOKENS_PER_USER || "5", 10),
}));

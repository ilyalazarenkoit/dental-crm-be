declare const _default: (() => {
    accessToken: {
        secret: string | undefined;
        expiresIn: string;
    };
    refreshToken: {
        secret: string | undefined;
        expiresIn: string;
    };
    issuer: string;
    audience: string;
    enableFingerprinting: boolean;
    maxTokensPerUser: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    accessToken: {
        secret: string | undefined;
        expiresIn: string;
    };
    refreshToken: {
        secret: string | undefined;
        expiresIn: string;
    };
    issuer: string;
    audience: string;
    enableFingerprinting: boolean;
    maxTokensPerUser: number;
}>;
export default _default;

declare const _default: (() => {
    accessToken: {
        secret: string | undefined;
        expiresIn: string | undefined;
    };
    refreshToken: {
        secret: string | undefined;
        expiresIn: string | undefined;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    accessToken: {
        secret: string | undefined;
        expiresIn: string | undefined;
    };
    refreshToken: {
        secret: string | undefined;
        expiresIn: string | undefined;
    };
}>;
export default _default;

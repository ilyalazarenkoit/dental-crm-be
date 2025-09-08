"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtCookieMiddleware = void 0;
const common_1 = require("@nestjs/common");
let JwtCookieMiddleware = class JwtCookieMiddleware {
    use(req, res, next) {
        const token = req.cookies?.jwt || req.cookies?.access_token;
        if (token) {
            req.headers.authorization = `Bearer ${token}`;
        }
        req.userAgent = req.headers["user-agent"] || "unknown";
        req.clientIp = this.getClientIp(req);
        next();
    }
    getClientIp(req) {
        const xForwardedFor = req.headers["x-forwarded-for"];
        const xRealIp = req.headers["x-real-ip"];
        const cfConnectingIp = req.headers["cf-connecting-ip"];
        if (cfConnectingIp) {
            return Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp;
        }
        if (xRealIp) {
            return Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
        }
        if (xForwardedFor) {
            const ips = Array.isArray(xForwardedFor)
                ? xForwardedFor[0]
                : xForwardedFor;
            return ips.split(",")[0].trim();
        }
        return (req.connection.remoteAddress || req.socket.remoteAddress || "unknown");
    }
};
exports.JwtCookieMiddleware = JwtCookieMiddleware;
exports.JwtCookieMiddleware = JwtCookieMiddleware = __decorate([
    (0, common_1.Injectable)()
], JwtCookieMiddleware);
//# sourceMappingURL=jwt-cookie.middleware.js.map
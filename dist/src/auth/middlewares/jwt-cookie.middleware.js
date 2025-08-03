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
        if (req.headers.authorization) {
            next();
            return;
        }
        const token = req.cookies["accessToken"];
        if (token) {
            req.headers.authorization = `Bearer ${token}`;
        }
        next();
    }
};
exports.JwtCookieMiddleware = JwtCookieMiddleware;
exports.JwtCookieMiddleware = JwtCookieMiddleware = __decorate([
    (0, common_1.Injectable)()
], JwtCookieMiddleware);
//# sourceMappingURL=jwt-cookie.middleware.js.map
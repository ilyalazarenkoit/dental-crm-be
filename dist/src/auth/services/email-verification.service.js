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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const mail_service_1 = require("../../mail/mail.service");
const enums_1 = require("../../types/enums");
const crypto_1 = require("crypto");
let EmailVerificationService = class EmailVerificationService {
    constructor(userRepository, mailService) {
        this.userRepository = userRepository;
        this.mailService = mailService;
    }
    async verifyEmail(token) {
        const user = await this.userRepository.findOne({
            where: { verificationToken: token },
        });
        if (!user) {
            throw new common_1.NotFoundException("Verification token not found");
        }
        if (user.isEmailVerified) {
            return { message: "Email already verified" };
        }
        if (!user.verificationTokenExpires ||
            user.verificationTokenExpires < new Date()) {
            throw new common_1.BadRequestException("Verification token has expired");
        }
        user.isEmailVerified = true;
        user.status = enums_1.UserStatus.ACTIVE;
        user.verificationToken = "";
        user.verificationTokenExpires = new Date();
        await this.userRepository.save(user);
        return {
            message: "Email verification successful",
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId,
                status: user.status,
            },
        };
    }
    async resendVerificationEmail(email) {
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        if (user.isEmailVerified) {
            throw new common_1.BadRequestException("Email already verified");
        }
        const verificationToken = this.generateVerificationToken();
        const verificationTokenExpires = this.generateTokenExpiration(24);
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = verificationTokenExpires;
        await this.userRepository.save(user);
        await this.mailService.sendVerificationEmail(user.email, verificationToken);
        return {
            message: "Verification email resent successfully",
        };
    }
    async prepareForVerification(user) {
        const verificationToken = this.generateVerificationToken();
        const verificationTokenExpires = this.generateTokenExpiration(24);
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = verificationTokenExpires;
        user.isEmailVerified = false;
        user.status = enums_1.UserStatus.PENDING_VERIFICATION;
        return {
            user,
            verificationToken,
        };
    }
    generateVerificationToken() {
        return (0, crypto_1.randomBytes)(32).toString("hex");
    }
    generateTokenExpiration(hoursValid = 24) {
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + hoursValid);
        return expirationDate;
    }
};
exports.EmailVerificationService = EmailVerificationService;
exports.EmailVerificationService = EmailVerificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        mail_service_1.MailService])
], EmailVerificationService);
//# sourceMappingURL=email-verification.service.js.map
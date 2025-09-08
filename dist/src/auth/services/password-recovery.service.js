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
exports.PasswordRecoveryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const mail_service_1 = require("../../mail/mail.service");
const crypto_1 = require("crypto");
const bcrypt = require("bcrypt");
let PasswordRecoveryService = class PasswordRecoveryService {
    constructor(userRepository, mailService) {
        this.userRepository = userRepository;
        this.mailService = mailService;
    }
    async forgotPassword(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.BadRequestException('We have sent an email with further instructions if the address is registered.');
        }
        const resetToken = this.generateResetToken();
        const resetTokenExpires = new Date();
        resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpires;
        await this.userRepository.save(user);
        await this.mailService.sendPasswordResetEmail(user.email, resetToken);
        return {
            message: 'Password reset instructions have been sent to your email',
        };
    }
    async resetPassword(token, newPassword) {
        const user = await this.userRepository.findOne({
            where: { resetPasswordToken: token },
        });
        if (!user) {
            throw new common_1.NotFoundException('Invalid or expired password reset token');
        }
        if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new common_1.BadRequestException('Password reset token has expired');
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        user.resetPasswordToken = '';
        user.resetPasswordExpires = new Date();
        await this.userRepository.save(user);
        return {
            message: 'Password has been successfully reset',
        };
    }
    generateResetToken() {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
};
exports.PasswordRecoveryService = PasswordRecoveryService;
exports.PasswordRecoveryService = PasswordRecoveryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        mail_service_1.MailService])
], PasswordRecoveryService);
//# sourceMappingURL=password-recovery.service.js.map
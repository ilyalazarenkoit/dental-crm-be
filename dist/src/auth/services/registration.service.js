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
exports.RegistrationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const organization_entity_1 = require("../../entities/organization.entity");
const enums_1 = require("../../types/enums");
const mail_service_1 = require("../../mail/mail.service");
const crypto_1 = require("crypto");
let RegistrationService = class RegistrationService {
    constructor(userRepository, organizationRepository, mailService) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.mailService = mailService;
    }
    async registerOwner(registerOwnerDto) {
        const { firstName, lastName, email, password, mobilePhone, organizationName, } = registerOwnerDto;
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException("User with this email already exists");
        }
        const organization = this.organizationRepository.create({
            name: organizationName,
            subscriptionStartDate: new Date(),
            subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            subscriptionStatus: enums_1.SubscriptionStatus.ACTIVE,
        });
        try {
            const savedOrganization = await this.organizationRepository.save(organization);
            const verificationToken = this.generateVerificationToken();
            const verificationTokenExpires = new Date();
            verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);
            const user = this.userRepository.create({
                firstName,
                lastName,
                email,
                password,
                mobilePhone,
                role: enums_1.UserRole.OWNER,
                status: enums_1.UserStatus.PENDING_VERIFICATION,
                verificationToken,
                verificationTokenExpires,
                isEmailVerified: false,
                organization: savedOrganization,
            });
            const savedUser = await this.userRepository.save(user);
            await this.mailService.sendVerificationEmail(savedUser.email, verificationToken);
            return {
                user: {
                    id: savedUser.id,
                    firstName: savedUser.firstName,
                    lastName: savedUser.lastName,
                    email: savedUser.email,
                    mobilePhone: savedUser.mobilePhone,
                    role: savedUser.role,
                    organizationId: savedOrganization.id,
                    status: savedUser.status,
                },
                message: "Registration successful. Please verify your email to activate your account.",
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException("Error during registration");
        }
    }
    generateVerificationToken() {
        return (0, crypto_1.randomBytes)(32).toString("hex");
    }
};
exports.RegistrationService = RegistrationService;
exports.RegistrationService = RegistrationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        mail_service_1.MailService])
], RegistrationService);
//# sourceMappingURL=registration.service.js.map
# 🦷 DentalCRM Backend

**NestJS TypeScript PostgreSQL**

B2B SaaS platform for dental clinics | Status: In Development

## 📋 Overview

DentalCRM is a modern SaaS backend platform designed for dental practice management. Built with NestJS and TypeScript, featuring multi-tenant architecture with complete data isolation. The project is currently in early development with authentication, patient management (partial), and core infrastructure implemented.

## ✨ Features

### ✅ Implemented

#### Authentication System

- Organization owner registration with organization creation
- Login with JWT tokens (access + refresh)
- Email verification with token expiration
- Password recovery (forgot/reset password)
- Resend verification email
- Token refresh mechanism with rotation
- Token blacklist for secure logout
- User roles: Owner, Admin, Doctor
- Device fingerprinting (user agent + IP tracking)

#### Multi-tenant Architecture

- Complete data isolation by `organizationId`
- Automatic filtering of all requests via `OrganizationContextService`
- Organization context interceptor for request preprocessing
- Application-level security enforcement
- Single database for all organizations

#### Patient Management (Read Operations)

- `GET /patients` - Get paginated patient list
  - Search by first name, last name, email, phone
  - Filter by status (new, active, vip, archived)
  - Sort by firstName, lastName, createdAt, dateOfBirth
  - Pagination with configurable page size (1-100)
- `GET /patients/:id` - Get patient by ID
- Patient data model: contacts, address, photo, tags, statuses

#### Email Service

- Brevo integration (SMTP + API)
- Automatic fallback between SMTP and API
- Email verification templates (HTML)
- Password recovery templates (HTML)
- Configurable email service

#### Security

- JWT authentication with access and refresh tokens
- Password hashing (bcrypt with salt rounds)
- Token blacklist mechanism (in-memory storage)
- Global JWT guard (all endpoints protected by default)
- Public endpoint decorator (`@Public()`) for auth routes
- Cookie-based refresh tokens (httpOnly, secure, sameSite: strict)
- Input validation (class-validator with DTOs)
- CORS configuration
- Automatic data isolation by organization
- SQL injection protection (TypeORM parameterized queries)

#### Infrastructure

- Global validation via class-validator
- Exception filters for standardized error handling
- Response interceptors for response standardization
- TypeScript strict mode enabled
- ESLint + Prettier configured
- Jest testing framework configured (test files pending)

### 🚧 In Development

#### Patient Management (Write Operations)

- `POST /patients` - Create new patient
- `PUT /patients/:id` - Update patient
- `DELETE /patients/:id` - Delete patient

#### Doctor Management

- CRUD operations for doctors
- Doctor entity exists, controller/service pending
- Doctor specialization and profile management

#### Visit Management

- CRUD operations for visits/appointments
- Visit entity exists with types (consultation, treatment, control)
- Visit status management (planned, completed, canceled)
- Doctor-patient visit relationships

#### Billing Management

- CRUD operations for billing/invoices
- Billing entity exists with statuses (paid, unpaid, pending, refunded)
- Invoice generation and management
- Visit-billing relationships

#### User Invitation System

- Invitation entity exists
- Send invitations to users (Admin, Doctor roles)
- Invitation acceptance flow
- Invitation expiration handling

#### API Documentation

- Swagger/OpenAPI setup and configuration
- API documentation for all endpoints
- Interactive API explorer

#### Testing

- Unit tests for services
- Integration tests for controllers
- E2E tests for critical flows

### 📋 Planned

- AI-powered features integration
- Advanced reporting and analytics
- Calendar and scheduling system
- Document management
- Third-party integrations
- Real-time notifications
- WebSocket support for live updates
- File upload service
- Audit logging system

## 🛠 Technology Stack

### Core

- **NestJS 10** - Progressive Node.js framework
- **TypeScript 5.8** - Type safety with strict mode
- **Node.js 18+** - Runtime environment

### Database

- **PostgreSQL** - Relational database
- **TypeORM 0.3** - ORM for database operations
- Database indexes on frequently queried fields

### Security

- **JWT** - Authentication tokens (jsonwebtoken)
- **Passport.js** - Authentication strategies
- **bcrypt** - Password hashing
- **Cookie Parser** - Secure cookie handling

### Integrations

- **Brevo** - Email service (SMTP + API)
- **Nodemailer** - Email sending

### Development Tools

- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x+
- PostgreSQL
- npm/yarn/pnpm

### Installation

```bash
# Clone repository
git clone <repository-url>
cd dentalcrmBE

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Edit .env with your configuration

# Run development server
npm run start:dev
```

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=dental_crm

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Brevo)
BREVO_API_KEY=your_brevo_api_key
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_smtp_user
BREVO_SMTP_PASSWORD=your_smtp_password
BREVO_FROM=noreply@yourdomain.com
BREVO_FRONTEND_URL=http://localhost:3000

# Server
PORT=3001
NODE_ENV=development
```

### Available Scripts

```bash
npm run dev              # Development server (nodemon)
npm run build            # Production build
npm run start            # Production server
npm run start:dev        # Development mode with hot reload
npm run start:debug      # Debug mode
npm run lint              # ESLint
npm run lint:fix          # Auto-fix linting errors
npm run test              # Run tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Tests with coverage
npm run test:ci           # Run tests for CI
npm run type-check        # TypeScript type checking
npm run format            # Format code with Prettier
npm run format:check      # Check code formatting
```

## 📁 Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── guards/              # JWT guards
│   │   └── jwt-auth.guard.ts
│   ├── services/           # Auth services
│   │   ├── login.service.ts
│   │   ├── registration.service.ts
│   │   ├── email-verification.service.ts
│   │   ├── password-recovery.service.ts
│   │   ├── logout.service.ts
│   │   ├── token.service.ts
│   │   ├── token-blacklist.service.ts
│   │   └── refresh-token-storage.service.ts
│   ├── dto/                # Data Transfer Objects
│   │   ├── register-owner.dto.ts
│   │   ├── login.dto.ts
│   │   ├── forgot-password.dto.ts
│   │   └── reset-password.dto.ts
│   ├── decorators/         # Custom decorators
│   │   ├── public.decorator.ts
│   │   └── current-user.decorator.ts
│   ├── middlewares/        # Auth middlewares
│   │   ├── jwt-cookie.middleware.ts
│   │   └── token-blacklist.middleware.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── patients/               # Patients module
│   ├── dto/
│   │   └── get-patients.dto.ts
│   ├── patients.controller.ts
│   ├── patients.service.ts
│   └── patients.module.ts
├── common/                 # Common services
│   ├── services/
│   │   ├── organization-context.service.ts
│   │   └── base-tenant.service.ts
│   ├── interceptors/
│   │   └── organization-context.interceptor.ts
│   ├── decorators/
│   │   └── organization-scoped.decorator.ts
│   └── common.module.ts
├── entities/               # TypeORM entities
│   ├── user.entity.ts
│   ├── organization.entity.ts
│   ├── patient.entity.ts
│   ├── doctor.entity.ts
│   ├── visit.entity.ts
│   ├── billing.entity.ts
│   ├── invitation.entity.ts
│   ├── refresh-token.entity.ts
│   └── patient-doctor.entity.ts
├── config/                 # Configuration files
│   ├── jwt.config.ts
│   └── mail.config.ts
├── mail/                   # Email service
│   ├── mail.service.ts
│   ├── brevo.service.ts
│   └── mail.module.ts
├── filters/                # Exception filters
│   └── http-exception.filter.ts
├── interceptors/           # Response interceptors
│   └── transform.interceptor.ts
├── types/                   # TypeScript types and enums
│   ├── enums.ts
│   ├── types.ts
│   ├── dto.ts
│   └── api-response.interface.ts
├── utils/                  # Utility functions
│   └── utils.ts
├── app.ts                  # Main application module
└── server.ts               # Application entry point
```

## 🔒 Security

✅ JWT authentication (access + refresh tokens)  
✅ Password hashing (bcrypt with salt rounds)  
✅ Token blacklist mechanism  
✅ Global endpoint protection via JWT guards  
✅ Public endpoint decorator (`@Public()`)  
✅ Cookie-based refresh tokens (httpOnly, secure, sameSite: strict)  
✅ Input validation (class-validator with DTOs)  
✅ CORS configuration  
✅ Automatic data isolation by organization  
✅ SQL injection protection (TypeORM parameterized queries)  
✅ Device fingerprinting for security tracking

## 📚 API Endpoints

### Authentication (`/auth`)

- `POST /auth/register/owner` - Register organization owner
- `POST /auth/login` - User login (returns access token + user)
- `GET /auth/verify-email?token=...` - Verify email address
- `POST /auth/resend-verification` - Resend verification email
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/refresh` - Refresh access token (uses cookie)
- `POST /auth/logout` - User logout (invalidates tokens)

### Patients (`/patients`)

- `GET /patients` - Get paginated patient list
  - Query params: `page`, `limit`, `search`, `status`, `sortBy`, `sortOrder`
  - Returns: paginated list with total, page, limit, totalPages
- `GET /patients/:id` - Get patient by ID
  - Returns: single patient object

## 🧪 Testing

### Test Framework

- **Jest** - Testing framework (configured)
- **@nestjs/testing** - NestJS testing utilities

### Test Status

🚧 **Tests in development** - Test framework is fully configured and ready, but test files (`*.spec.ts`) are not yet implemented.

### Available Test Scripts

```bash
npm run test              # Run tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
npm run test:ci           # Run tests for CI (with coverage, no watch)
```

### Test Configuration

- Test files pattern: `*.spec.ts`
- Coverage directory: `coverage/`
- Test environment: Node.js
- Coverage reports: HTML, LCOV, JSON formats
- Pre-build hook: runs tests before build

## 📝 License

Proprietary - All rights reserved

Made with ❤️ for dental professionals

# Dental CRM Backend

A NestJS-based backend for the Dental CRM system.

## Project Structure

```
src/
├── controllers/    # Request handlers
├── routes/        # Route definitions
├── models/        # Database models
├── services/      # Business logic
├── middlewares/   # Middleware functions
├── utils/         # Helper functions
├── config/        # Configuration files
├── types/         # TypeScript types
├── app.ts         # Main application module
└── server.ts      # Application entry point
```

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

- Copy `.env.example` to `.env`
- Update the values according to your environment

## Development

Start the development server:

```bash
npm run start:dev
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3001/api
```

## Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

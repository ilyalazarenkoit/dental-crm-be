import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './src/app';
import { HttpExceptionFilter } from './src/filters/http-exception.filter';
import { TransformInterceptor } from './src/interceptors/transform.interceptor';
import { OrganizationContextInterceptor } from './src/common/interceptors/organization-context.interceptor';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json, urlencoded } from 'express';

async function bootstrap() {
  // C-4: Validate required environment variables before anything starts
  const requiredEnv = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'DB_HOST',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME',
  ];
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `[FATAL] Missing required environment variables: ${missing.join(', ')}`,
    );
    process.exit(1);
  }

  // L-6: Disable default body parser to enforce a custom size limit
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // L-6: Explicit 1 MB body size limit
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  // M-4: Security headers via helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false,
        value: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const organizationContextInterceptor = app.get(
    OrganizationContextInterceptor,
  );
  app.useGlobalInterceptors(organizationContextInterceptor);
  app.useGlobalInterceptors(new TransformInterceptor());
  // H-7: ClassSerializerInterceptor activates @Exclude() on entity fields
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // L-5: Swagger only in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Dental CRM API')
      .setDescription('API documentation for Dental CRM system')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    console.log(
      `Swagger UI available at http://localhost:${process.env.PORT || 3001}/api`,
    );
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();

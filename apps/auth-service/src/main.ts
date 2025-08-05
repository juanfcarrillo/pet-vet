import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configurar CORS
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  // Configurar prefijo global para las rutas
  app.setGlobalPrefix('api');

  const port = process.env.AUTH_SERVICE_PORT || 3001;
  await app.listen(port);
  console.log(`🔐 Auth Service running on port ${port}`);
  console.log(`📋 Health check available at: http://localhost:${port}/api/auth/health`);
}
bootstrap();

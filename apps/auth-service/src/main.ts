import './instrument';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import Consul from 'consul';

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

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('API documentation for the Auth Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10);
  await app.listen(port);

  // Register with Consul
  const consul = new Consul({
    host: process.env.CONSUL_HOST || 'localhost',
    port: parseInt(process.env.CONSUL_PORT || '8500', 10),
  });
  const serviceId = `auth-service-${port}`;
  consul.agent.service.register({
    id: serviceId,
    name: 'auth-service',
    address: process.env.CONSUL_HOST ? 'auth-service' : 'localhost',
    port: port,
    check: {
      name: 'auth-service-check',
      http: `http://${process.env.CONSUL_HOST ? 'auth-service' : 'localhost'}:${port}/api/auth/health`,
      interval: '10s',
      timeout: '5s',
    },
  }).then(() => {
    console.log('Successfully registered with Consul');
  }).catch((err) => {
    console.error('Failed to register with Consul:', err);
  });

  console.log(`🔐 Auth Service running on port ${port}`);
  console.log(`📋 Health check available at: http://localhost:${port}/api/auth/health`);
  console.log(`📋 Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();

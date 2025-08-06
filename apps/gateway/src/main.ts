import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import Consul from 'consul';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure global validation
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Configure global prefix for routes
  app.setGlobalPrefix('api');

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Pet-Vet API Gateway')
    .setDescription('API Gateway for Pet-Vet microservices platform. Routes requests to Auth, Appointments, and Chat services.')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3000', 'Development Server')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = parseInt(process.env.GATEWAY_PORT || '3000', 10);
  await app.listen(port);

  console.log(`🚀 Gateway service running on port ${port}`);

  // Register with Consul
  const consul = new Consul({
    host: process.env.CONSUL_HOST || 'localhost',
    port: parseInt(process.env.CONSUL_PORT || '8500', 10),
  });
  const serviceId = `gateway-service-${port}`;
  consul.agent.service.register({
    id: serviceId,
    name: 'gateway-service',
    address: process.env.CONSUL_HOST ? 'gateway' : 'localhost',
    port: port,
    check: {
      name: 'gateway-service-check',
      http: `http://${process.env.CONSUL_HOST ? 'gateway' : 'localhost'}:${port}/api/health`,
      interval: '10s',
      timeout: '5s',
    },
  }).then(() => {
    console.log('Successfully registered with Consul');
  }).catch((err) => {
    console.error('Failed to register with Consul:', err);
  });

  console.log(`🚀 API Gateway running on port ${port}`);
  console.log(`📋 Swagger docs available at: http://localhost:${port}/api/docs`);
  console.log(`🔧 Health check available at: http://localhost:${port}/api/health`);
  console.log(`📊 Services info available at: http://localhost:${port}/api/services`);
  console.log(`\n🔗 Microservices:`);
  console.log(`   Auth Service: http://localhost:3001/api/docs`);
  console.log(`   Appointment Service: http://localhost:3002/api/docs`);
  console.log(`   Chat Service: http://localhost:3003/api/docs`);
  console.log(`   Chat WebSocket: ws://localhost:3003/chat`);
}

bootstrap();

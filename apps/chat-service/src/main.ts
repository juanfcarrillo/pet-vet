import './instrument';
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
  });

  // Configure global prefix for routes
  app.setGlobalPrefix('api');

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Chat Service API')
    .setDescription('API documentation for the Chat Service with WebSocket support')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = parseInt(process.env.CHAT_SERVICE_PORT || '3003', 10);
  await app.listen(port);

  // Register with Consul
  const consul = new Consul({
    host: process.env.CONSUL_HOST || 'localhost',
    port: parseInt(process.env.CONSUL_PORT || '8500', 10),
  });
  const serviceId = `chat-service-${port}`;
  consul.agent.service.register({
    id: serviceId,
    name: 'chat-service',
    address: process.env.CONSUL_HOST ? 'chat-service' : 'localhost',
    port: port,
    check: {
      name: 'chat-service-check',
      http: `http://${process.env.CONSUL_HOST ? 'chat-service' : 'localhost'}:${port}/api/health`,
      interval: '10s',
      timeout: '5s',
    },
  }).then(() => {
    console.log('Successfully registered with Consul');
  }).catch((err) => {
    console.error('Failed to register with Consul:', err);
  });

  console.log(`💬 Chat Service running on port ${port}`);
  console.log(`🔌 WebSocket server available at: ws://localhost:${port}/chat`);
  console.log(`📋 Health check available at: http://localhost:${port}/api/health`);
  console.log(`📋 Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();

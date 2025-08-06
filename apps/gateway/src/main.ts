// Importaciones principales de NestJS y módulos auxiliares
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import Consul from 'consul';

// Carga las variables de entorno desde el archivo .env
dotenv.config();

async function bootstrap() {
  // Crea una instancia de la aplicación NestJS con el módulo principal
  const app = await NestFactory.create(AppModule);

  // Configura validaciones globales para todos los controladores y DTOs
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

  // Habilita CORS para permitir el acceso desde el frontend
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Define un prefijo global para todas las rutas (por ejemplo: /api/...)
  app.setGlobalPrefix('api');

  // Configura Swagger para la documentación automática de la API
  const config = new DocumentBuilder()
    .setTitle('Pet-Vet API Gateway')
    .setDescription('API Gateway for Pet-Vet microservices platform. Routes requests to Auth, Appointments, and Chat services.')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3000', 'Development Server')
    .build();
  // Genera y expone la documentación Swagger en /api/docs
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Obtiene el puerto del gateway desde variables de entorno o usa 3000 por defecto
  const port = parseInt(process.env.GATEWAY_PORT || '3000', 10);
  await app.listen(port);

  console.log(`🚀 Gateway service running on port ${port}`);

  // Registro del servicio en Consul para descubrimiento de microservicios
  const consul = new Consul({
    host: process.env.CONSUL_HOST || 'localhost',
    port: parseInt(process.env.CONSUL_PORT || '8500', 10),
  });
  const serviceId = `gateway-service-${port}`;

  // Registra este servicio en Consul con un chequeo de salud (endpoint /api/health)
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

  // Logs informativos que muestran el estado del API Gateway y microservicios
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

// Ejecuta la función principal para arrancar la aplicación
bootstrap();

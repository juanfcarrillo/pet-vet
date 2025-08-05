import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : 'http://localhost:5173',
    credentials: true,
  });

  const port = process.env.GATEWAY_PORT || 3000;
  await app.listen(port);
  console.log(`🚀 API Gateway running on port ${port}`);
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  const port = process.env.AUTH_SERVICE_PORT || 3001;
  await app.listen(port);
  console.log(`🔐 Auth Service running on port ${port}`);
}
bootstrap();

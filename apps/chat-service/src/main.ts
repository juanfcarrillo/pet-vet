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

  const port = process.env.CHAT_SERVICE_PORT || 3003;
  await app.listen(port);
  console.log(`💬 Chat Service running on port ${port}`);
}
bootstrap();

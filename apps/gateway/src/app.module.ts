import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MicroserviceHttpService } from './services/microservice-http.service';
import { AuthGatewayController } from './controllers/auth-gateway.controller';
import { AppointmentsGatewayController } from './controllers/appointments-gateway.controller';
import { ChatGatewayController } from './controllers/chat-gateway.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '../../.env'],
    }),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [
    AppController,
    AuthGatewayController,
    AppointmentsGatewayController,
    ChatGatewayController,
  ],
  providers: [AppService, MicroserviceHttpService, ConfigService],
})
export class AppModule {}

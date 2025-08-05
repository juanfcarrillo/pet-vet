import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './modules/chat.module';
import { ChatMessage } from './entities/chat.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '../../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('CHAT_DB_HOST') || 'localhost',
        port: configService.get<number>('CHAT_DB_PORT') || 5435,
        username: configService.get<string>('CHAT_DB_USER') || 'postgres',
        password: configService.get<string>('CHAT_DB_PASSWORD') || 'postgres',
        database: configService.get<string>('CHAT_DB_NAME') || 'chat_db',
        entities: [ChatMessage],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

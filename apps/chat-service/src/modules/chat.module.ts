import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { ChatGateway } from '../gateways/chat.gateway';
import { ChatService } from '../services/chat.service';
import { ChatController } from '../controllers/chat.controller';
import { ChatMessage } from '../entities/chat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage]),
    ConfigModule,
    HttpModule,
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}

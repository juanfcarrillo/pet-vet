import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { ChatGateway } from '../gateways/chat.gateway';
import { ChatService } from '../services/chat.service';
import { ChatMessage } from '../entities/chat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage]),
    ConfigModule,
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}

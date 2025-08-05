import { 
  IsString, 
  IsUUID, 
  MaxLength, 
  MinLength,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConversationType, MessageStatus } from '../entities/chat.entity';

export class CreateMessageDto {
  @ApiProperty({ description: 'Sender ID (UUID)' })
  @IsUUID()
  senderId: string;

  @ApiProperty({ description: 'Sender name', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  senderName: string;

  @ApiProperty({ description: 'Sender role (client/veterinarian)', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  senderRole: string;

  @ApiPropertyOptional({ description: 'Recipient ID (UUID)' })
  @IsOptional()
  @IsUUID()
  recipientId?: string;

  @ApiPropertyOptional({ description: 'Recipient name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  recipientName?: string;

  @ApiProperty({ 
    description: 'Message content', 
    minLength: 1, 
    maxLength: 500 
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content: string;

  @ApiProperty({ description: 'Conversation ID' })
  @IsString()
  @MaxLength(100)
  conversationId: string;

  @ApiPropertyOptional({ 
    description: 'Conversation type',
    enum: ConversationType,
    default: ConversationType.PRIVATE
  })
  @IsOptional()
  @IsEnum(ConversationType)
  type?: ConversationType;
}

export class UpdateMessageDto {
  @ApiProperty({ 
    description: 'Updated message content', 
    minLength: 1, 
    maxLength: 500 
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content: string;
}

export class MessageStatusDto {
  @ApiProperty({ 
    description: 'Message status',
    enum: MessageStatus
  })
  @IsEnum(MessageStatus)
  status: MessageStatus;
}

export class ConversationFilterDto {
  @ApiPropertyOptional({ description: 'User ID to filter conversations' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ 
    description: 'Conversation type to filter',
    enum: ConversationType
  })
  @IsOptional()
  @IsEnum(ConversationType)
  type?: ConversationType;

  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class MessageFilterDto {
  @ApiProperty({ description: 'Conversation ID' })
  @IsString()
  conversationId: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

export class JoinRoomDto {
  @ApiProperty({ description: 'Room/Conversation ID to join' })
  @IsString()
  room: string;

  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'User name' })
  @IsString()
  userName: string;
}

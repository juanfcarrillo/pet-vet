import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChatService } from '../services/chat.service';
import { 
  CreateMessageDto, 
  UpdateMessageDto, 
  MessageStatusDto,
  ConversationFilterDto,
  MessageFilterDto 
} from '../dto/chat.dto';
import { ResponseUtil } from '@pet-vet/common';
import { ApiResponse as ApiResponseType, User } from '@pet-vet/types';

@ApiTags('Chat')
@Controller('chat')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * HU07 - Get conversation messages
   * GET /api/chat/messages
   */
  @Get('messages')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get messages in a conversation' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully.' })
  @ApiQuery({ name: 'conversationId', description: 'Conversation ID', type: 'string' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: 'number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: 'number' })
  async getConversationMessages(
    @Query() filters: MessageFilterDto,
  ): Promise<ApiResponseType<{
    messages: any[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const result = await this.chatService.getConversationMessages(
        filters.conversationId,
        filters
      );
      return ResponseUtil.success(result, 'Mensajes obtenidos exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user conversations
   * GET /api/chat/users/:userId/conversations
   */
  @Get('users/:userId/conversations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all conversations for a user' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully.' })
  @ApiParam({ name: 'userId', description: 'User ID', type: 'string' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: 'number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: 'number' })
  @ApiQuery({ name: 'type', required: false, description: 'Conversation type', enum: ['private', 'group'] })
  async getUserConversations(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() filters: ConversationFilterDto,
  ): Promise<ApiResponseType<{
    conversations: any[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const result = await this.chatService.getUserConversations(userId, filters);
      return ResponseUtil.success(result, 'Conversaciones obtenidas exitosamente');
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  /**
   * Send message (REST endpoint)
   * POST /api/chat/messages
   */
  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a new message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiBody({ type: CreateMessageDto })
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<ApiResponseType<any>> {
    try {
      const result = await this.chatService.createMessage(createMessageDto);
      return ResponseUtil.success(result, 'Mensaje enviado exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update message status
   * PUT /api/chat/messages/:messageId/status
   */
  @Put('messages/:messageId/status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update message status (delivered, read)' })
  @ApiResponse({ status: 200, description: 'Message status updated successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiParam({ name: 'messageId', description: 'Message ID', type: 'string' })
  @ApiBody({ type: MessageStatusDto })
  async updateMessageStatus(
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() statusDto: MessageStatusDto,
  ): Promise<ApiResponseType<any>> {
    try {
      const result = await this.chatService.updateMessageStatus(messageId, statusDto);
      return ResponseUtil.success(result, 'Estado del mensaje actualizado exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Edit message
   * PUT /api/chat/messages/:messageId
   */
  @Put('messages/:messageId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit a message (only by sender within 5 minutes)' })
  @ApiResponse({ status: 200, description: 'Message edited successfully.' })
  @ApiResponse({ status: 400, description: 'Cannot edit message.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiParam({ name: 'messageId', description: 'Message ID', type: 'string' })
  @ApiBody({ type: UpdateMessageDto })
  async editMessage(
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() editDto: UpdateMessageDto & { senderId: string },
  ): Promise<ApiResponseType<any>> {
    try {
      const { senderId, ...updateData } = editDto;
      const result = await this.chatService.editMessage(messageId, senderId, updateData);
      return ResponseUtil.success(result, 'Mensaje editado exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete message
   * DELETE /api/chat/messages/:messageId
   */
  @Delete('messages/:messageId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a message (only by sender)' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Cannot delete message.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiParam({ name: 'messageId', description: 'Message ID', type: 'string' })
  @ApiQuery({ name: 'senderId', description: 'Sender ID for verification', type: 'string' })
  async deleteMessage(
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Query('senderId', ParseUUIDPipe) senderId: string,
  ): Promise<ApiResponseType<void>> {
    try {
      await this.chatService.deleteMessage(messageId, senderId);
      return ResponseUtil.success(undefined, 'Mensaje eliminado exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark conversation as read
   * POST /api/chat/mark-read
   */
  @Post('mark-read')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all messages in a conversation as read' })
  @ApiResponse({ status: 200, description: 'Conversation marked as read.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string', example: 'conv-123' },
        userId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
      },
      required: ['conversationId', 'userId'],
    },
  })
  async markConversationAsRead(
    @Body() markReadDto: { conversationId: string; userId: string },
  ): Promise<ApiResponseType<void>> {
    try {
      await this.chatService.markConversationAsRead(
        markReadDto.conversationId,
        markReadDto.userId
      );
      return ResponseUtil.success(undefined, 'Conversación marcada como leída');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get unread message count
   * GET /api/chat/users/:userId/unread-count
   */
  @Get('users/:userId/unread-count')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unread message count for a user' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully.' })
  @ApiParam({ name: 'userId', description: 'User ID', type: 'string' })
  async getUnreadMessageCount(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<ApiResponseType<number>> {
    try {
      const result = await this.chatService.getUnreadMessageCount(userId);
      return ResponseUtil.success(result, 'Conteo de mensajes no leídos obtenido exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search messages
   * GET /api/chat/search
   */
  @Get('search')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search messages by content' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully.' })
  @ApiQuery({ name: 'userId', description: 'User ID', type: 'string' })
  @ApiQuery({ name: 'q', description: 'Search term', type: 'string' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results', type: 'number' })
  async searchMessages(
    @Query('userId', ParseUUIDPipe) userId: string,
    @Query('q') searchTerm: string,
    @Query('limit') limit?: number,
  ): Promise<ApiResponseType<any[]>> {
    try {
      const result = await this.chatService.searchMessages(userId, searchTerm, limit);
      return ResponseUtil.success(result, 'Búsqueda de mensajes completada exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get message by ID
   * GET /api/chat/messages/:messageId
   */
  @Get('messages/:messageId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific message by ID' })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiParam({ name: 'messageId', description: 'Message ID', type: 'string' })
  async getMessageById(
    @Param('messageId', ParseUUIDPipe) messageId: string,
  ): Promise<ApiResponseType<any>> {
    try {
      const result = await this.chatService.getMessageById(messageId);
      return ResponseUtil.success(result, 'Mensaje obtenido exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search users by email
   * GET /api/chat/users/search
   */
  @Get('search-users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search users by email' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  @ApiQuery({ name: 'email', description: 'Email to search for', type: 'string' })
  async searchUsersByEmail(
    @Query('email') email: string
  ): Promise<ApiResponseType<User[]>> {
    try {
      const users = await this.chatService.searchUsersByEmail(email);
      return ResponseUtil.success(users, 'Users retrieved successfully');
    } catch (error) {
      console.error('Error searching users by email:', error);
      throw error;
    }
  }
}

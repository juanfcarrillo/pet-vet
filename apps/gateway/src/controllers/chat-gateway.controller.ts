import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
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
import { Observable } from 'rxjs';
import { MicroserviceHttpService } from '../services/microservice-http.service';

@ApiTags('Chat Gateway')
@Controller('chat')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChatGatewayController {
  constructor(private readonly httpService: MicroserviceHttpService) {}

  /**
   * HU07 - Get conversation messages
   * GET /chat/conversations/:conversationId/messages
   */
  @Get('conversations/:conversationId/messages')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get messages in a conversation' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully.' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID', type: 'string' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: 'number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: 'number' })
  getConversationMessages(
    @Param('conversationId') conversationId: string,
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    const params = { ...query, conversationId };
    return this.httpService.get('chat', '/api/chat/messages', params, headers);
  }

  /**
   * Get user conversations
   * GET /chat/users/:userId/conversations
   */
  @Get('users/:userId/conversations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all conversations for a user' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully.' })
  @ApiParam({ name: 'userId', description: 'User ID', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: 'number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: 'number' })
  @ApiQuery({ name: 'type', required: false, description: 'Conversation type', enum: ['private', 'group'] })
  getUserConversations(
    @Param('userId') userId: string,
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    const params = { ...query };
    return this.httpService.get('chat', `/api/chat/users/${userId}/conversations`, params, headers);
  }

  /**
   * Send message (HTTP endpoint for REST API)
   * POST /chat/messages
   */
  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a new message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        senderId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
        senderName: { type: 'string', example: 'John Doe' },
        senderRole: { type: 'string', enum: ['client', 'veterinarian'], example: 'client' },
        recipientId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174001' },
        recipientName: { type: 'string', example: 'Dr. Smith' },
        content: { type: 'string', maxLength: 500, example: 'Hello, I need to schedule an appointment for my pet.' },
        conversationId: { type: 'string', example: 'conv-123' },
        type: { type: 'string', enum: ['private', 'group'], example: 'private' },
      },
      required: ['senderId', 'senderName', 'senderRole', 'content', 'conversationId'],
    },
  })
  sendMessage(
    @Body() createMessageDto: any,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    return this.httpService.post('chat', '/api/chat/messages', createMessageDto, headers);
  }

  /**
   * Update message status
   * PUT /chat/messages/:messageId/status
   */
  @Put('messages/:messageId/status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update message status (delivered, read)' })
  @ApiResponse({ status: 200, description: 'Message status updated successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiParam({ name: 'messageId', description: 'Message ID', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['sent', 'delivered', 'read'], example: 'read' },
      },
      required: ['status'],
    },
  })
  updateMessageStatus(
    @Param('messageId') messageId: string,
    @Body() statusDto: any,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    return this.httpService.put('chat', `/api/chat/messages/${messageId}/status`, statusDto, headers);
  }

  /**
   * Edit message
   * PUT /chat/messages/:messageId
   */
  @Put('messages/:messageId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit a message (only by sender within 5 minutes)' })
  @ApiResponse({ status: 200, description: 'Message edited successfully.' })
  @ApiResponse({ status: 400, description: 'Cannot edit message.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiParam({ name: 'messageId', description: 'Message ID', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', maxLength: 500, example: 'Updated message content' },
        senderId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
      },
      required: ['content', 'senderId'],
    },
  })
  editMessage(
    @Param('messageId') messageId: string,
    @Body() editDto: any,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    return this.httpService.put('chat', `/api/chat/messages/${messageId}`, editDto, headers);
  }

  /**
   * Delete message
   * DELETE /chat/messages/:messageId
   */
  @Delete('messages/:messageId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a message (only by sender)' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Cannot delete message.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiParam({ name: 'messageId', description: 'Message ID', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'senderId', description: 'Sender ID for verification', type: 'string', format: 'uuid' })
  deleteMessage(
    @Param('messageId') messageId: string,
    @Query('senderId') senderId: string,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    const params = { senderId };
    return this.httpService.delete('chat', `/api/chat/messages/${messageId}`, headers);
  }

  /**
   * Mark conversation as read
   * POST /chat/conversations/:conversationId/mark-read
   */
  @Post('conversations/:conversationId/mark-read')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all messages in a conversation as read' })
  @ApiResponse({ status: 200, description: 'Conversation marked as read.' })
  @ApiParam({ name: 'conversationId', description: 'Conversation ID', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
      },
      required: ['userId'],
    },
  })
  markConversationAsRead(
    @Param('conversationId') conversationId: string,
    @Body() markReadDto: any,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    const data = { ...markReadDto, conversationId };
    return this.httpService.post('chat', '/api/chat/mark-read', data, headers);
  }

  /**
   * Get unread message count
   * GET /chat/users/:userId/unread-count
   */
  @Get('users/:userId/unread-count')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unread message count for a user' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully.' })
  @ApiParam({ name: 'userId', description: 'User ID', type: 'string', format: 'uuid' })
  getUnreadMessageCount(
    @Param('userId') userId: string,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    return this.httpService.get('chat', `/api/chat/users/${userId}/unread-count`, {}, headers);
  }

  /**
   * Search messages
   * GET /chat/users/:userId/search
   */
  @Get('users/:userId/search')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search messages by content' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully.' })
  @ApiParam({ name: 'userId', description: 'User ID', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'q', description: 'Search term', type: 'string' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results', type: 'number' })
  searchMessages(
    @Param('userId') userId: string,
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    const params = { ...query, userId };
    return this.httpService.get('chat', '/api/chat/search', params, headers);
  }

  /**
   * Search users by email
   * GET /chat/users/search
   */
  @Get('users/search')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search users by email' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No users found.' })
  @ApiQuery({ name: 'email', description: 'Email to search for', type: 'string' })
  searchUsersByEmail(
    @Query('email') email: string,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    const params = { email };
    return this.httpService.get('auth', '/users/search', params, headers);
  }

  /**
   * Get message by ID
   * GET /chat/messages/:messageId
   */
  @Get('messages/:messageId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific message by ID' })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiParam({ name: 'messageId', description: 'Message ID', type: 'string', format: 'uuid' })
  getMessageById(
    @Param('messageId') messageId: string,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    return this.httpService.get('chat', `/api/chat/messages/${messageId}`, {}, headers);
  }

  /**
   * Health check
   * GET /chat/health
   */
  @Get('health')
  @ApiOperation({ summary: 'Chat service health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy.' })
  healthCheck(): Observable<any> {
    return this.httpService.get('chat', '/api/health');
  }

  /**
   * WebSocket information
   * GET /chat/websocket-info
   */
  @Get('websocket-info')
  @ApiOperation({ summary: 'Get WebSocket connection information' })
  @ApiResponse({ status: 200, description: 'WebSocket info retrieved.' })
  getWebSocketInfo(): any {
    return {
      success: true,
      data: {
        websocketUrl: 'ws://localhost:3003/chat',
        namespace: '/chat',
        events: {
          client_to_server: [
            'joinRoom',
            'leaveRoom',
            'sendMessage',
            'editMessage',
            'updateMessageStatus',
            'typing',
            'markAsRead',
            'getOnlineUsers'
          ],
          server_to_client: [
            'connected',
            'joinedRoom',
            'leftRoom',
            'receiveMessage',
            'messageEdited',
            'messageStatusUpdated',
            'userJoined',
            'userLeft',
            'userTyping',
            'conversationRead',
            'onlineUsers',
            'error'
          ]
        },
        testClient: 'Available at /chat-test-client.html'
      },
      message: 'WebSocket connection information'
    };
  }

  /**
   * Create a new conversation
   * POST /chat/conversations
   */
  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        otherUserId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
      },
      required: ['otherUserId'],
    },
  })
  createConversation(
    @Body() createConversationDto: any,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    return this.httpService.post('chat', '/api/chat/conversations', createConversationDto, headers);
  }
}

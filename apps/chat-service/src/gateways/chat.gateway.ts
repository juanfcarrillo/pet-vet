import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { 
  CreateMessageDto, 
  UpdateMessageDto, 
  MessageStatusDto,
  JoinRoomDto 
} from '../dto/chat.dto';
import { MessageStatus } from '../entities/chat.entity';

interface ConnectedUser {
  userId: string;
  userName: string;
  socketId: string;
  rooms: string[];
}

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: '/chat',
})
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, ConnectedUser>();

  constructor(private readonly chatService: ChatService) {}

  /**
   * Handle client connection
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Send welcome message
    client.emit('connected', {
      message: 'Conectado al chat en tiempo real',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove user from connected users map
    for (const [userId, userData] of this.connectedUsers.entries()) {
      if (userData.socketId === client.id) {
        this.connectedUsers.delete(userId);
        
        // Notify other users in the same rooms about disconnection
        userData.rooms.forEach(room => {
          client.to(room).emit('userDisconnected', {
            userId,
            userName: userData.userName,
            timestamp: new Date().toISOString(),
          });
        });
        break;
      }
    }
  }

  /**
   * HU07 - Handle joining a conversation room
   */
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() joinRoomDto: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { room, userId, userName } = joinRoomDto;
      
      // Join the room
      await client.join(room);
      
      // Update connected users map
      const userData: ConnectedUser = {
        userId,
        userName,
        socketId: client.id,
        rooms: this.connectedUsers.get(userId)?.rooms || [],
      };
      
      if (!userData.rooms.includes(room)) {
        userData.rooms.push(room);
      }
      
      this.connectedUsers.set(userId, userData);
      
      this.logger.log(`User ${userName} (${userId}) joined room: ${room}`);
      
      // Notify user of successful room join
      client.emit('joinedRoom', {
        room,
        message: `Te has unido a la conversación`,
        timestamp: new Date().toISOString(),
      });
      
      // Notify other users in the room
      client.to(room).emit('userJoined', {
        userId,
        userName,
        room,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`);
      client.emit('error', {
        message: 'Error al unirse a la conversación',
        error: error.message,
      });
    }
  }

  /**
   * Handle leaving a conversation room
   */
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: { room: string; userId: string; userName: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { room, userId, userName } = data;
      
      // Leave the room
      await client.leave(room);
      
      // Update connected users map
      const userData = this.connectedUsers.get(userId);
      if (userData) {
        userData.rooms = userData.rooms.filter(r => r !== room);
        this.connectedUsers.set(userId, userData);
      }
      
      this.logger.log(`User ${userName} (${userId}) left room: ${room}`);
      
      // Notify user of successful room leave
      client.emit('leftRoom', {
        room,
        message: `Has salido de la conversación`,
        timestamp: new Date().toISOString(),
      });
      
      // Notify other users in the room
      client.to(room).emit('userLeft', {
        userId,
        userName,
        room,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Error leaving room: ${error.message}`);
      client.emit('error', {
        message: 'Error al salir de la conversación',
        error: error.message,
      });
    }
  }

  /**
   * HU07 - Handle sending a message
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Save message to database
      const savedMessage = await this.chatService.createMessage(createMessageDto);
      
      this.logger.log(`Message sent by ${createMessageDto.senderName} in conversation ${createMessageDto.conversationId}`);
      
      // Broadcast message to all users in the conversation room
      this.server.to(createMessageDto.conversationId).emit('receiveMessage', {
        ...savedMessage,
        timestamp: savedMessage.createdAt,
      });
      
      // Send confirmation to sender
      client.emit('messageSent', {
        messageId: savedMessage.id,
        timestamp: savedMessage.createdAt,
        status: 'sent',
      });
      
      // Update message status to delivered for online recipients
      if (createMessageDto.recipientId) {
        const recipientData = this.connectedUsers.get(createMessageDto.recipientId);
        if (recipientData && recipientData.rooms.includes(createMessageDto.conversationId)) {
          await this.chatService.updateMessageStatus(savedMessage.id, { status: MessageStatus.DELIVERED });
          
          // Notify sender about delivery
          client.emit('messageDelivered', {
            messageId: savedMessage.id,
            timestamp: new Date().toISOString(),
          });
        }
      }
      
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      client.emit('error', {
        message: 'Error al enviar mensaje',
        error: error.message,
      });
    }
  }

  /**
   * Handle message editing
   */
  @SubscribeMessage('editMessage')
  async handleEditMessage(
    @MessageBody() data: { messageId: string; senderId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { messageId, senderId, content } = data;
      
      const updatedMessage = await this.chatService.editMessage(
        messageId,
        senderId,
        { content }
      );
      
      this.logger.log(`Message ${messageId} edited by ${senderId}`);
      
      // Broadcast edit to all users in the conversation
      this.server.to(updatedMessage.conversationId).emit('messageEdited', {
        messageId: updatedMessage.id,
        content: updatedMessage.content,
        isEdited: updatedMessage.isEdited,
        editedAt: updatedMessage.editedAt,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Error editing message: ${error.message}`);
      client.emit('error', {
        message: 'Error al editar mensaje',
        error: error.message,
      });
    }
  }

  /**
   * Handle message status updates (read, delivered)
   */
  @SubscribeMessage('updateMessageStatus')
  async handleUpdateMessageStatus(
    @MessageBody() data: { messageId: string; status: MessageStatus },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { messageId, status } = data;
      
      const updatedMessage = await this.chatService.updateMessageStatus(
        messageId,
        { status }
      );
      
      // Notify sender about status change
      const senderData = this.connectedUsers.get(updatedMessage.senderId);
      if (senderData) {
        this.server.to(senderData.socketId).emit('messageStatusUpdated', {
          messageId: updatedMessage.id,
          status: updatedMessage.status,
          timestamp: new Date().toISOString(),
        });
      }
      
    } catch (error) {
      this.logger.error(`Error updating message status: ${error.message}`);
      client.emit('error', {
        message: 'Error al actualizar estado del mensaje',
        error: error.message,
      });
    }
  }

  /**
   * Handle typing indicators
   */
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { conversationId: string; userId: string; userName: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const { conversationId, userId, userName, isTyping } = data;
    
    // Broadcast typing status to other users in the conversation
    client.to(conversationId).emit('userTyping', {
      userId,
      userName,
      isTyping,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle marking conversation as read
   */
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { conversationId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { conversationId, userId } = data;
      
      await this.chatService.markConversationAsRead(conversationId, userId);
      
      // Notify other users in conversation about read status
      client.to(conversationId).emit('conversationRead', {
        conversationId,
        userId,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Error marking conversation as read: ${error.message}`);
      client.emit('error', {
        message: 'Error al marcar como leído',
        error: error.message,
      });
    }
  }

  /**
   * Get online users in a conversation
   */
  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { conversationId } = data;
    
    const onlineUsers = Array.from(this.connectedUsers.values())
      .filter(user => user.rooms.includes(conversationId))
      .map(user => ({
        userId: user.userId,
        userName: user.userName,
      }));
    
    client.emit('onlineUsers', {
      conversationId,
      users: onlineUsers,
      timestamp: new Date().toISOString(),
    });
  }
}

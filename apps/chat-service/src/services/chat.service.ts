import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { 
  CreateMessageDto, 
  UpdateMessageDto, 
  MessageStatusDto,
  ConversationFilterDto,
  MessageFilterDto
} from '../dto/chat.dto';
import { ChatMessage, MessageStatus } from '../entities/chat.entity';
import { User } from '@pet-vet/types';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatRepository: Repository<ChatMessage>,
    private readonly httpService: HttpService,
  ) {}

  /**
   * HU07 - Create a new chat message
   */
  async createMessage(createMessageDto: CreateMessageDto): Promise<ChatMessage> {
    const message = this.chatRepository.create({
      ...createMessageDto,
      status: MessageStatus.SENT,
    });

    return await this.chatRepository.save(message);
  }

  /**
   * Get messages in a conversation with pagination
   */
  async getConversationMessages(
    conversationId: string,
    filters: MessageFilterDto = { conversationId, page: 1, limit: 50 }
  ): Promise<{
    messages: ChatMessage[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 50 } = filters;

    const [messages, total] = await this.chatRepository.findAndCount({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      messages,
      total,
      page,
      limit,
    };
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(
    userId: string,
    filters: ConversationFilterDto = {}
  ): Promise<{
    conversations: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20, type } = filters;

    // Build query to get latest message from each conversation
    const queryBuilder = this.chatRepository
      .createQueryBuilder('message')
      .select([
        'message.conversationId',
        'message.content',
        'message.createdAt',
        'message.senderId',
        'message.senderName',
        'message.senderRole',
        'message.recipientId',
        'message.recipientName',
        'message.type',
        'message.status'
      ])
      .where('(message.senderId = :userId OR message.recipientId = :userId)', { userId })
      .orderBy('message.createdAt', 'DESC');

    if (type) {
      queryBuilder.andWhere('message.type = :type', { type });
    }

    // Get distinct conversations with their latest messages
    const conversations = await queryBuilder
      .distinctOn(['message.conversationId'])
      .orderBy('message.conversationId', 'ASC') // Ensure this matches DISTINCT ON
      .addOrderBy('message.createdAt', 'DESC') // Secondary ordering
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // Get total count of conversations
    const totalQuery = this.chatRepository
      .createQueryBuilder('message')
      .select('DISTINCT message.conversationId')
      .where('(message.senderId = :userId OR message.recipientId = :userId)', { userId });

    if (type) {
      totalQuery.andWhere('message.type = :type', { type });
    }

    const totalConversations = await totalQuery.getMany();
    const total = totalConversations.length;

    // Format conversations with additional info
    const formattedConversations = await Promise.all(conversations.map(async conv => {
      const isUserSender = conv.senderId === userId;
      const otherUserId = isUserSender ? conv.recipientId : conv.senderId;
      
      if (!otherUserId) {
        return null;
      }
      
      // Fetch real user data from auth service using the new user/{id} endpoint
      let otherUserData: any = null;
      try {
        const response = await lastValueFrom(
          this.httpService.get(`${process.env.AUTH_SERVICE_URL}/api/auth/users/${otherUserId}`)
        );
        
        if (response.data && response.data.data) {
          otherUserData = response.data.data;
        }
      } catch (error) {
        console.error('Error fetching user data from auth-service:', error);
      }
      
      // Use fallback data if auth service fails or user not found
      if (!otherUserData) {
        otherUserData = {
          id: otherUserId,
          fullName: isUserSender ? conv.recipientName : conv.senderName,
          email: `usuario-${otherUserId.substring(0, 8)}@pet-vet.com`,
          role: isUserSender ? 'unknown' : conv.senderRole || 'unknown'
        };
      }

      // Create the other participant object
      const otherParticipant = {
        id: otherUserData?.id || otherUserId,
        fullName: otherUserData?.fullName || (isUserSender ? conv.recipientName : conv.senderName),
        email: otherUserData?.email || `usuario-${otherUserId.substring(0, 8)}@pet-vet.com`,
        role: otherUserData?.role || (isUserSender ? 'unknown' : conv.senderRole || 'unknown')
      };

      return {
        conversationId: conv.conversationId,
        lastMessage: conv.content,
        lastMessageDate: conv.createdAt,
        type: conv.type,
        status: conv.status,
        otherParticipant: [otherParticipant], // Return as array as expected by frontend
        participants: [otherParticipant], // Also provide participants array
        unreadCount: 0, // TODO: Calculate actual unread count per conversation
      };
    }));

    return {
      conversations: formattedConversations.filter(conv => conv !== null),
      total,
      page,
      limit,
    };
  }

  /**
   * Update message status (sent, delivered, read)
   */
  async updateMessageStatus(
    messageId: string,
    statusDto: MessageStatusDto
  ): Promise<ChatMessage> {
    const message = await this.findMessageById(messageId);
    
    message.status = statusDto.status;
    return await this.chatRepository.save(message);
  }

  /**
   * Edit a message (only by sender and within time limit)
   */
  async editMessage(
    messageId: string,
    senderId: string,
    updateDto: UpdateMessageDto
  ): Promise<ChatMessage> {
    const message = await this.findMessageById(messageId);

    // Verify sender
    if (message.senderId !== senderId) {
      throw new BadRequestException('Solo el remitente puede editar el mensaje');
    }

    // Check if message is within edit time limit (e.g., 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (message.createdAt < fiveMinutesAgo) {
      throw new BadRequestException('No se puede editar mensajes después de 5 minutos');
    }

    message.content = updateDto.content;
    message.isEdited = true;
    message.editedAt = new Date();

    return await this.chatRepository.save(message);
  }

  /**
   * Delete a message (only by sender)
   */
  async deleteMessage(messageId: string, senderId: string): Promise<void> {
    const message = await this.findMessageById(messageId);

    // Verify sender
    if (message.senderId !== senderId) {
      throw new BadRequestException('Solo el remitente puede eliminar el mensaje');
    }

    await this.chatRepository.remove(message);
  }

  /**
   * Mark conversation messages as read
   */
  async markConversationAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    await this.chatRepository.update(
      {
        conversationId,
        recipientId: userId,
        status: MessageStatus.DELIVERED,
      },
      {
        status: MessageStatus.READ,
      }
    );
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadMessageCount(userId: string): Promise<number> {
    return await this.chatRepository.count({
      where: {
        recipientId: userId,
        status: MessageStatus.DELIVERED,
      },
    });
  }

  /**
   * Search messages by content
   */
  async searchMessages(
    userId: string,
    searchTerm: string,
    limit: number = 20
  ): Promise<ChatMessage[]> {
    return await this.chatRepository.find({
      where: [
        {
          senderId: userId,
          content: Like(`%${searchTerm}%`),
        },
        {
          recipientId: userId,
          content: Like(`%${searchTerm}%`),
        },
      ],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Search users by email
   */
  async searchUsersByEmail(email: string): Promise<User[]> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    try {
      const response = await lastValueFrom(
        this.httpService.get(`${process.env.AUTH_SERVICE_URL}/api/auth/users/search`, {
          params: { email },
        })
      );

      if (!response.data || !response.data.length) {
        throw new NotFoundException('No users found with the provided email');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching users from auth-service:', error);
      throw new NotFoundException('Unable to fetch users at this time');
    }
  }

  /**
   * Get single message by ID
   */
  async getMessageById(messageId: string): Promise<ChatMessage> {
    return await this.findMessageById(messageId);
  }

  /**
   * Create a new conversation
   */
  async createConversation(data: { otherUserId: string; userId: string, senderName: string, senderRole: string }): Promise<any> {
    const { otherUserId, userId, senderName, senderRole } = data;

    // Check if a conversation already exists between the two users
    const existingConversation = await this.chatRepository.findOne({
      where: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create a new conversation
    const newConversation = this.chatRepository.create({
      senderId: userId,
      recipientId: otherUserId,
      createdAt: new Date(),
      senderName,
      senderRole,
      content: '👋 Hola! ¿Cómo estás?',
      conversationId: String(new Date().getTime()),
    });

    return await this.chatRepository.save(newConversation);
  }

  /**
   * Private helper methods
   */
  private async findMessageById(messageId: string): Promise<ChatMessage> {
    const message = await this.chatRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    return message;
  }
}

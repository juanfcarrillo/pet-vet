import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from './ChatMessage';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { apiService } from '../../services/api';
import { ConversationType, MessageStatus } from '../../types/chat';
import {chatSocket as chatSocketService} from '../../services/chatSocket';
import type { 
  ChatMessage as ChatMessageType, 
  CreateMessageData, 
  OnlineUser, 
  TypingUser
} from '../../types/chat';
import type { User } from '../../types/auth';

interface ChatRoomProps {
  conversationId: string;
  currentUser: User;
  otherUser: User;
  onClose?: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  conversationId,
  currentUser,
  otherUser,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load conversation messages
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getConversationMessages(conversationId, {
        page: 1,
        limit: 50
      });
      setMessages(response.messages);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, scrollToBottom]);

  // Handle sending a new message
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const messageData: CreateMessageData = {
        conversationId,
        content: newMessage.trim(),
        type: ConversationType.PRIVATE,
      };

      // Send via API and WebSocket
      await apiService.sendMessage(messageData);
      chatSocketService.sendMessage(messageData);
      
      setNewMessage('');
      stopTyping();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  }, [newMessage, conversationId, isSending]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      chatSocketService.setTyping(
        conversationId,
        currentUser.id,
        currentUser.email,
        true
      );
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  }, [conversationId, isTyping]);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      chatSocketService.setTyping(
        conversationId,
        currentUser.id,
        currentUser.email,
        false
      );
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [conversationId, isTyping]);

  // Handle message editing
  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      await apiService.editMessage(messageId, { content: newContent });
      chatSocketService.editMessage(messageId, newContent);
    } catch (error) {
      console.error('Error editing message:', error);
    }
  }, []);

  // Handle message deletion
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await apiService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, []);

  // Mark message as read when visible
  const handleMessageRead = useCallback(async (messageId: string) => {
    try {
      if (messages.find(msg => msg.id === messageId && msg.senderId !== currentUser.id)) {
        await apiService.updateMessageStatus(messageId, 'read');
        chatSocketService.markAsRead(messageId, currentUser.id);
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, [messages, currentUser.id]);

  // Socket event handlers
  useEffect(() => {
    const handleNewMessage = (message: ChatMessageType) => {
      if (message.conversationId === conversationId) {
        setMessages(prev => [...prev, message]);
        setTimeout(scrollToBottom, 100);
        
        // Mark as read if from other user
        if (message.senderId !== currentUser.id) {
          handleMessageRead(message.id);
        }
      }
    };

    const handleMessageEdited = (messageId: string, newContent: string) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, editedAt: new Date().toISOString() }
          : msg
      ));
    };

    const handleMessageStatusUpdate = (messageId: string, status: MessageStatus) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      ));
    };

    const handleUserTyping = (data: TypingUser) => {
      if (data.conversationId === conversationId && data.userId !== currentUser.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(user => user.userId !== data.userId);
          return [...filtered, data];
        });
      }
    };

    const handleUserStoppedTyping = (data: TypingUser) => {
      if (data.conversationId === conversationId) {
        setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
      }
    };

    const handleUserOnline = (user: OnlineUser) => {
      setOnlineUsers(prev => {
        const filtered = prev.filter(u => u.userId !== user.userId);
        return [...filtered, user];
      });
    };

    const handleUserOffline = (userId: string) => {
      setOnlineUsers(prev => prev.filter(user => user.userId !== userId));
    };

    // Subscribe to socket events
    chatSocketService.on('newMessage', handleNewMessage);
    chatSocketService.on('messageEdited', handleMessageEdited);
    chatSocketService.on('messageStatusUpdate', handleMessageStatusUpdate);
    chatSocketService.on('userTyping', handleUserTyping);
    chatSocketService.on('userStoppedTyping', handleUserStoppedTyping);
    chatSocketService.on('userOnline', handleUserOnline);
    chatSocketService.on('userOffline', handleUserOffline);

    return () => {
      chatSocketService.off('newMessage', handleNewMessage);
      chatSocketService.off('messageEdited', handleMessageEdited);
      chatSocketService.off('messageStatusUpdate', handleMessageStatusUpdate);
      chatSocketService.off('userTyping', handleUserTyping);
      chatSocketService.off('userStoppedTyping', handleUserStoppedTyping);
      chatSocketService.off('userOnline', handleUserOnline);
      chatSocketService.off('userOffline', handleUserOffline);
    };
  }, [conversationId, currentUser.id, scrollToBottom, handleMessageRead]);

  // Join room and load messages on mount
  useEffect(() => {
    chatSocketService.joinRoom(conversationId);
    loadMessages();

    return () => {
      chatSocketService.leaveRoom(conversationId);
      stopTyping();
    };
  }, [conversationId, loadMessages, stopTyping]);

  // Check if other user is online
  const isOtherUserOnline = onlineUsers.some(user => user.userId === otherUser.id);

  // Get typing users (excluding current user)
  const currentTypingUsers = typingUsers.filter(user => user.userId !== currentUser.id);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {otherUser.firstName?.charAt(0) || otherUser.email.charAt(0)}
            </div>
            {isOtherUserOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {otherUser.firstName && otherUser.lastName 
                ? `${otherUser.firstName} ${otherUser.lastName}`
                : otherUser.email
              }
            </h3>
            <p className="text-sm text-gray-500">
              {isOtherUserOnline ? 'En línea' : 'Desconectado'}
            </p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No hay mensajes aún. ¡Inicia la conversación!</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUser.id}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
            />
          ))
        )}

        {/* Typing Indicator */}
        {currentTypingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>
              {currentTypingUsers.length === 1 
                ? `${otherUser.firstName || otherUser.email} está escribiendo...`
                : 'Varios usuarios están escribiendo...'
              }
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Escribe un mensaje..."
            className="flex-1"
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-6"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Enviar'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

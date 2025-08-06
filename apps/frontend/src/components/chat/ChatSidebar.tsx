import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { apiService } from '../../services/api';
import { chatSocket } from '../../services/chatSocket';
import { 
  type Conversation, 
  type OnlineUser,
  type ChatMessage 
} from '../../types/chat';
import { type User, UserRole } from '../../types/auth';

interface ChatSidebarProps {
  currentUser: User;
  selectedConversationId?: string;
  onConversationSelect: (conversation: Conversation, otherUser: User) => void;
  onNewChat?: () => void;
}

interface ConversationWithUser extends Conversation {
  otherUser: User;
  unreadCount: number;
  isOnline: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  currentUser,
  selectedConversationId,
  onConversationSelect,
  onNewChat
}) => {
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const [conversationsResponse, unreadCountResponse] = await Promise.all([
        apiService.getUserConversations(currentUser.id),
        apiService.getUnreadMessageCount(currentUser.id)
      ]);

      // Transform conversations to include other user info
      const conversationsWithUsers: ConversationWithUser[] = conversationsResponse.conversations.map(conv => {
        const otherUser = conv.otherParticipant.find(p => p.id !== currentUser.id) || conv.participants[0];
        
        // Convert the participant object to a full User object
        const fullOtherUser: User = {
          id: otherUser.id,
          email: otherUser.email || `${otherUser.id}@example.com`, // fallback email if not provided
          fullName: otherUser.fullName,
          role: otherUser.role === 'veterinarian' ? UserRole.VETERINARIAN : UserRole.CLIENT,
          isActive: true, // assume active
          createdAt: new Date().toISOString(), // fallback
          updatedAt: new Date().toISOString(), // fallback
          securityQuestion: '', // not needed for chat display
        };
        
        return {
          ...conv,
          otherUser: fullOtherUser,
          unreadCount: conv.unreadCount || 0,
          isOnline: onlineUsers.some(user => user.userId === otherUser.id)
        };
      });

      setConversations(conversationsWithUsers);
      setTotalUnreadCount(unreadCountResponse);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id, onlineUsers]);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const otherUser = conv.otherUser;
    const fullName = otherUser.fullName || '';
    return (
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      otherUser.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Format timestamp for conversation list
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? 'Ahora' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  // Handle conversation click
  const handleConversationClick = (conversation: ConversationWithUser) => {
    onConversationSelect(conversation, conversation.otherUser);
    
    // Mark conversation as read
    if (conversation.unreadCount > 0) {
      apiService.markConversationAsRead(conversation.conversationId, currentUser.id).catch(console.error);
      setConversations(prev => prev.map(conv => 
        conv.conversationId === conversation.conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    }
  };

  // Socket event handlers
  useEffect(() => {
    const handleNewMessage = (message: ChatMessage) => {
      // @ts-ignore
      setConversations(prev => prev.map(conv => {
        if (conv.conversationId === message.conversationId) {
          const isFromCurrentUser = message.senderId === currentUser.id;
          return {
            ...conv,
            lastMessage: message,
            updatedAt: message.createdAt,
            unreadCount: isFromCurrentUser ? conv.unreadCount : conv.unreadCount + 1
          };
        }
        return conv;
      }));

      // Update total unread count
      if (message.senderId !== currentUser.id) {
        setTotalUnreadCount(prev => prev + 1);
      }
    };

    const handleUserOnline = (user: OnlineUser) => {
      setOnlineUsers(prev => {
        const filtered = prev.filter(u => u.userId !== user.userId);
        return [...filtered, user];
      });

      setConversations(prev => prev.map(conv => ({
        ...conv,
        isOnline: conv.otherUser.id === user.userId ? true : conv.isOnline
      })));
    };

    const handleUserOffline = (userId: string) => {
      setOnlineUsers(prev => prev.filter(user => user.userId !== userId));
      
      setConversations(prev => prev.map(conv => ({
        ...conv,
        isOnline: conv.otherUser.id === userId ? false : conv.isOnline
      })));
    };

    const handleConversationRead = (conversationId: string) => {
      setConversations(prev => prev.map(conv => 
        conv.conversationId === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    };

    // Subscribe to socket events
    
    // @ts-ignore
    chatSocket.on('newMessage', handleNewMessage);
    // @ts-ignore
    chatSocket.on('userOnline', handleUserOnline);
    // @ts-ignore
    chatSocket.on('userOffline', handleUserOffline);
    // @ts-ignore
    chatSocket.on('conversationRead', handleConversationRead);

    return () => {
      // @ts-ignore
      chatSocket.off('newMessage', handleNewMessage);
      // @ts-ignore
      chatSocket.off('userOnline', handleUserOnline);
      // @ts-ignore
      chatSocket.off('userOffline', handleUserOffline);
      // @ts-ignore
      chatSocket.off('conversationRead', handleConversationRead);
    };
  }, [currentUser.id]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Mensajes</h2>
          {totalUnreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </span>
          )}
        </div>
        
        {/* Search Input */}
        <Input
          type="text"
          placeholder="Buscar conversaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        
        {/* New Chat Button */}
        {onNewChat && (
          <Button
            onClick={onNewChat}
            className="w-full mt-3"
            variant="outline"
          >
            + Nueva conversación
          </Button>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No se encontraron conversaciones' : 'No hay conversaciones aún'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => {
              const isSelected = conversation.conversationId === selectedConversationId;
              const otherUser = conversation.otherUser;
              const fullName = otherUser.fullName || otherUser.email;

              return (
                <div
                  key={conversation.conversationId}
                  onClick={() => handleConversationClick(conversation)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {otherUser.fullName?.charAt(0) || otherUser.email.charAt(0)}
                      </div>
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium truncate ${
                          conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {fullName}
                        </p>
                        <div className="flex items-center space-x-2">
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(conversation.lastMessageDate)}
                            </span>
                          )}
                          {conversation.unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[18px] text-center">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {conversation.lastMessage && (
                        <p className={`text-sm truncate mt-1 ${
                          conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}>
                          {conversation.lastMessage}
                        </p>
                      )}
                      
                      {!conversation.lastMessage && (
                        <p className="text-sm text-gray-400 mt-1">Nueva conversación</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { chatSocket } from '../services/chatSocket';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';
import { 
  type ChatMessage, 
  type Conversation, 
  type OnlineUser, 
  type TypingUser,
  type CreateMessageData,
  MessageStatus,
  ConversationType
} from '../types/chat';
import { ChatNotificationToast } from '../components/chat/ChatNotifications';

interface ChatContextType {
  // Connection state
  isConnected: boolean;
  
  // Messages and conversations
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: ChatMessage[];
  
  // Online users and typing
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];
  
  // Unread counts
  totalUnreadCount: number;
  
  // Actions
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  
  // Conversation management
  setActiveConversation: (conversation: Conversation | null) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  
  // Typing indicators
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  
  // Connection management
  connect: () => void;
  disconnect: () => void;

  // Expose chatSocketService for direct WebSocket operations
  getSocket: () => typeof chatSocket;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);
// @ts-ignore
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [notificationToasts, setNotificationToasts] = useState<{
    id: string;
    message: ChatMessage;
    senderName: string;
  }[]>([]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      const [conversationsResponse, unreadCountResponse] = await Promise.all([
        apiService.getUserConversations(user!.id),
        apiService.getUnreadMessageCount(user!.id)
      ]);
      
      setConversations(conversationsResponse.conversations);
      setTotalUnreadCount(unreadCountResponse);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, [user]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await apiService.getConversationMessages(conversationId, {
        page: 1,
        limit: 50,
      });
      setMessages(response.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!user) return;
    
    try {
      const messageData: CreateMessageData = {
        conversationId,
        content: content.trim(),
        type: ConversationType.PRIVATE,
        senderId: user.id,
        senderName: user.fullName,
        senderRole: user.role,
      };

      await apiService.sendMessage(messageData);
      chatSocket.sendMessage(messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [user]);

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      await apiService.editMessage(messageId, { content: newContent });
      chatSocket.editMessage(messageId, user!.id, newContent);
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await apiService.deleteMessage(messageId, user!.id);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }, []);

  // Mark message as read
  const markMessageAsRead = useCallback(async (messageId: string) => {
    if (!user) return;
    
    try {
      await apiService.updateMessageStatus(messageId, 'read');
      chatSocket.markAsRead(messageId, user!.id);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, [user]);

  // Mark conversation as read
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      await apiService.markConversationAsRead(conversationId, user!.id);
      
      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.conversationId === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
      
      // Recalculate total unread count
      const response = await apiService.getUnreadMessageCount(user!.id);
      setTotalUnreadCount(response);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }, []);

  // Typing indicators
  
  const startTyping = useCallback((conversationId: string) => {
    // chatSocket.startTyping(conversationId);
    console.log('startTyping', conversationId);
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    // chatSocket.stopTyping(conversationId);
    console.log('stopTyping', conversationId);
  }, []);

  // Connection management
  const connect = useCallback(() => {
    if (!user) return;
    chatSocket.connect();
  }, [user]);

  const disconnect = useCallback(() => {
    chatSocket.disconnect();
  }, []);

  // Get sender name for notifications
  const getSenderName = useCallback((senderId: string): string => {
    // Find sender in conversations
    for (const conv of conversations) {
      const sender = conv.participants.find(p => p.id === senderId);
      if (sender) {
        return sender.fullName || sender.email;
      }
    }
    return 'Usuario desconocido';
  }, [conversations]);

  // Socket event handlers
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      console.log('Chat connected');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('Chat disconnected');
    };

    const handleNewMessage = (message: ChatMessage) => {
      // Update messages if it's for the active conversation
      if (activeConversation && message.conversationId === activeConversation.conversationId) {
        setMessages(prev => [...prev, message]);
        
        // Auto-mark as read if from other user
        if (message.senderId !== user?.id) {
          markMessageAsRead(message.id);
        }
      }

      // Update conversations
      // @ts-ignore
      setConversations(prev => prev.map(conv => {
        if (conv.conversationId === message.conversationId) {
          const isFromCurrentUser = message.senderId === user?.id;
          return {
            ...conv,
            lastMessage: message,
            updatedAt: message.createdAt,
            unreadCount: isFromCurrentUser ? conv.unreadCount : (conv.unreadCount || 0) + 1
          };
        }
        return conv;
      }));

      // Update total unread count and show notification
      if (message.senderId !== user?.id) {
        setTotalUnreadCount(prev => prev + 1);
        
        // Show notification toast if not in active conversation
        if (!activeConversation || message.conversationId !== activeConversation.conversationId) {
          const senderName = getSenderName(message.senderId);
          const toastId = `${message.id}-${Date.now()}`;
          
          setNotificationToasts(prev => [...prev, {
            id: toastId,
            message,
            senderName
          }]);
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
      if (data.userId !== user?.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId);
          return [...filtered, data];
        });
      }
    };

    const handleUserStoppedTyping = (data: TypingUser) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    const handleUserOnline = (onlineUser: OnlineUser) => {
      setOnlineUsers(prev => {
        const filtered = prev.filter(u => u.userId !== onlineUser.userId);
        return [...filtered, onlineUser];
      });
    };

    const handleUserOffline = (userId: string) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== userId));
    };

    const handleConversationRead = (conversationId: string) => {
      setConversations(prev => prev.map(conv => 
        conv.conversationId === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    };

    // Subscribe to events
    chatSocket.on('connect', handleConnect);
    chatSocket.on('disconnect', handleDisconnect);
    // @ts-ignore
    chatSocket.on('newMessage', handleNewMessage);
    // @ts-ignore
    chatSocket.on('messageEdited', handleMessageEdited);
    // @ts-ignore
    chatSocket.on('messageStatusUpdate', handleMessageStatusUpdate);
    // @ts-ignore
    chatSocket.on('userTyping', handleUserTyping);
    // @ts-ignore
    chatSocket.on('userStoppedTyping', handleUserStoppedTyping);
    // @ts-ignore
    chatSocket.on('userOnline', handleUserOnline);
    // @ts-ignore
    chatSocket.on('userOffline', handleUserOffline);
    // @ts-ignore
    chatSocket.on('conversationRead', handleConversationRead);

    return () => {
      chatSocket.off('connect', handleConnect);
      chatSocket.off('disconnect', handleDisconnect);
      // @ts-ignore
      chatSocket.off('newMessage', handleNewMessage);
      // @ts-ignore
      chatSocket.off('messageEdited', handleMessageEdited);
      // @ts-ignore
      chatSocket.off('messageStatusUpdate', handleMessageStatusUpdate);
      // @ts-ignore
      chatSocket.off('userTyping', handleUserTyping);
      // @ts-ignore
      chatSocket.off('userStoppedTyping', handleUserStoppedTyping);
      // @ts-ignore
      chatSocket.off('userOnline', handleUserOnline);
      // @ts-ignore
      chatSocket.off('userOffline', handleUserOffline);
      // @ts-ignore
      chatSocket.off('conversationRead', handleConversationRead);
    };
  }, [user, activeConversation, markMessageAsRead, getSenderName]);

  // Auto-connect when user is available
  useEffect(() => {
    if (user && !isConnected) {
      connect();
    }
    
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [user, isConnected, connect, disconnect]);

  // Load conversations when user is available
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.conversationId);
      chatSocket.joinRoom(activeConversation.conversationId, user!.id, user!.fullName);
      
      // Mark as read when entering conversation
      if (activeConversation.unreadCount && activeConversation.unreadCount > 0) {
        markConversationAsRead(activeConversation.conversationId);
      }
    }

    return () => {
      if (activeConversation) {
        chatSocket.leaveRoom(activeConversation.conversationId, user!.id, user!.fullName);
      }
    };
  }, [activeConversation, loadMessages, markConversationAsRead]);

  // Remove notification toast
  const removeNotificationToast = useCallback((toastId: string) => {
    setNotificationToasts(prev => prev.filter(toast => toast.id !== toastId));
  }, []);

  // Handle notification toast click
  const handleNotificationClick = useCallback((conversationId: string, toastId: string) => {
    // Find and set active conversation
    const conversation = conversations.find(conv => conv.conversationId === conversationId);
    if (conversation) {
      setActiveConversation(conversation);
    }
    
    // Remove the toast
    removeNotificationToast(toastId);
  }, [conversations, removeNotificationToast]);

  // Expose chatSocketService for direct WebSocket operations
  const getSocket = () => chatSocket;

  return (
    <ChatContext.Provider
      value={{
        isConnected,
        conversations,
        activeConversation,
        messages,
        onlineUsers,
        typingUsers,
        totalUnreadCount,
        sendMessage,
        editMessage,
        deleteMessage,
        markMessageAsRead,
        markConversationAsRead,
        setActiveConversation,
        loadConversations,
        loadMessages,
        startTyping,
        stopTyping,
        connect,
        disconnect,
        getSocket, // Add this to the context
      }}
    >
      {children}
      
      {/* Notification Toasts */}
      {notificationToasts.map((toast) => (
        <ChatNotificationToast
          key={toast.id}
          message={toast.message}
          senderName={toast.senderName}
          onClose={() => removeNotificationToast(toast.id)}
          onClick={() => handleNotificationClick(toast.message.conversationId, toast.id)}
        />
      ))}
    </ChatContext.Provider>
  );
};

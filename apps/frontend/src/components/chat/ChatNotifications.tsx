import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { chatSocket } from '../../services/chatSocket';
import type { ChatMessage } from '../../types/chat';

interface ChatNotificationBadgeProps {
  userId: string;
  className?: string;
}

export const ChatNotificationBadge: React.FC<ChatNotificationBadgeProps> = ({
  userId,
  className = ''
}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Load initial unread count
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await apiService.getUnreadMessageCount(userId);
        setUnreadCount(response);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();
  }, []);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (message: ChatMessage) => {
      // Only count messages from other users
      if (message.senderId !== userId) {
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleConversationRead = () => {
      // Reload unread count when a conversation is marked as read
      apiService.getUnreadMessageCount(userId)
        .then(response => setUnreadCount(response))
        .catch(console.error);
    };

    // @ts-ignore
    chatSocket.on('newMessage', handleNewMessage);
    chatSocket.on('conversationRead', handleConversationRead);

    return () => {
      // @ts-ignore
      chatSocket.off('newMessage', handleNewMessage);
      chatSocket.off('conversationRead', handleConversationRead);
    };
  }, [userId]);

  if (unreadCount === 0) return null;

  return (
    <span className={`bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center ${className}`}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
};

interface ChatNotificationToastProps {
  message: ChatMessage;
  senderName: string;
  onClose: () => void;
  onClick: () => void;
}

export const ChatNotificationToast: React.FC<ChatNotificationToastProps> = ({
  message,
  senderName,
  onClose,
  onClick
}) => {
  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm cursor-pointer hover:shadow-xl transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
          {senderName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 truncate">
              {senderName}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {message.content}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Hace un momento
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatRoom } from './ChatRoom';
import type { Conversation } from '../../types/chat';
import type { User } from '../../types/auth';

interface ChatViewProps {
  currentUser: User;
}

export const ChatView: React.FC<ChatViewProps> = ({ currentUser }) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedOtherUser, setSelectedOtherUser] = useState<User | null>(null);

  const handleConversationSelect = (conversation: Conversation, otherUser: User) => {
    setSelectedConversation(conversation);
    setSelectedOtherUser(otherUser);
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
    setSelectedOtherUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Chat en Tiempo Real</h1>
      </div>
      
      <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Chat Sidebar */}
        <div className="w-80 flex-shrink-0">
          <ChatSidebar
            currentUser={currentUser}
            selectedConversationId={selectedConversation?.conversationId}
            onConversationSelect={handleConversationSelect}
          />
        </div>

        {/* Chat Room or Empty State */}
        <div className="flex-1 flex flex-col">
          {selectedConversation && selectedOtherUser ? (
            <ChatRoom
              conversationId={selectedConversation.conversationId}
              currentUser={currentUser}
              otherUser={selectedOtherUser}
              onClose={handleCloseChat}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona una conversación
                </h3>
                <p className="text-gray-500 max-w-sm">
                  Elige una conversación de la lista para comenzar a chatear.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

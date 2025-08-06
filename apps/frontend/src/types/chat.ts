export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read'
}

export enum ConversationType {
  PRIVATE = 'private',
  GROUP = 'group'
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId?: string;
  recipientName?: string;
  content: string;
  conversationId: string;
  type: ConversationType;
  status: MessageStatus;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageData {
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId?: string;
  recipientName?: string;
  content: string;
  conversationId: string;
  type: ConversationType;
}

export interface UpdateMessageData {
  content: string;
}

export interface MessageFilters {
  conversationId?: string;
  page?: number;
  limit?: number;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  total: number;
  page: number;
  limit: number;
}

export interface Conversation {
  conversationId: string;
  lastMessage: string;
  lastMessageDate: string;
  type: ConversationType;
  status: MessageStatus;
  otherParticipant: Array<{
    id: string;
    fullName: string;
    email: string;
    role: string;
  }>;
  participants: Array<{
    id: string;
    fullName: string;
    email: string;
    role: string;
  }>;
  unreadCount?: number;
}

export interface ConversationFilters {
  page?: number;
  limit?: number;
  type?: ConversationType;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
}

// WebSocket event types
export interface SocketEvents {
  // Client to server
  joinRoom: (data: { room: string; userId: string; userName: string }) => void;
  leaveRoom: (data: { room: string; userId: string; userName: string }) => void;
  sendMessage: (data: CreateMessageData) => void;
  editMessage: (data: { messageId: string; senderId: string; content: string }) => void;
  updateMessageStatus: (data: { messageId: string; status: MessageStatus }) => void;
  typing: (data: { conversationId: string; userId: string; userName: string; isTyping: boolean }) => void;
  markAsRead: (data: { conversationId: string; userId: string }) => void;
  getOnlineUsers: (data: { conversationId: string }) => void;

  // Server to client
  connected: (data: { message: string; clientId: string; timestamp: string }) => void;
  joinedRoom: (data: { room: string; message: string; timestamp: string }) => void;
  leftRoom: (data: { room: string; message: string; timestamp: string }) => void;
  receiveMessage: (data: ChatMessage & { timestamp: string }) => void;
  messageEdited: (data: { messageId: string; content: string; isEdited: boolean; editedAt: string; timestamp: string }) => void;
  messageStatusUpdated: (data: { messageId: string; status: MessageStatus; timestamp: string }) => void;
  messageSent: (data: { messageId: string; timestamp: string; status: string }) => void;
  messageDelivered: (data: { messageId: string; timestamp: string }) => void;
  userJoined: (data: { userId: string; userName: string; room: string; timestamp: string }) => void;
  userLeft: (data: { userId: string; userName: string; room: string; timestamp: string }) => void;
  userTyping: (data: { userId: string; userName: string; isTyping: boolean; timestamp: string }) => void;
  conversationRead: (data: { conversationId: string; userId: string; timestamp: string }) => void;
  onlineUsers: (data: { conversationId: string; users: Array<{ userId: string; userName: string }>; timestamp: string }) => void;
  error: (data: { message: string; error?: string }) => void;
}

export interface OnlineUser {
  userId: string;
  userName: string;
}

export interface TypingUser {
  userId: string;
  userName: string;
  isTyping: boolean;
}

// Frontend-specific types
export interface ChatRoomData {
  conversationId: string;
  otherParticipant: {
    id: string;
    name: string;
    role: string;
  };
  messages: ChatMessage[];
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];
}

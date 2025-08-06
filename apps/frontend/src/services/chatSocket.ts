import { io, Socket } from 'socket.io-client';
import type { SocketEvents, ChatMessage, OnlineUser, TypingUser } from '../types/chat';

class ChatSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private listeners = new Map<string, Function[]>();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    const CHAT_URL = import.meta.env.VITE_CHAT_WS_URL || 'ws://localhost:3003/chat';
    
    this.socket = io(CHAT_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.isConnected = true;
      this.emit('connected', { isConnected: true });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      this.isConnected = false;
      this.emit('connected', { isConnected: false });
    });

    // Chat events
    this.socket.on('connected', (data) => this.emit('welcome', data));
    this.socket.on('joinedRoom', (data) => this.emit('joinedRoom', data));
    this.socket.on('leftRoom', (data) => this.emit('leftRoom', data));
    this.socket.on('receiveMessage', (data) => this.emit('receiveMessage', data));
    this.socket.on('messageEdited', (data) => this.emit('messageEdited', data));
    this.socket.on('messageStatusUpdated', (data) => this.emit('messageStatusUpdated', data));
    this.socket.on('messageSent', (data) => this.emit('messageSent', data));
    this.socket.on('messageDelivered', (data) => this.emit('messageDelivered', data));
    this.socket.on('userJoined', (data) => this.emit('userJoined', data));
    this.socket.on('userLeft', (data) => this.emit('userLeft', data));
    this.socket.on('userTyping', (data) => this.emit('userTyping', data));
    this.socket.on('conversationRead', (data) => this.emit('conversationRead', data));
    this.socket.on('onlineUsers', (data) => this.emit('onlineUsers', data));
    this.socket.on('error', (data) => this.emit('error', data));
  }

  // Connection management
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      if (this.isConnected) {
        resolve();
        return;
      }

      this.socket.connect();
      
      const onConnect = () => {
        this.socket?.off('connect', onConnect);
        this.socket?.off('connect_error', onError);
        resolve();
      };

      const onError = (error: Error) => {
        this.socket?.off('connect', onConnect);
        this.socket?.off('connect_error', onError);
        reject(error);
      };

      this.socket.on('connect', onConnect);
      this.socket.on('connect_error', onError);
    });
  }

  disconnect() {
    if (this.socket && this.isConnected) {
      this.socket.disconnect();
    }
  }

  // Room management
  joinRoom(room: string, userId: string, userName: string) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('joinRoom', { room, userId, userName });
  }

  leaveRoom(room: string, userId: string, userName: string) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('leaveRoom', { room, userId, userName });
  }

  // Message operations
  sendMessage(data: {
    senderId: string;
    senderName: string;
    senderRole: string;
    recipientId?: string;
    recipientName?: string;
    content: string;
    conversationId: string;
    type: 'private' | 'group';
  }) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('sendMessage', data);
  }

  editMessage(messageId: string, senderId: string, content: string) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('editMessage', { messageId, senderId, content });
  }

  updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'read') {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('updateMessageStatus', { messageId, status });
  }

  // Typing indicators
  setTyping(conversationId: string, userId: string, userName: string, isTyping: boolean) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('typing', { conversationId, userId, userName, isTyping });
  }

  // Mark as read
  markAsRead(conversationId: string, userId: string) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('markAsRead', { conversationId, userId });
  }

  // Get online users
  getOnlineUsers(conversationId: string) {
    if (!this.socket || !this.isConnected) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('getOnlineUsers', { conversationId });
  }

  // Event listeners
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Getters
  get connected() {
    return this.isConnected;
  }
}

export const chatSocket = new ChatSocketService();
export default chatSocket;

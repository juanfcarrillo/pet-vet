
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { RegisterData, ResetPasswordData, User } from '../types/auth';
import type { 
  Appointment, 
  CreateAppointmentData, 
  UpdateAppointmentData, 
  AppointmentFilters, 
  AppointmentsResponse,
  ConfirmAppointmentData 
} from '../types/appointment';
import type {
  ChatMessage,
  CreateMessageData,
  UpdateMessageData,
  MessageFilters,
  MessagesResponse,
  ConversationFilters,
  ConversationsResponse
} from '../types/chat';


// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken();
              localStorage.setItem('accessToken', response.data.accessToken);
              return this.api(originalRequest);
            }
          } catch (error) {
            // Refresh failed, logout user
            console.error('Token refresh failed:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    const response = await this.api.post('/auth/login', credentials);
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async register(data: RegisterData) {
    const response = await this.api.post('/auth/register', data);
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async getSecurityQuestion(email: string) {
    const response = await this.api.post('/auth/security-question', { email });
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await this.api.post('/auth/refresh', { refreshToken });
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async resetPassword(data: ResetPasswordData) {
    const response = await this.api.post('/auth/reset-password', data);
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get('/auth/profile');
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  // Generic methods for other API calls
  async get<T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, { params });
    return response.data;
  }

  async post<T = unknown>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data);
    return response.data;
  }

  async put<T = unknown>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data);
    return response.data;
  }

  async delete<T = unknown>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url);
    return response.data;
  }

  // Appointments endpoints
  async getAppointments(filters?: AppointmentFilters): Promise<AppointmentsResponse> {
    const response = await this.api.get('/appointments', { params: filters });
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await this.api.get(`/appointments/${id}`);
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async getClientAppointments(clientId: string, filters?: AppointmentFilters): Promise<AppointmentsResponse> {
    const response = await this.api.get(`/appointments/client/${clientId}`, { params: filters });
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async getVeterinarianAppointments(veterinarianId: string, filters?: AppointmentFilters): Promise<AppointmentsResponse> {
    const response = await this.api.get(`/appointments/veterinarian/${veterinarianId}`, { params: filters });
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const response = await this.api.post('/appointments', data);
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async updateAppointment(id: string, data: UpdateAppointmentData): Promise<Appointment> {
    const response = await this.api.put(`/appointments/${id}`, data);
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async deleteAppointment(id: string): Promise<void> {
    await this.api.delete(`/appointments/${id}`);
  }

  async confirmAppointment(id: string, data?: ConfirmAppointmentData): Promise<Appointment> {
    const response = await this.api.post(`/appointments/${id}/confirm`, data || {});
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async getAvailableTimeSlots(veterinarianId: string, date: string): Promise<string[]> {
    const response = await this.api.get(`/appointments/available-slots/${veterinarianId}/${date}`);
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  // Chat endpoints (REST API)
  async getConversationMessages(conversationId: string, filters?: MessageFilters): Promise<MessagesResponse> {
    const response = await this.api.get(`/chat/conversations/${conversationId}/messages`, { params: filters });
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async getUserConversations(userId: string, filters?: ConversationFilters): Promise<ConversationsResponse> {
    const response = await this.api.get(`/chat/users/${userId}/conversations`, { params: filters });
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async sendMessage(data: CreateMessageData): Promise<ChatMessage> {
    const response = await this.api.post('/chat/messages', data);
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async editMessage(messageId: string, data: UpdateMessageData): Promise<ChatMessage> {
    const response = await this.api.put(`/chat/messages/${messageId}`, data);
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async deleteMessage(messageId: string, senderId: string): Promise<void> {
    await this.api.delete(`/chat/messages/${messageId}`, { params: { senderId } });
  }

  async updateMessageStatus(messageId: string, status: string): Promise<ChatMessage> {
    const response = await this.api.put(`/chat/messages/${messageId}/status`, { status });
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    await this.api.post(`/chat/conversations/${conversationId}/mark-read`, { userId });
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const response = await this.api.get(`/chat/users/${userId}/unread-count`);
    return response.data.data; // Extract data from ApiResponse wrapper
  }

  async searchMessages(userId: string, searchTerm: string, limit?: number): Promise<ChatMessage[]> {
    const response = await this.api.get(`/chat/users/${userId}/search`, { 
      params: { q: searchTerm, limit } 
    });
    return response.data.data; // Extract data from ApiResponse wrapper
  }
}

export const apiService = new ApiService();
export default apiService;

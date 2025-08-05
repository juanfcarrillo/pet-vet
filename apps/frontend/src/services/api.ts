
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { RegisterData, ResetPasswordData, User } from '../types/auth';

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
  async getAppointments(params?: Record<string, unknown>) {
    return this.get('/appointments', params);
  }

  async createAppointment(data: Record<string, unknown>) {
    return this.post('/appointments', data);
  }

  async updateAppointment(id: string, data: Record<string, unknown>) {
    return this.put(`/appointments/${id}`, data);
  }

  async deleteAppointment(id: string) {
    return this.delete(`/appointments/${id}`);
  }

  async getAvailableSlots(params: Record<string, unknown>) {
    return this.get('/appointments/available-slots', params);
  }

  // Chat endpoints (REST API)
  async getChatHistory(conversationId: string) {
    return this.get(`/chat/conversation/${conversationId}`);
  }

  async getConversations() {
    return this.get('/chat/conversations');
  }
}

export const apiService = new ApiService();
export default apiService;

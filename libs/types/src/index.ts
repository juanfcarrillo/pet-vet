// Enums compartidos
export enum UserRole {
  CLIENT = 'client',
  VETERINARIAN = 'veterinarian',
  ADMIN = 'admin',
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

// Interfaces de Usuario
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  securityQuestion: string;
  securityAnswer: string;
  role: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Interfaces de Citas
export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  ownerId: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  specialty: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  date: Date;
  time: string;
  petId: string;
  pet: Pet;
  doctorId: string;
  doctor: Doctor;
  clientId: string;
  client: User;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentDto {
  date: Date;
  time: string;
  petId: string;
  doctorId: string;
  notes?: string;
}

export interface UpdateAppointmentDto {
  date?: Date;
  time?: string;
  petId?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  notes?: string;
}

// Interfaces de Chat
export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: User;
  receiverId: string;
  receiver: User;
  status: MessageStatus;
  createdAt: Date;
}

export interface CreateMessageDto {
  content: string;
  receiverId: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  updatedAt: Date;
}

// Interfaces de respuesta de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Configuración de microservicios
export interface ServiceConfig {
  name: string;
  port: number;
  host: string;
  version: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

// Eventos para comunicación entre microservicios
export interface UserCreatedEvent {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface AppointmentCreatedEvent {
  appointmentId: string;
  clientId: string;
  doctorId: string;
  date: Date;
  time: string;
}

export interface AppointmentUpdatedEvent {
  appointmentId: string;
  status: AppointmentStatus;
  updatedBy: string;
}

export interface MessageSentEvent {
  messageId: string;
  senderId: string;
  receiverId: string;
  content: string;
}

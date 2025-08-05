import * as bcrypt from 'bcrypt';
import { ApiResponse } from '@pet-vet/types';

// Utilidades de encriptación
export class PasswordUtil {
  private static readonly saltRounds = 12;

  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// Utilidades de validación
export class ValidationUtil {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }
}

// Utilidades de respuesta de API
export class ResponseUtil {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  static error(message: string, error?: string): ApiResponse<null> {
    return {
      success: false,
      message,
      error,
    };
  }
}

// Utilidades de fecha
export class DateUtil {
  static isValidAppointmentDate(date: Date): boolean {
    const now = new Date();
    const appointmentDate = new Date(date);
    
    // No permitir citas en el pasado
    if (appointmentDate <= now) {
      return false;
    }

    // No permitir citas más de 3 meses en el futuro
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    
    return appointmentDate <= threeMonthsFromNow;
  }

  static isBusinessHour(time: string): boolean {
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    
    // Horario de atención: 8:00 AM - 6:00 PM
    const startTime = 8 * 60; // 8:00 AM
    const endTime = 18 * 60;  // 6:00 PM
    
    return timeInMinutes >= startTime && timeInMinutes <= endTime;
  }

  static formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  static formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  }
}

// Utilidades de cadenas
export class StringUtil {
  static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}

// Constantes del sistema
export const SYSTEM_CONSTANTS = {
  // Límites
  MAX_MESSAGE_LENGTH: 500,
  MAX_APPOINTMENT_NOTES_LENGTH: 1000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Tiempos
  JWT_EXPIRES_IN: '1h',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  
  // Configuración de base de datos
  DB_CONNECTION_TIMEOUT: 30000,
  DB_QUERY_TIMEOUT: 10000,
  
  // Configuración de Redis
  REDIS_TTL: 3600, // 1 hora
  
  // Configuración de chat
  CHAT_ROOM_PREFIX: 'chat:',
  NOTIFICATION_PREFIX: 'notification:',
  
  // Estados por defecto
  DEFAULT_PAGINATION_LIMIT: 20,
  MAX_PAGINATION_LIMIT: 100,
};

// Decorador para logging
export function LogExecutionTime(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const start = Date.now();
    try {
      const result = await method.apply(this, args);
      const executionTime = Date.now() - start;
      console.log(`${target.constructor.name}.${propertyName} ejecutado en ${executionTime}ms`);
      return result;
    } catch (error) {
      const executionTime = Date.now() - start;
      console.error(`${target.constructor.name}.${propertyName} falló después de ${executionTime}ms:`, error);
      throw error;
    }
  };
}

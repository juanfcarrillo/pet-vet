export enum AppointmentStatus {
  SCHEDULED = 'Programada',
  CONFIRMED = 'Confirmada',
  IN_PROGRESS = 'En progreso',
  COMPLETED = 'Completada',
  CANCELLED = 'Cancelada'
}

export enum AppointmentType {
  CONSULTATION = 'Consulta',
  VACCINATION = 'Vacunación',
  SURGERY = 'Cirugía',
  EMERGENCY = 'Emergencia',
  CHECKUP = 'Revisión'
}

export interface Appointment {
  id: string;
  clientId: string;
  veterinarianId: string;
  petName: string;
  petSpecies: string;
  petBreed?: string;
  petAge: number;
  appointmentDate: string; // ISO string format
  type: AppointmentType;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  veterinarianName: string;
  cost?: number;
  isEmergency: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  clientId: string;
  veterinarianId: string;
  petName: string;
  petSpecies: string;
  petBreed?: string;
  petAge: number;
  appointmentDate: string; // ISO string format
  type: AppointmentType;
  reason?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  veterinarianName: string;
  cost?: number;
  isEmergency?: boolean;
}

export interface UpdateAppointmentData {
  petName?: string;
  petSpecies?: string;
  petBreed?: string;
  petAge?: number;
  appointmentDate?: string; // ISO string format
  type?: AppointmentType;
  status?: AppointmentStatus;
  reason?: string;
  notes?: string;
  clientPhone?: string;
  cost?: number;
  isEmergency?: boolean;
}

export interface AppointmentFilters {
  page?: number;
  limit?: number;
  clientId?: string;
  veterinarianId?: string;
  status?: AppointmentStatus;
  startDate?: string; // ISO string format
  endDate?: string; // ISO string format
}

export interface AppointmentsResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  limit: number;
}

export interface ConfirmAppointmentData {
  notes?: string;
}

// Frontend-specific types
export interface AppointmentFormData {
  veterinarianId: string;
  petName: string;
  petSpecies: string;
  petBreed?: string;
  petAge: number;
  appointmentDate: string;
  appointmentTime: string;
  type: AppointmentType;
  reason?: string;
  clientPhone?: string;
  isEmergency?: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface VeterinarianOption {
  id: string;
  name: string;
  specialization?: string;
}

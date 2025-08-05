import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';

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

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'client_id' })
  clientId: string;

  @Column({ type: 'uuid', name: 'veterinarian_id' })
  veterinarianId: string;

  @Column({ type: 'varchar', length: 100, name: 'pet_name' })
  petName: string;

  @Column({ type: 'varchar', length: 50, name: 'pet_species' })
  petSpecies: string;

  @Column({ type: 'varchar', length: 50, name: 'pet_breed', nullable: true })
  petBreed?: string;

  @Column({ type: 'int', name: 'pet_age' })
  petAge: number;

  @Column({ type: 'timestamp', name: 'appointment_date' })
  appointmentDate: Date;

  @Column({ 
    type: 'enum', 
    enum: AppointmentType,
    default: AppointmentType.CONSULTATION
  })
  type: AppointmentType;

  @Column({ 
    type: 'enum', 
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 100, name: 'client_name' })
  clientName: string;

  @Column({ type: 'varchar', length: 100, name: 'client_email' })
  clientEmail: string;

  @Column({ type: 'varchar', length: 20, name: 'client_phone', nullable: true })
  clientPhone?: string;

  @Column({ type: 'varchar', length: 100, name: 'veterinarian_name' })
  veterinarianName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number;

  @Column({ type: 'boolean', default: false, name: 'is_emergency' })
  isEmergency: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

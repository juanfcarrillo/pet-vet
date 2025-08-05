import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ConflictException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, Not } from 'typeorm';
import { 
  CreateAppointmentDto, 
  UpdateAppointmentDto, 
  AppointmentFilterDto,
  ConfirmAppointmentDto,
  AvailableTimeSlotsDto
} from '../dto/appointment.dto';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  /**
   * HU03 - Agendar cita
   * Creates a new appointment
   */
  async createAppointment(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const appointmentDate = new Date(createAppointmentDto.appointmentDate);
    
    // Validate appointment date is in the future
    if (appointmentDate <= new Date()) {
      throw new BadRequestException('La fecha de la cita debe ser en el futuro');
    }

    // Check if the time slot is available
    const isAvailable = await this.isTimeSlotAvailable(
      createAppointmentDto.veterinarianId,
      appointmentDate
    );

    if (!isAvailable) {
      throw new ConflictException('El horario seleccionado no está disponible');
    }

    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      appointmentDate,
      status: AppointmentStatus.SCHEDULED,
    });

    return await this.appointmentRepository.save(appointment);
  }

  /**
   * HU04 - Editar cita
   * Updates an existing appointment (only if status is SCHEDULED)
   */
  async updateAppointment(
    id: string, 
    updateAppointmentDto: UpdateAppointmentDto
  ): Promise<Appointment> {
    const appointment = await this.findAppointmentById(id);

    // Only allow editing scheduled appointments
    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException('Solo se pueden editar citas con estado "Programada"');
    }

    // If updating appointment date, validate it's in the future and available
    if (updateAppointmentDto.appointmentDate) {
      const newDate = new Date(updateAppointmentDto.appointmentDate);
      
      if (newDate <= new Date()) {
        throw new BadRequestException('La fecha de la cita debe ser en el futuro');
      }

      // Check if new time slot is available (excluding current appointment)
      const isAvailable = await this.isTimeSlotAvailable(
        appointment.veterinarianId,
        newDate,
        id
      );

      if (!isAvailable) {
        throw new ConflictException('El nuevo horario seleccionado no está disponible');
      }

      updateAppointmentDto.appointmentDate = newDate.toISOString();
    }

    Object.assign(appointment, updateAppointmentDto);
    return await this.appointmentRepository.save(appointment);
  }

  /**
   * HU05 - Eliminar cita
   * Deletes an appointment
   */
  async deleteAppointment(id: string): Promise<void> {
    const appointment = await this.findAppointmentById(id);
    await this.appointmentRepository.remove(appointment);
  }

  /**
   * HU06 - Ver citas (Cliente)
   * Gets appointments for a specific client
   */
  async getClientAppointments(
    clientId: string, 
    filters: AppointmentFilterDto = {}
  ): Promise<{ appointments: Appointment[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, startDate, endDate } = filters;
    
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.clientId = :clientId', { clientId })
      .orderBy('appointment.appointmentDate', 'ASC');

    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('appointment.appointmentDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    const [appointments, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      appointments,
      total,
      page,
      limit,
    };
  }

  /**
   * HU08 - Ver citas (Veterinario)
   * Gets appointments for a specific veterinarian
   */
  async getVeterinarianAppointments(
    veterinarianId: string, 
    filters: AppointmentFilterDto = {}
  ): Promise<{ appointments: Appointment[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, startDate, endDate } = filters;
    
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.veterinarianId = :veterinarianId', { veterinarianId })
      .orderBy('appointment.appointmentDate', 'ASC');

    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('appointment.appointmentDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    const [appointments, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      appointments,
      total,
      page,
      limit,
    };
  }

  /**
   * Confirms an appointment
   */
  async confirmAppointment(
    id: string, 
    confirmDto: ConfirmAppointmentDto = {}
  ): Promise<Appointment> {
    const appointment = await this.findAppointmentById(id);

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException('Solo se pueden confirmar citas con estado "Programada"');
    }

    appointment.status = AppointmentStatus.CONFIRMED;
    if (confirmDto.notes) {
      appointment.notes = confirmDto.notes;
    }

    return await this.appointmentRepository.save(appointment);
  }

  /**
   * Gets available time slots for a veterinarian on a specific date
   */
  async getAvailableTimeSlots(
    veterinarianId: string, 
    date: string
  ): Promise<string[]> {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(8, 0, 0, 0); // Start at 8:00 AM
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(18, 0, 0, 0); // End at 6:00 PM

    // Get existing appointments for the day
    const existingAppointments = await this.appointmentRepository.find({
      where: {
        veterinarianId,
        appointmentDate: Between(startOfDay, endOfDay),
        status: Not(AppointmentStatus.CANCELLED),
      },
    });

    // Generate all possible time slots (every 30 minutes)
    const allSlots: string[] = [];
    const current = new Date(startOfDay);
    
    while (current < endOfDay) {
      allSlots.push(current.toTimeString().substring(0, 5)); // HH:MM format
      current.setMinutes(current.getMinutes() + 30);
    }

    // Filter out occupied slots
    const occupiedSlots = existingAppointments.map(appointment => 
      appointment.appointmentDate.toTimeString().substring(0, 5)
    );

    return allSlots.filter(slot => !occupiedSlots.includes(slot));
  }

  /**
   * Gets a single appointment by ID
   */
  async getAppointmentById(id: string): Promise<Appointment> {
    return await this.findAppointmentById(id);
  }

  /**
   * Gets all appointments with filters
   */
  async getAllAppointments(
    filters: AppointmentFilterDto = {}
  ): Promise<{ appointments: Appointment[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, startDate, endDate, clientId, veterinarianId } = filters;
    
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .orderBy('appointment.appointmentDate', 'ASC');

    if (clientId) {
      queryBuilder.andWhere('appointment.clientId = :clientId', { clientId });
    }

    if (veterinarianId) {
      queryBuilder.andWhere('appointment.veterinarianId = :veterinarianId', { veterinarianId });
    }

    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('appointment.appointmentDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    const [appointments, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      appointments,
      total,
      page,
      limit,
    };
  }

  /**
   * Private helper methods
   */
  private async findAppointmentById(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    return appointment;
  }

  private async isTimeSlotAvailable(
    veterinarianId: string,
    appointmentDate: Date,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.veterinarianId = :veterinarianId', { veterinarianId })
      .andWhere('appointment.appointmentDate = :appointmentDate', { appointmentDate })
      .andWhere('appointment.status != :cancelledStatus', { 
        cancelledStatus: AppointmentStatus.CANCELLED 
      });

    if (excludeAppointmentId) {
      queryBuilder.andWhere('appointment.id != :excludeId', { excludeId: excludeAppointmentId });
    }

    const existingAppointment = await queryBuilder.getOne();
    return !existingAppointment;
  }
}

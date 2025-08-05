import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AppointmentService } from '../services/appointment.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentFilterDto,
  ConfirmAppointmentDto,
  AvailableTimeSlotsDto,
} from '../dto/appointment.dto';
import { Appointment } from '../entities/appointment.entity';
import { ResponseUtil } from '@pet-vet/common';
import { ApiResponse } from '@pet-vet/types';

@ApiTags('Appointments')
@Controller('appointments')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  /**
   * HU03 - Agendar cita
   * POST /appointments
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new appointment' })
  @SwaggerApiResponse({ status: 201, description: 'Appointment successfully created.' })
  @SwaggerApiResponse({ status: 400, description: 'Invalid input data.' })
  @SwaggerApiResponse({ status: 409, description: 'Time slot not available.' })
  @ApiBody({ type: CreateAppointmentDto })
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<ApiResponse<Appointment>> {
    try {
      const appointment = await this.appointmentService.createAppointment(createAppointmentDto);
      return ResponseUtil.success(appointment, 'Cita agendada exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * HU04 - Editar cita
   * PUT /appointments/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing appointment' })
  @SwaggerApiResponse({ status: 200, description: 'Appointment successfully updated.' })
  @SwaggerApiResponse({ status: 400, description: 'Invalid input data or appointment cannot be edited.' })
  @SwaggerApiResponse({ status: 404, description: 'Appointment not found.' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiBody({ type: UpdateAppointmentDto })
  async updateAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<ApiResponse<Appointment>> {
    try {
      const appointment = await this.appointmentService.updateAppointment(id, updateAppointmentDto);
      return ResponseUtil.success(appointment, 'Cita actualizada exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * HU05 - Eliminar cita
   * DELETE /appointments/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an appointment' })
  @SwaggerApiResponse({ status: 200, description: 'Appointment successfully deleted.' })
  @SwaggerApiResponse({ status: 404, description: 'Appointment not found.' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async deleteAppointment(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<null>> {
    try {
      await this.appointmentService.deleteAppointment(id);
      return ResponseUtil.success(null, 'Cita eliminada exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get single appointment by ID
   * GET /appointments/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @SwaggerApiResponse({ status: 200, description: 'Appointment found.' })
  @SwaggerApiResponse({ status: 404, description: 'Appointment not found.' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async getAppointmentById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<Appointment>> {
    try {
      const appointment = await this.appointmentService.getAppointmentById(id);
      return ResponseUtil.success(appointment, 'Cita encontrada');
    } catch (error) {
      throw error;
    }
  }

  /**
   * HU06 - Ver citas (Cliente)
   * GET /appointments/client/:clientId
   */
  @Get('client/:clientId')
  @ApiOperation({ summary: 'Get appointments for a specific client' })
  @SwaggerApiResponse({ status: 200, description: 'Client appointments retrieved.' })
  @ApiParam({ name: 'clientId', description: 'Client ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter' })
  async getClientAppointments(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query() filters: AppointmentFilterDto,
  ): Promise<ApiResponse<{
    appointments: Appointment[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const result = await this.appointmentService.getClientAppointments(clientId, filters);
      return ResponseUtil.success(result, 'Citas del cliente obtenidas exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * HU08 - Ver citas (Veterinario)
   * GET /appointments/veterinarian/:veterinarianId
   */
  @Get('veterinarian/:veterinarianId')
  @ApiOperation({ summary: 'Get appointments for a specific veterinarian' })
  @SwaggerApiResponse({ status: 200, description: 'Veterinarian appointments retrieved.' })
  @ApiParam({ name: 'veterinarianId', description: 'Veterinarian ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter' })
  async getVeterinarianAppointments(
    @Param('veterinarianId', ParseUUIDPipe) veterinarianId: string,
    @Query() filters: AppointmentFilterDto,
  ): Promise<ApiResponse<{
    appointments: Appointment[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const result = await this.appointmentService.getVeterinarianAppointments(veterinarianId, filters);
      return ResponseUtil.success(result, 'Citas del veterinario obtenidas exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Confirm appointment
   * POST /appointments/:id/confirm
   */
  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm an appointment' })
  @SwaggerApiResponse({ status: 200, description: 'Appointment confirmed.' })
  @SwaggerApiResponse({ status: 400, description: 'Appointment cannot be confirmed.' })
  @SwaggerApiResponse({ status: 404, description: 'Appointment not found.' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiBody({ type: ConfirmAppointmentDto, required: false })
  async confirmAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() confirmDto: ConfirmAppointmentDto = {},
  ): Promise<ApiResponse<Appointment>> {
    try {
      const appointment = await this.appointmentService.confirmAppointment(id, confirmDto);
      return ResponseUtil.success(appointment, 'Cita confirmada exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available time slots
   * GET /appointments/available-slots/:veterinarianId/:date
   */
  @Get('available-slots/:veterinarianId/:date')
  @ApiOperation({ summary: 'Get available time slots for a veterinarian on a specific date' })
  @SwaggerApiResponse({ status: 200, description: 'Available time slots retrieved.' })
  @ApiParam({ name: 'veterinarianId', description: 'Veterinarian ID' })
  @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format' })
  async getAvailableTimeSlots(
    @Param('veterinarianId', ParseUUIDPipe) veterinarianId: string,
    @Param('date') date: string,
  ): Promise<ApiResponse<string[]>> {
    try {
      const availableSlots = await this.appointmentService.getAvailableTimeSlots(veterinarianId, date);
      return ResponseUtil.success(availableSlots, 'Horarios disponibles obtenidos exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all appointments with filters
   * GET /appointments
   */
  @Get()
  @ApiOperation({ summary: 'Get all appointments with optional filters' })
  @SwaggerApiResponse({ status: 200, description: 'Appointments retrieved.' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'clientId', required: false, description: 'Filter by client ID' })
  @ApiQuery({ name: 'veterinarianId', required: false, description: 'Filter by veterinarian ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter' })
  async getAllAppointments(
    @Query() filters: AppointmentFilterDto,
  ): Promise<ApiResponse<{
    appointments: Appointment[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const result = await this.appointmentService.getAllAppointments(filters);
      return ResponseUtil.success(result, 'Citas obtenidas exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Health check endpoint
   * GET /appointments/health
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check for appointment service' })
  @SwaggerApiResponse({ status: 200, description: 'Service is healthy.' })
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return ResponseUtil.success(
      {
        status: 'OK',
        timestamp: new Date().toISOString(),
      },
      'Appointment Service is healthy',
    );
  }
}

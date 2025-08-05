import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { MicroserviceHttpService } from '../services/microservice-http.service';

@ApiTags('Appointments Gateway')
@Controller('appointments')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AppointmentsGatewayController {
  constructor(private readonly httpService: MicroserviceHttpService) {}

  /**
   * HU03 - Create appointment
   * POST /appointments
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Time slot not available.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        clientId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
        veterinarianId: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174001' },
        petName: { type: 'string', example: 'Fluffy' },
        petSpecies: { type: 'string', example: 'Dog' },
        petBreed: { type: 'string', example: 'Golden Retriever' },
        petAge: { type: 'number', example: 3 },
        appointmentDate: { type: 'string', format: 'date-time', example: '2025-08-10T10:00:00.000Z' },
        type: { type: 'string', enum: ['Consulta', 'Vacunación', 'Cirugía', 'Emergencia', 'Revisión'], example: 'Consulta' },
        reason: { type: 'string', example: 'Routine checkup' },
        clientName: { type: 'string', example: 'John Doe' },
        clientEmail: { type: 'string', example: 'john.doe@example.com' },
        clientPhone: { type: 'string', example: '+1234567890' },
        veterinarianName: { type: 'string', example: 'Dr. Smith' },
        cost: { type: 'number', example: 50.00 },
        isEmergency: { type: 'boolean', example: false },
      },
      required: ['clientId', 'veterinarianId', 'petName', 'petSpecies', 'petAge', 'appointmentDate', 'clientName', 'clientEmail', 'veterinarianName'],
    },
  })
  createAppointment(
    @Body() createAppointmentDto: any,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    return this.httpService.post('appointments', '/api/appointments', createAppointmentDto, headers);
  }

  /**
   * HU04 - Update appointment
   * PUT /appointments/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing appointment' })
  @ApiResponse({ status: 200, description: 'Appointment successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input data or appointment cannot be edited.' })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  @ApiParam({ name: 'id', description: 'Appointment ID', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        petName: { type: 'string', example: 'Fluffy' },
        petSpecies: { type: 'string', example: 'Dog' },
        petBreed: { type: 'string', example: 'Golden Retriever' },
        petAge: { type: 'number', example: 3 },
        appointmentDate: { type: 'string', format: 'date-time', example: '2025-08-10T10:00:00.000Z' },
        type: { type: 'string', enum: ['Consulta', 'Vacunación', 'Cirugía', 'Emergencia', 'Revisión'] },
        status: { type: 'string', enum: ['Programada', 'Confirmada', 'En progreso', 'Completada', 'Cancelada'] },
        reason: { type: 'string', example: 'Routine checkup' },
        notes: { type: 'string', example: 'Patient is healthy' },
        clientPhone: { type: 'string', example: '+1234567890' },
        cost: { type: 'number', example: 50.00 },
        isEmergency: { type: 'boolean', example: false },
      },
    },
  })
  updateAppointment(
    @Param('id') id: string,
    @Body() updateAppointmentDto: any,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    return this.httpService.put('appointments', `/api/appointments/${id}`, updateAppointmentDto, headers);
  }

  /**
   * HU05 - Delete appointment
   * DELETE /appointments/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  @ApiParam({ name: 'id', description: 'Appointment ID', type: 'string', format: 'uuid' })
  deleteAppointment(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    return this.httpService.delete('appointments', `/api/appointments/${id}`, headers);
  }

  /**
   * Get appointment by ID
   * GET /appointments/:id
   */
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment found.' })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  @ApiParam({ name: 'id', description: 'Appointment ID', type: 'string', format: 'uuid' })
  getAppointmentById(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    return this.httpService.get('appointments', `/api/appointments/${id}`, {}, headers);
  }

  /**
   * HU06 - Get client appointments
   * GET /appointments/client/:clientId
   */
  @Get('client/:clientId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get appointments for a specific client' })
  @ApiResponse({ status: 200, description: 'Client appointments retrieved.' })
  @ApiParam({ name: 'clientId', description: 'Client ID', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: 'number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: 'number' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status', type: 'string' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter', type: 'string' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter', type: 'string' })
  getClientAppointments(
    @Param('clientId') clientId: string,
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    return this.httpService.get('appointments', `/api/appointments/client/${clientId}`, query, headers);
  }

  /**
   * HU08 - Get veterinarian appointments
   * GET /appointments/veterinarian/:veterinarianId
   */
  @Get('veterinarian/:veterinarianId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get appointments for a specific veterinarian' })
  @ApiResponse({ status: 200, description: 'Veterinarian appointments retrieved.' })
  @ApiParam({ name: 'veterinarianId', description: 'Veterinarian ID', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: 'number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: 'number' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status', type: 'string' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter', type: 'string' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter', type: 'string' })
  getVeterinarianAppointments(
    @Param('veterinarianId') veterinarianId: string,
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    return this.httpService.get('appointments', `/api/appointments/veterinarian/${veterinarianId}`, query, headers);
  }

  /**
   * Confirm appointment
   * POST /appointments/:id/confirm
   */
  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment confirmed.' })
  @ApiResponse({ status: 400, description: 'Appointment cannot be confirmed.' })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  @ApiParam({ name: 'id', description: 'Appointment ID', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        notes: { type: 'string', example: 'Appointment confirmed by veterinarian' },
      },
    },
  })
  confirmAppointment(
    @Param('id') id: string,
    @Body() confirmDto: any,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    return this.httpService.post('appointments', `/api/appointments/${id}/confirm`, confirmDto, headers);
  }

  /**
   * Get available time slots
   * GET /appointments/available-slots/:veterinarianId/:date
   */
  @Get('available-slots/:veterinarianId/:date')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available time slots for a veterinarian on a specific date' })
  @ApiResponse({ status: 200, description: 'Available time slots retrieved.' })
  @ApiParam({ name: 'veterinarianId', description: 'Veterinarian ID', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format', type: 'string' })
  getAvailableTimeSlots(
    @Param('veterinarianId') veterinarianId: string,
    @Param('date') date: string,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    return this.httpService.get('appointments', `/api/appointments/available-slots/${veterinarianId}/${date}`, {}, headers);
  }

  /**
   * Get all appointments with filters
   * GET /appointments
   */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all appointments with optional filters' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved.' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: 'number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: 'number' })
  @ApiQuery({ name: 'clientId', required: false, description: 'Filter by client ID', type: 'string' })
  @ApiQuery({ name: 'veterinarianId', required: false, description: 'Filter by veterinarian ID', type: 'string' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status', type: 'string' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter', type: 'string' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter', type: 'string' })
  getAllAppointments(
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    return this.httpService.get('appointments', '/api/appointments', query, headers);
  }

  /**
   * Health check
   * GET /appointments/health
   */
  @Get('health')
  @ApiOperation({ summary: 'Appointments service health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy.' })
  healthCheck(): Observable<any> {
    return this.httpService.get('appointments', '/api/appointments/health');
  }
}

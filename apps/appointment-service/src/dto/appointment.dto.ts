import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsEnum, 
  IsDateString, 
  IsNumber, 
  IsBoolean, 
  IsUUID,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsPhoneNumber
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus, AppointmentType } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Client ID (UUID)' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ description: 'Veterinarian ID (UUID)' })
  @IsUUID()
  veterinarianId: string;

  @ApiProperty({ description: 'Pet name', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  petName: string;

  @ApiProperty({ description: 'Pet species', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  petSpecies: string;

  @ApiPropertyOptional({ description: 'Pet breed', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  petBreed?: string;

  @ApiProperty({ description: 'Pet age in years', minimum: 0, maximum: 50 })
  @IsNumber()
  @Min(0)
  @Max(50)
  petAge: number;

  @ApiProperty({ description: 'Appointment date and time in ISO format' })
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({ 
    description: 'Appointment type',
    enum: AppointmentType,
    default: AppointmentType.CONSULTATION
  })
  @IsEnum(AppointmentType)
  type: AppointmentType;

  @ApiPropertyOptional({ description: 'Reason for appointment' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiProperty({ description: 'Client full name', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  clientName: string;

  @ApiProperty({ description: 'Client email address' })
  @IsEmail()
  clientEmail: string;

  @ApiPropertyOptional({ description: 'Client phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  clientPhone?: string;

  @ApiProperty({ description: 'Veterinarian name', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  veterinarianName: string;

  @ApiPropertyOptional({ description: 'Appointment cost' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ description: 'Is emergency appointment', default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isEmergency?: boolean;
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional({ description: 'Pet name', minLength: 2, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  petName?: string;

  @ApiPropertyOptional({ description: 'Pet species', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  petSpecies?: string;

  @ApiPropertyOptional({ description: 'Pet breed', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  petBreed?: string;

  @ApiPropertyOptional({ description: 'Pet age in years', minimum: 0, maximum: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  petAge?: number;

  @ApiPropertyOptional({ description: 'Appointment date and time in ISO format' })
  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @ApiPropertyOptional({ 
    description: 'Appointment type',
    enum: AppointmentType
  })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @ApiPropertyOptional({ 
    description: 'Appointment status',
    enum: AppointmentStatus
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ description: 'Reason for appointment' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({ description: 'Appointment notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: 'Client phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  clientPhone?: string;

  @ApiPropertyOptional({ description: 'Appointment cost' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ description: 'Is emergency appointment' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isEmergency?: boolean;
}

export class AppointmentFilterDto {
  @ApiPropertyOptional({ description: 'Client ID to filter by' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Veterinarian ID to filter by' })
  @IsOptional()
  @IsUUID()
  veterinarianId?: string;

  @ApiPropertyOptional({ 
    description: 'Appointment status to filter by',
    enum: AppointmentStatus
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ description: 'Start date for filtering (ISO format)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for filtering (ISO format)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class ConfirmAppointmentDto {
  @ApiPropertyOptional({ description: 'Additional notes for confirmation' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class AvailableTimeSlotsDto {
  @ApiProperty({ description: 'Veterinarian ID' })
  @IsUUID()
  veterinarianId: string;

  @ApiProperty({ description: 'Date to check availability (YYYY-MM-DD)' })
  @IsDateString()
  date: string;
}

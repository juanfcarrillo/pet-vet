import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { Appointment, AppointmentStatus, AppointmentType } from '../entities/appointment.entity';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../dto/appointment.dto';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let repository: Repository<Appointment>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAppointment: Appointment = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    clientId: '123e4567-e89b-12d3-a456-426614174001',
    veterinarianId: '123e4567-e89b-12d3-a456-426614174002',
    petName: 'Fluffy',
    petSpecies: 'Cat',
    petBreed: 'Persian',
    petAge: 3,
    appointmentDate: new Date('2024-12-25T10:00:00Z'),
    type: AppointmentType.CONSULTATION,
    status: AppointmentStatus.SCHEDULED,
    reason: 'Regular checkup',
    notes: "I'm feeling sick",
    clientName: 'John Doe',
    clientEmail: 'john.doe@example.com',
    clientPhone: '+1234567890',
    veterinarianName: 'Dr. Smith',
    cost: 50.00,
    isEmergency: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    repository = module.get<Repository<Appointment>>(getRepositoryToken(Appointment));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAppointment', () => {
    const createAppointmentDto: CreateAppointmentDto = {
      clientId: '123e4567-e89b-12d3-a456-426614174001',
      veterinarianId: '123e4567-e89b-12d3-a456-426614174002',
      petName: 'Fluffy',
      petSpecies: 'Cat',
      petBreed: 'Persian',
      petAge: 3,
      appointmentDate: '2024-12-25T10:00:00Z',
      type: AppointmentType.CONSULTATION,
      reason: 'Regular checkup',
      clientName: 'John Doe',
      clientEmail: 'john.doe@example.com',
      clientPhone: '+1234567890',
      veterinarianName: 'Dr. Smith',
      cost: 50.00,
      isEmergency: false,
    };

    it('should create an appointment successfully', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.create.mockReturnValue(mockAppointment);
      mockRepository.save.mockResolvedValue(mockAppointment);

      const result = await service.createAppointment(createAppointmentDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createAppointmentDto,
        appointmentDate: new Date(createAppointmentDto.appointmentDate),
        status: AppointmentStatus.SCHEDULED,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockAppointment);
      expect(result).toEqual(mockAppointment);
    });

    it('should throw BadRequestException for past appointment date', async () => {
      const pastDate = '2020-01-01T10:00:00Z';
      const dto = { ...createAppointmentDto, appointmentDate: pastDate };

      await expect(service.createAppointment(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException for unavailable time slot', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockAppointment),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.createAppointment(createAppointmentDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateAppointment', () => {
    const updateDto: UpdateAppointmentDto = {
      petName: 'Updated Fluffy',
      reason: 'Updated reason',
    };

    it('should update an appointment successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockAppointment);
      const updatedAppointment = { ...mockAppointment, ...updateDto };
      mockRepository.save.mockResolvedValue(updatedAppointment);

      const result = await service.updateAppointment(mockAppointment.id, updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAppointment.id },
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.petName).toBe(updateDto.petName);
      expect(result.reason).toBe(updateDto.reason);
    });

    it('should throw NotFoundException for non-existent appointment', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateAppointment('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for non-scheduled appointment', async () => {
      const confirmedAppointment = { ...mockAppointment, status: AppointmentStatus.CONFIRMED };
      mockRepository.findOne.mockResolvedValue(confirmedAppointment);

      await expect(service.updateAppointment(mockAppointment.id, updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteAppointment', () => {
    it('should delete an appointment successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockAppointment);
      mockRepository.remove.mockResolvedValue(mockAppointment);

      await service.deleteAppointment(mockAppointment.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAppointment.id },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockAppointment);
    });

    it('should throw NotFoundException for non-existent appointment', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteAppointment('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAppointmentById', () => {
    it('should return an appointment by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockAppointment);

      const result = await service.getAppointmentById(mockAppointment.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAppointment.id },
      });
      expect(result).toEqual(mockAppointment);
    });

    it('should throw NotFoundException for non-existent appointment', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getAppointmentById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirmAppointment', () => {
    it('should confirm a scheduled appointment', async () => {
      mockRepository.findOne.mockResolvedValue(mockAppointment);
      const confirmedAppointment = { ...mockAppointment, status: AppointmentStatus.CONFIRMED };
      mockRepository.save.mockResolvedValue(confirmedAppointment);

      const result = await service.confirmAppointment(mockAppointment.id, {});

      expect(result.status).toBe(AppointmentStatus.CONFIRMED);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for non-scheduled appointment', async () => {
      const confirmedAppointment = { ...mockAppointment, status: AppointmentStatus.CONFIRMED };
      mockRepository.findOne.mockResolvedValue(confirmedAppointment);

      await expect(service.confirmAppointment(mockAppointment.id, {})).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAvailableTimeSlots', () => {
    it('should return available time slots', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getAvailableTimeSlots(
        mockAppointment.veterinarianId,
        '2024-12-25'
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should exclude occupied slots', async () => {
      const existingAppointment = {
        ...mockAppointment,
        appointmentDate: new Date('2024-12-25T10:00:00Z'),
      };
      mockRepository.find.mockResolvedValue([existingAppointment]);

      const result = await service.getAvailableTimeSlots(
        mockAppointment.veterinarianId,
        '2024-12-25'
      );

      expect(result).not.toContain('10:00');
    });
  });
});

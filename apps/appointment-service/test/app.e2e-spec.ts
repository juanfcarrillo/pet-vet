import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../src/dto/appointment.dto';
import { AppointmentType, AppointmentStatus } from '../src/entities/appointment.entity';

describe('AppointmentController (e2e)', () => {
  let app: INestApplication;
  let createdAppointmentId: string;

  const mockCreateAppointmentDto: CreateAppointmentDto = {
    clientId: '123e4567-e89b-12d3-a456-426614174001',
    veterinarianId: '123e4567-e89b-12d3-a456-426614174002',
    petName: 'Fluffy',
    petSpecies: 'Cat',
    petBreed: 'Persian',
    petAge: 3,
    appointmentDate: '2025-12-25T10:00:00Z',
    type: AppointmentType.CONSULTATION,
    reason: 'Regular checkup',
    clientName: 'John Doe',
    clientEmail: 'john.doe@example.com',
    clientPhone: '+1234567890',
    veterinarianName: 'Dr. Smith',
    cost: 50.00,
    isEmergency: false,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Configure global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/appointments/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/appointments/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('OK');
          expect(res.body.data).toHaveProperty('timestamp');
        });
    });
  });

  describe('/api/appointments (POST)', () => {
    it('should create an appointment', () => {
      return request(app.getHttpServer())
        .post('/api/appointments')
        .send(mockCreateAppointmentDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.petName).toBe(mockCreateAppointmentDto.petName);
          expect(res.body.data.status).toBe(AppointmentStatus.SCHEDULED);
          createdAppointmentId = res.body.data.id;
        });
    });

    it('should return 400 for invalid appointment data', () => {
      const invalidDto = {
        ...mockCreateAppointmentDto,
        petAge: -1, // Invalid age
        clientEmail: 'invalid-email', // Invalid email
      };

      return request(app.getHttpServer())
        .post('/api/appointments')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 400 for past appointment date', () => {
      const pastDateDto = {
        ...mockCreateAppointmentDto,
        appointmentDate: '2020-01-01T10:00:00Z',
      };

      return request(app.getHttpServer())
        .post('/api/appointments')
        .send(pastDateDto)
        .expect(400);
    });
  });

  describe('/api/appointments/available-slots/:veterinarianId/:date (GET)', () => {
    it('should get available time slots', () => {
      const date = '2025-12-25';
      return request(app.getHttpServer())
        .get(`/api/appointments/available-slots/${mockCreateAppointmentDto.veterinarianId}/${date}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });
  });
});

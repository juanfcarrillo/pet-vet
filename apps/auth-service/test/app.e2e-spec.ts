import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { User } from '../src/entities/user.entity';
import { UserRole } from '@pet-vet/types';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'postgres',
          database: 'auth_db_test',
          entities: [User],
          synchronize: true,
          dropSchema: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    
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

  afterEach(async () => {
    await app.close();
  });

  describe('/api/auth/health (GET)', () => {
    it('debería retornar el estado del servicio', () => {
      return request(app.getHttpServer())
        .get('/api/auth/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('ok');
          expect(res.body.data.timestamp).toBeDefined();
        });
    });
  });

  describe('/api/auth/register (POST)', () => {
    const validUser = {
      fullName: 'Juan Pérez Test',
      email: 'juan.test@example.com',
      password: 'Password123!',
      securityQuestion: '¿Cuál es tu color favorito?',
      securityAnswer: 'azul',
      role: UserRole.CLIENT,
    };

    it('debería registrar un usuario exitosamente', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(validUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.user).toBeDefined();
          expect(res.body.data.accessToken).toBeDefined();
          expect(res.body.data.refreshToken).toBeDefined();
          expect(res.body.data.user.email).toBe(validUser.email.toLowerCase());
          expect(res.body.data.user.password).toBeUndefined();
        });
    });

    it('debería fallar con email duplicado', async () => {
      // Primero registrar el usuario
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(validUser)
        .expect(201);

      // Intentar registrar el mismo email
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(validUser)
        .expect(409);
    });

    it('debería fallar con email inválido', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...validUser, email: 'invalid-email' })
        .expect(400);
    });

    it('debería fallar con contraseña débil', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...validUser, password: '123' })
        .expect(400);
    });

    it('debería fallar con datos faltantes', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: validUser.email })
        .expect(400);
    });
  });

  describe('/api/auth/login (POST)', () => {
    const testUser = {
      fullName: 'Login Test User',
      email: 'login.test@example.com',
      password: 'Password123!',
      securityQuestion: '¿Cuál es tu animal favorito?',
      securityAnswer: 'perro',
      role: UserRole.CLIENT,
    };

    beforeEach(async () => {
      // Registrar usuario de prueba
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser);
    });

    it('debería iniciar sesión exitosamente', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.user).toBeDefined();
          expect(res.body.data.accessToken).toBeDefined();
          expect(res.body.data.refreshToken).toBeDefined();
        });
    });

    it('debería fallar con credenciales incorrectas', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrong-password',
        })
        .expect(401);
    });

    it('debería fallar con usuario inexistente', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'noexiste@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });
  });

  describe('/api/auth/security-question (POST)', () => {
    const testUser = {
      fullName: 'Security Test User',
      email: 'security.test@example.com',
      password: 'Password123!',
      securityQuestion: '¿Cuál es tu ciudad natal?',
      securityAnswer: 'madrid',
      role: UserRole.CLIENT,
    };

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser);
    });

    it('debería obtener la pregunta de seguridad', () => {
      return request(app.getHttpServer())
        .post('/api/auth/security-question')
        .send({ email: testUser.email })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.securityQuestion).toBe(testUser.securityQuestion);
        });
    });

    it('debería fallar con usuario inexistente', () => {
      return request(app.getHttpServer())
        .post('/api/auth/security-question')
        .send({ email: 'noexiste@example.com' })
        .expect(404);
    });
  });

  describe('/api/auth/reset-password (POST)', () => {
    const testUser = {
      fullName: 'Reset Test User',
      email: 'reset.test@example.com',
      password: 'Password123!',
      securityQuestion: '¿Cuál es tu comida favorita?',
      securityAnswer: 'pizza',
      role: UserRole.CLIENT,
    };

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser);
    });

    it('debería resetear la contraseña exitosamente', () => {
      return request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({
          email: testUser.email,
          securityAnswer: testUser.securityAnswer,
          newPassword: 'NewPassword123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.message).toContain('exitosamente');
        });
    });

    it('debería fallar con respuesta de seguridad incorrecta', () => {
      return request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({
          email: testUser.email,
          securityAnswer: 'respuesta-incorrecta',
          newPassword: 'NewPassword123!',
        })
        .expect(401);
    });
  });

  describe('/api/auth/profile (GET)', () => {
    let accessToken: string;
    const testUser = {
      fullName: 'Profile Test User',
      email: 'profile.test@example.com',
      password: 'Password123!',
      securityQuestion: '¿Cuál es tu libro favorito?',
      securityAnswer: 'quijote',
      role: UserRole.VETERINARIAN,
    };

    beforeEach(async () => {
      // Registrar y obtener token
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser);
      
      accessToken = response.body.data.accessToken;
    });

    it('debería obtener el perfil del usuario autenticado', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.email).toBe(testUser.email.toLowerCase());
          expect(res.body.data.role).toBe(testUser.role);
          expect(res.body.data.password).toBeUndefined();
        });
    });

    it('debería fallar sin token de autorización', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);
    });

    it('debería fallar con token inválido', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/api/auth/validate (GET)', () => {
    let accessToken: string;
    const testUser = {
      fullName: 'Validate Test User',
      email: 'validate.test@example.com',
      password: 'Password123!',
      securityQuestion: '¿Cuál es tu película favorita?',
      securityAnswer: 'matrix',
      role: UserRole.ADMIN,
    };

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser);
      
      accessToken = response.body.data.accessToken;
    });

    it('debería validar token exitosamente', () => {
      return request(app.getHttpServer())
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.email).toBe(testUser.email.toLowerCase());
        });
    });
  });
});

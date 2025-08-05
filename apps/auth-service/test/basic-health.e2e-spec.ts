import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Service - Basic Health Check', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return health status (GET /api/auth/health)', () => {
    return request(app.getHttpServer())
      .get('/api/auth/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('ok');
        expect(res.body.data.timestamp).toBeDefined();
      });
  });

  it('should return 404 for non-existent routes', () => {
    return request(app.getHttpServer())
      .get('/api/auth/nonexistent')
      .expect(404);
  });
});

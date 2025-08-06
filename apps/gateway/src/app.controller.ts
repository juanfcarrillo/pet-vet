import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { MicroserviceHttpService } from './services/microservice-http.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Gateway')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly httpService: MicroserviceHttpService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Gateway welcome message' })
  @ApiResponse({ status: 200, description: 'Welcome message with available services.' })
  getHello(): any {
    return {
      success: true,
      data: {
        message: 'Pet-Vet API Gateway',
        version: '1.0.0',
        services: {
          auth: '/auth/*',
          appointments: '/appointments/*',
          chat: '/chat/*',
        },
        documentation: '/api/docs',
        health: '/health',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Gateway and services health check' })
  @ApiResponse({ status: 200, description: 'Health status of all services.' })
  async getHealth(): Promise<any> {
    const servicesHealth = await this.httpService.checkServicesHealth();
    
    const overallHealthy = Object.values(servicesHealth).every(
      (service: any) => service.status === 'healthy'
    );

    return {
      success: true,
      data: {
        gateway: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
        },
        services: servicesHealth,
        overall: overallHealthy ? 'healthy' : 'degraded',
      },
      message: 'Health check completed',
    };
  }

  @Get('services')
  @ApiOperation({ summary: 'List all available services' })
  @ApiResponse({ status: 200, description: 'List of available services and their endpoints.' })
  getServices(): any {
    return {
      success: true,
      data: {
        services: [
          {
            name: 'Auth Service',
            prefix: '/auth',
            description: 'User authentication and authorization',
            endpoints: [
              'POST /auth/register - User registration',
              'POST /auth/login - User login',
              'POST /auth/reset-password - Password reset',
              'GET /auth/profile - Get user profile',
              'POST /auth/validate-token - Validate JWT token',
              'GET /auth/health - Service health check',
            ],
          },
          {
            name: 'Appointment Service',
            prefix: '/appointments',
            description: 'Appointment scheduling and management',
            endpoints: [
              'POST /appointments - Create appointment',
              'PUT /appointments/:id - Update appointment',
              'DELETE /appointments/:id - Delete appointment',
              'GET /appointments/:id - Get appointment by ID',
              'GET /appointments/client/:clientId - Get client appointments',
              'GET /appointments/veterinarian/:veterinarianId - Get veterinarian appointments',
              'POST /appointments/:id/confirm - Confirm appointment',
              'GET /appointments/available-slots/:veterinarianId/:date - Get available slots',
              'GET /appointments/health - Service health check',
            ],
          },
          {
            name: 'Chat Service',
            prefix: '/chat',
            description: 'Real-time messaging with WebSocket support',
            endpoints: [
              'GET /chat/conversations/:conversationId/messages - Get conversation messages',
              'GET /chat/users/:userId/conversations - Get user conversations',
              'POST /chat/messages - Send message (REST)',
              'PUT /chat/messages/:messageId/status - Update message status',
              'PUT /chat/messages/:messageId - Edit message',
              'DELETE /chat/messages/:messageId - Delete message',
              'POST /chat/conversations/:conversationId/mark-read - Mark as read',
              'GET /chat/users/:userId/unread-count - Get unread count',
              'GET /chat/users/:userId/search - Search messages',
              'GET /chat/websocket-info - WebSocket connection info',
              'GET /chat/health - Service health check',
            ],
            websocket: {
              url: `${this.configService.get<string>('WS_URL')}/chat` || 'ws://localhost:3003/chat',
              namespace: '/chat',
              note: 'For real-time messaging, use WebSocket connection',
            },
          },
        ],
      },
      message: 'Available services and endpoints',
    };
  }
}

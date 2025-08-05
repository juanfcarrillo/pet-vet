import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ResponseUtil } from '@pet-vet/common';
import { ApiResponse as ApiResponseType } from '@pet-vet/types';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for chat service' })
  @ApiResponse({ status: 200, description: 'Service is healthy.' })
  getHello(): ApiResponseType<{ status: string; timestamp: string; websocket: string }> {
    return ResponseUtil.success(
      {
        status: 'OK',
        timestamp: new Date().toISOString(),
        websocket: 'WebSocket server available at /chat namespace',
      },
      'Chat Service is healthy',
    );
  }
}

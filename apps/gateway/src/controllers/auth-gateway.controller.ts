import {
  Controller,
  Get,
  Post,
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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { MicroserviceHttpService } from '../services/microservice-http.service';

@ApiTags('Auth Gateway')
@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AuthGatewayController {
  constructor(private readonly httpService: MicroserviceHttpService) {}

  /**
   * HU01 - User Registration
   * POST /auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        password: { type: 'string', example: 'password123' },
        securityQuestion: { type: 'string', example: 'What is your pet\'s name?' },
        securityAnswer: { type: 'string', example: 'Fluffy' },
        role: { type: 'string', enum: ['client', 'veterinarian'], example: 'client' },
      },
      required: ['fullName', 'email', 'password', 'securityQuestion', 'securityAnswer'],
    },
  })
  register(@Body() registerDto: any): Observable<any> {
    return this.httpService.post('auth', '/api/auth/register', registerDto);
  }

  /**
   * HU02 - User Login
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'john.doe@example.com' },
        password: { type: 'string', example: 'password123' },
      },
      required: ['email', 'password'],
    },
  })
  login(@Body() loginDto: any): Observable<any> {
    return this.httpService.post('auth', '/api/auth/login', loginDto);
  }

  /**
   * HU02 - Password Recovery
   * POST /auth/reset-password
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using security question' })
  @ApiResponse({ status: 200, description: 'Password reset successful.' })
  @ApiResponse({ status: 400, description: 'Invalid security answer or user not found.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'john.doe@example.com' },
        securityAnswer: { type: 'string', example: 'Fluffy' },
        newPassword: { type: 'string', example: 'newpassword123' },
      },
      required: ['email', 'securityAnswer', 'newPassword'],
    },
  })
  resetPassword(@Body() resetPasswordDto: any): Observable<any> {
    return this.httpService.post('auth', '/api/auth/reset-password', resetPasswordDto);
  }

  /**
   * Get user profile
   * GET /auth/profile
   */
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@Headers('authorization') authorization: string): Observable<any> {
    const headers = authorization ? { authorization } : {};
    return this.httpService.get('auth', '/api/auth/profile', {}, headers);
  }

  /**
   * Validate JWT token
   * POST /auth/validate-token
   */
  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid.' })
  @ApiResponse({ status: 401, description: 'Token is invalid.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
      required: ['token'],
    },
  })
  validateToken(@Body() validateTokenDto: any): Observable<any> {
    return this.httpService.post('auth', '/api/auth/validate-token', validateTokenDto);
  }

  /**
   * Verify security question
   * POST /auth/verify-security-question
   */
  @Post('verify-security-question')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify security question answer' })
  @ApiResponse({ status: 200, description: 'Security question verified.' })
  @ApiResponse({ status: 400, description: 'Invalid answer.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'john.doe@example.com' },
        securityAnswer: { type: 'string', example: 'Fluffy' },
      },
      required: ['email', 'securityAnswer'],
    },
  })
  verifySecurityQuestion(@Body() verifyDto: any): Observable<any> {
    return this.httpService.post('auth', '/api/auth/verify-security-question', verifyDto);
  }

  /**
   * Health check
   * GET /auth/health
   */
  @Get('health')
  @ApiOperation({ summary: 'Auth service health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy.' })
  healthCheck(): Observable<any> {
    return this.httpService.get('auth', '/api/auth/health');
  }

  /**
   * Search users by email
   * GET /auth/users/search
   */
  @Get('users/search')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search users by email' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No users found.' })
  @ApiParam({ name: 'email', description: 'Email to search for', type: 'string' })
  searchUsersByEmail(
    @Query('email') email: string,
    @Headers('authorization') authorization: string,
  ): Observable<any> {
    const headers = authorization ? { authorization } : {};
    const params = { email };
    return this.httpService.get('auth', '/api/auth/users/search', params, headers);
  }
}

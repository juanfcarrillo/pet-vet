import { 
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { 
  CreateUserDto, 
  LoginDto, 
  ResetPasswordDto, 
  VerifySecurityQuestionDto 
} from '../dto/auth.dto';
import { ResponseUtil } from '@pet-vet/common';
import { AuthResponse, ApiResponse } from '@pet-vet/types';
import { User } from '../entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * HU01 - Registro de usuario
   * POST /auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @SwaggerApiResponse({ status: 201, description: 'User successfully registered.' })
  @SwaggerApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<AuthResponse>> {
    try {
      const result = await this.authService.register(createUserDto);
      return ResponseUtil.success(result, 'Usuario registrado exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * HU02 - Inicio de sesión
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<AuthResponse>> {
    try {
      const result = await this.authService.login(loginDto);
      return ResponseUtil.success(result, 'Inicio de sesión exitoso');
    } catch (error) {
      throw error;
    }
  }

  /**
   * HU02 - Obtener pregunta de seguridad para recuperación
   * POST /auth/security-question
   */
  @Post('security-question')
  @HttpCode(HttpStatus.OK)
  async getSecurityQuestion(
    @Body() verifyDto: VerifySecurityQuestionDto
  ): Promise<ApiResponse<{ securityQuestion: string }>> {
    try {
      const result = await this.authService.getSecurityQuestion(verifyDto);
      return ResponseUtil.success(result, 'Pregunta de seguridad obtenida');
    } catch (error) {
      throw error;
    }
  }

  /**
   * HU02 - Resetear contraseña usando pregunta de seguridad
   * POST /auth/reset-password
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const result = await this.authService.resetPassword(resetPasswordDto);
      return ResponseUtil.success(result, 'Contraseña restablecida exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refrescar token de acceso
   * POST /auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body('refreshToken') refreshToken: string
  ): Promise<ApiResponse<{ accessToken: string }>> {
    try {
      const result = await this.authService.refreshToken(refreshToken);
      return ResponseUtil.success(result, 'Token refrescado exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   * GET /auth/profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request & { user: User }): Promise<ApiResponse<User>> {
    try {
      const result = await this.authService.getProfile(req.user.id);
      return ResponseUtil.success(result, 'Perfil obtenido exitosamente');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validar token (usado por otros servicios)
   * GET /auth/validate
   */
  @Get('validate')
  @UseGuards(JwtAuthGuard)
  async validateToken(@Req() req: Request & { user: User }): Promise<ApiResponse<any>> {
    try {
      return ResponseUtil.success(req.user.toResponseObject(), 'Token válido');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Health check
   * GET /auth/health
   */
  @Get('health')
  getHealth(): ApiResponse<{ status: string; timestamp: string }> {
    return ResponseUtil.success(
      { 
        status: 'ok', 
        timestamp: new Date().toISOString() 
      }, 
      'Auth service está funcionando correctamente'
    );
  }
}

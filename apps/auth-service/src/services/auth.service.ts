import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { CreateUserDto, LoginDto, ResetPasswordDto, VerifySecurityQuestionDto } from '../dto/auth.dto';
import { PasswordUtil, ValidationUtil } from '@pet-vet/common';
import { AuthResponse } from '@pet-vet/types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registro de usuario - HU01
   */
  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    const { email, password, securityAnswer, ...userData } = createUserDto;

    // Validar formato de email
    if (!ValidationUtil.isValidEmail(email)) {
      throw new BadRequestException('Formato de email inválido');
    }

    // Validar formato de contraseña
    if (!ValidationUtil.isValidPassword(password)) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial'
      );
    }

    // Verificar que el email no exista
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado en el sistema');
    }

    // Hashear contraseña y respuesta de seguridad
    const hashedPassword = await PasswordUtil.hash(password);
    const hashedSecurityAnswer = await PasswordUtil.hash(securityAnswer.toLowerCase().trim());

    // Crear usuario
    const user = this.userRepository.create({
      ...userData,
      email: email.toLowerCase(),
      password: hashedPassword,
      securityAnswer: hashedSecurityAnswer,
    });

    const savedUser = await this.userRepository.save(user);

    // Generar tokens
    const tokens = await this.generateTokens(savedUser);

    return {
      user: savedUser.toResponseObject(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Inicio de sesión - HU02
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Buscar usuario por email
    const user = await this.userRepository.findOne({ 
      where: { email: email.toLowerCase(), isActive: true } 
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Verificar contraseña
    const isPasswordValid = await PasswordUtil.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Generar tokens
    const tokens = await this.generateTokens(user);

    return {
      user: user.toResponseObject(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Obtener pregunta de seguridad para recuperación de contraseña
   */
  async getSecurityQuestion(verifyDto: VerifySecurityQuestionDto): Promise<{ securityQuestion: string }> {
    const { email } = verifyDto;

    const user = await this.userRepository.findOne({ 
      where: { email: email.toLowerCase(), isActive: true },
      select: ['securityQuestion']
    });

    if (!user) {
      throw new NotFoundException('No se encontró un usuario con ese email');
    }

    return { securityQuestion: user.securityQuestion };
  }

  /**
   * Resetear contraseña usando pregunta de seguridad - HU02
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { email, securityAnswer, newPassword } = resetPasswordDto;

    // Buscar usuario
    const user = await this.userRepository.findOne({ 
      where: { email: email.toLowerCase(), isActive: true } 
    });

    if (!user) {
      throw new NotFoundException('No se encontró un usuario con ese email');
    }

    // Verificar respuesta de seguridad
    const isSecurityAnswerValid = await PasswordUtil.compare(
      securityAnswer.toLowerCase().trim(),
      user.securityAnswer
    );

    if (!isSecurityAnswerValid) {
      throw new UnauthorizedException('Respuesta de seguridad incorrecta');
    }

    // Validar nueva contraseña
    if (!ValidationUtil.isValidPassword(newPassword)) {
      throw new BadRequestException(
        'La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial'
      );
    }

    // Hashear nueva contraseña
    const hashedNewPassword = await PasswordUtil.hash(newPassword);

    // Actualizar contraseña
    await this.userRepository.update(user.id, { password: hashedNewPassword });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  /**
   * Validar usuario desde JWT
   */
  async validateUser(payload: any): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { id: payload.sub, isActive: true } 
    });

    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }

    return user;
  }

  /**
   * Obtener perfil de usuario
   */
  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId, isActive: true } 
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user.toResponseObject() as User;
  }

  /**
   * Refrescar token de acceso
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.validateUser(payload);
      
      const accessToken = this.jwtService.sign(
        { 
          sub: user.id, 
          email: user.email, 
          role: user.role 
        },
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Token de refresco inválido');
    }
  }

  /**
   * Generar tokens de acceso y refresco
   */
  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }

  /**
   * Buscar usuarios por email
   */
  async searchUsersByEmail(email: string): Promise<Partial<User>[]> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const users = await this.userRepository.find({
      where: { email: Like(`%${email}%`) },
    });

    if (!users.length) {
      throw new NotFoundException('No users found with the provided email');
    }

    return users.map(({ password, securityAnswer, ...user }) => user);
  }
}

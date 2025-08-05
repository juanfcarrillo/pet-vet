import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    fullName: 'Juan Pérez',
    email: 'juan@test.com',
    role: UserRole.CLIENT,
    password: 'hashedPassword',
    securityQuestion: '¿Cuál es tu color favorito?',
    securityAnswer: 'hashedAnswer',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    toResponseObject: jest.fn().mockReturnValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      fullName: 'Juan Pérez',
      email: 'juan@test.com',
      role: UserRole.CLIENT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      fullName: 'Juan Pérez',
      email: 'juan@test.com',
      password: 'Password123!',
      securityQuestion: '¿Cuál es tu color favorito?',
      securityAnswer: 'azul',
      role: UserRole.CLIENT,
    };

    it('debería registrar un usuario exitosamente', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-token');

      jest.spyOn(PasswordUtil, 'hash').mockResolvedValue('hashedPassword');

      const result = await service.register(createUserDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUser.toResponseObject).toHaveBeenCalled();
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('debería lanzar BadRequestException para email inválido', async () => {
      const invalidDto = { ...createUserDto, email: 'invalid-email' };

      await expect(service.register(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException para contraseña débil', async () => {
      const invalidDto = { ...createUserDto, password: '123' };

      await expect(service.register(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'juan@test.com',
      password: 'Password123!',
    };

    it('debería iniciar sesión exitosamente', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-token');

      jest.spyOn(PasswordUtil, 'compare').mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('debería lanzar UnauthorizedException para usuario inexistente', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException para contraseña incorrecta', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(PasswordUtil, 'compare').mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getSecurityQuestion', () => {
    it('debería obtener la pregunta de seguridad exitosamente', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        securityQuestion: '¿Cuál es tu color favorito?',
      });

      const result = await service.getSecurityQuestion({ email: 'juan@test.com' });

      expect(result).toEqual({
        securityQuestion: '¿Cuál es tu color favorito?',
      });
    });

    it('debería lanzar NotFoundException para usuario inexistente', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getSecurityQuestion({ email: 'noexiste@test.com' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      email: 'juan@test.com',
      securityAnswer: 'azul',
      newPassword: 'NewPassword123!',
    };

    it('debería resetear la contraseña exitosamente', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      jest.spyOn(PasswordUtil, 'compare').mockResolvedValue(true);
      jest.spyOn(PasswordUtil, 'hash').mockResolvedValue('newHashedPassword');

      const result = await service.resetPassword(resetPasswordDto);

      expect(result).toEqual({
        message: 'Contraseña actualizada exitosamente',
      });
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        { password: 'newHashedPassword' }
      );
    });

    it('debería lanzar UnauthorizedException para respuesta de seguridad incorrecta', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(PasswordUtil, 'compare').mockResolvedValue(false);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('debería validar usuario exitosamente', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser({ sub: mockUser.id });

      expect(result).toBe(mockUser);
    });

    it('debería lanzar UnauthorizedException para usuario inexistente', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser({ sub: 'invalid-id' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('debería obtener el perfil del usuario exitosamente', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUser.id);

      expect(mockUser.toResponseObject).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException para usuario inexistente', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('refreshToken', () => {
    it('debería refrescar el token exitosamente', async () => {
      const payload = { sub: mockUser.id, email: mockUser.email, role: mockUser.role };
      
      mockJwtService.verify.mockReturnValue(payload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new-access-token');

      const result = await service.refreshToken('valid-refresh-token');

      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('debería lanzar UnauthorizedException para token inválido', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});

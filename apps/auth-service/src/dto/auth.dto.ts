import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, MaxLength } from 'class-validator';
import { UserRole } from '@pet-vet/types';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El nombre completo no puede exceder 255 caracteres' })
  fullName: string;

  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsNotEmpty({ message: 'La pregunta de seguridad es requerida' })
  @IsString({ message: 'La pregunta de seguridad debe ser una cadena de texto' })
  @MaxLength(500, { message: 'La pregunta de seguridad no puede exceder 500 caracteres' })
  securityQuestion: string;

  @IsNotEmpty({ message: 'La respuesta de seguridad es requerida' })
  @IsString({ message: 'La respuesta de seguridad debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La respuesta de seguridad no puede exceder 255 caracteres' })
  securityAnswer: string;

  @IsNotEmpty({ message: 'El rol es requerido' })
  @IsEnum(UserRole, { message: 'El rol debe ser válido (client, veterinarian, admin)' })
  role: UserRole;
}

export class LoginDto {
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @IsNotEmpty({ message: 'La respuesta de seguridad es requerida' })
  @IsString({ message: 'La respuesta de seguridad debe ser una cadena de texto' })
  securityAnswer: string;

  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  newPassword: string;
}

export class VerifySecurityQuestionDto {
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;
}

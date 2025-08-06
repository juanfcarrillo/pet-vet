// Importación de decoradores y tipos de TypeORM para definir una entidad de base de datos
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Importación del tipo de rol de usuario definido externamente
import { UserRole } from '@pet-vet/types';

// Decorador que indica que esta clase representa una entidad y se mapeará a la tabla 'users'
@Entity('users')
export class User {
  // Identificador único primario generado automáticamente con formato UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Columna para el nombre completo del usuario, tipo varchar de hasta 255 caracteres
  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  // Correo electrónico del usuario, debe ser único
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  // Contraseña del usuario (almacenada de forma cifrada)
  @Column({ type: 'varchar', length: 255 })
  password: string;

  // Pregunta de seguridad para recuperación de cuenta
  @Column({ type: 'varchar', length: 500 })
  securityQuestion: string;

  // Respuesta a la pregunta de seguridad
  @Column({ type: 'varchar', length: 255 })
  securityAnswer: string;

  // Rol del usuario, definido como un enum (por ejemplo: ADMIN, CLIENT, VET, etc.)
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT, // Por defecto, todos los usuarios nuevos son clientes
  })
  role: UserRole;

  // Indica si el usuario está activo (true por defecto)
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Fecha y hora de creación del registro, se asigna automáticamente
  @CreateDateColumn()
  createdAt: Date;

  // Fecha y hora de la última actualización del registro, se actualiza automáticamente
  @UpdateDateColumn()
  updatedAt: Date;

  // Método para retornar un objeto del usuario excluyendo datos sensibles como contraseña y respuesta de seguridad
  toResponseObject() {
    const { password, securityAnswer, ...userData } = this;
    return userData;
  }
}

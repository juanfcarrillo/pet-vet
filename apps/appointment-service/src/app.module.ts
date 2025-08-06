import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { SentryModule, SentryGlobalFilter } from '@sentry/nestjs/setup';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentModule } from './modules/appointment.module';
import { Appointment } from './entities/appointment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '../../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('APPOINTMENT_DB_HOST') || 'localhost',
        port: configService.get<number>('APPOINTMENT_DB_PORT') || 5433,
        username: configService.get<string>('APPOINTMENT_DB_USER') || 'postgres',
        password: configService.get<string>('APPOINTMENT_DB_PASSWORD') || 'postgres',
        database: configService.get<string>('APPOINTMENT_DB_NAME') || 'appointment_db',
        entities: [Appointment],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AppointmentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter, // Filtro global para capturar excepciones y enviarlas a Sentry
    },
  ],
})
export class AppModule {}

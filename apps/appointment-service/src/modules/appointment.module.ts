import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AppointmentController } from '../controllers/appointment.controller';
import { AppointmentService } from '../services/appointment.service';
import { Appointment } from '../entities/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment]),
    ConfigModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}

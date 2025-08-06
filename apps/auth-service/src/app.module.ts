import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { SentryModule, SentryGlobalFilter } from '@sentry/nestjs/setup';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth.module';
import { User } from './entities/user.entity';

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
        host: configService.get<string>('AUTH_DB_HOST', 'localhost'),
        port: configService.get<number>('AUTH_DB_PORT', 5432), // Auth service usa el puerto base
        username: configService.get<string>('AUTH_DB_USER', 'postgres'),
        password: configService.get<string>('AUTH_DB_PASSWORD', 'postgres'),
        database: 'auth_db',
        entities: [User],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
        ssl: configService.get<string>('NODE_ENV') === 'production' 
          ? { rejectUnauthorized: false } 
          : false,
      }),
      inject: [ConfigService],
    }),
    //Integración con Sentry
    SentryModule.forRoot(),
    AuthModule,
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

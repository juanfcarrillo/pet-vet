import { Module } from '@nestjs/common';
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
      useFactory: async (configService: ConfigService) => {
        // Debug: Mostrar las variables de entorno que se están leyendo
        console.log('=== AUTH SERVICE DATABASE CONFIG ===');
        console.log('AUTH_DB_HOST:', configService.get<string>('AUTH_DB_HOST'));
        console.log('AUTH_DB_PORT:', configService.get<number>('AUTH_DB_PORT'));
        console.log('AUTH_DB_USER:', configService.get<string>('AUTH_DB_USER'));
        console.log('AUTH_DB_PASSWORD:', configService.get<string>('AUTH_DB_PASSWORD'));
        console.log('AUTH_DB_NAME:', configService.get<string>('AUTH_DB_NAME'));
        console.log('=====================================');
        
        // Configuración usando variables de entorno
        const dbConfig = {
          type: 'postgres' as const,
          host: configService.get<string>('AUTH_DB_HOST') || 'localhost',
          port: configService.get<number>('AUTH_DB_PORT') || 5435,
          username: configService.get<string>('AUTH_DB_USER') || 'postgres',
          password: configService.get<string>('AUTH_DB_PASSWORD') || 'postgres',
          database: configService.get<string>('AUTH_DB_NAME') || 'auth_db',
          entities: [User],
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          logging: configService.get<string>('NODE_ENV') === 'development',
          ssl: false
        };
        
        console.log('=== FINAL DB CONFIG ===');
        console.log(JSON.stringify(dbConfig, null, 2));
        console.log('=====================');
        
        return dbConfig;
      },
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

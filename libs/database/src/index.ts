import { DataSource, DataSourceOptions } from 'typeorm';
import { DatabaseConfig } from '@pet-vet/types';

export class DatabaseUtil {
  static createDataSource(config: DatabaseConfig, entities: any[]): DataSource {
    const options: DataSourceOptions = {
      type: 'postgres',
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
      entities,
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

    return new DataSource(options);
  }

  static getConfig(serviceName: string): DatabaseConfig {
    const basePort = process.env.NODE_ENV === 'production' ? 5432 : 5432;
    const portOffset = serviceName === 'auth' ? 0 : serviceName === 'appointment' ? 1 : 2;
    
    return {
      host: process.env.DB_HOST || 'localhost',
      port: basePort + portOffset,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || `${serviceName}_db`,
    };
  }
}

// Entidades base
export abstract class BaseEntity {
  abstract id: string;
  abstract createdAt: Date;
  abstract updatedAt: Date;
}

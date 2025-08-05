import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { Observable, catchError, map, throwError } from 'rxjs';

export interface ServiceEndpoint {
  baseUrl: string;
  timeout?: number;
}

@Injectable()
export class MicroserviceHttpService {
  private readonly logger = new Logger(MicroserviceHttpService.name);
  
  private readonly services: Record<string, ServiceEndpoint>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.services = {
      auth: {
        baseUrl: this.configService.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3001',
        timeout: 10000,
      },
      appointments: {
        baseUrl: this.configService.get<string>('APPOINTMENT_SERVICE_URL') || 'http://localhost:3002',
        timeout: 10000,
      },
      chat: {
        baseUrl: this.configService.get<string>('CHAT_SERVICE_URL') || 'http://localhost:3003',
        timeout: 10000,
      },
    };
  }

  /**
   * Forward GET request to a microservice
   */
  get<T = any>(
    service: string,
    path: string,
    params?: any,
    headers?: any,
  ): Observable<T> {
    const serviceConfig = this.getServiceConfig(service);
    const url = `${serviceConfig.baseUrl}${path}`;

    this.logger.log(`GET ${url}`);

    return this.httpService
      .get(url, {
        params,
        headers,
        timeout: serviceConfig.timeout,
      })
      .pipe(
        map((response: AxiosResponse<T>) => response.data),
        catchError((error) => this.handleError(error, 'GET', url)),
      );
  }

  /**
   * Forward POST request to a microservice
   */
  post<T = any>(
    service: string,
    path: string,
    data?: any,
    headers?: any,
  ): Observable<T> {
    const serviceConfig = this.getServiceConfig(service);
    const url = `${serviceConfig.baseUrl}${path}`;

    this.logger.log(`POST ${url}`);

    return this.httpService
      .post(url, data, {
        headers,
        timeout: serviceConfig.timeout,
      })
      .pipe(
        map((response: AxiosResponse<T>) => response.data),
        catchError((error) => this.handleError(error, 'POST', url)),
      );
  }

  /**
   * Forward PUT request to a microservice
   */
  put<T = any>(
    service: string,
    path: string,
    data?: any,
    headers?: any,
  ): Observable<T> {
    const serviceConfig = this.getServiceConfig(service);
    const url = `${serviceConfig.baseUrl}${path}`;

    this.logger.log(`PUT ${url}`);

    return this.httpService
      .put(url, data, {
        headers,
        timeout: serviceConfig.timeout,
      })
      .pipe(
        map((response: AxiosResponse<T>) => response.data),
        catchError((error) => this.handleError(error, 'PUT', url)),
      );
  }

  /**
   * Forward DELETE request to a microservice
   */
  delete<T = any>(
    service: string,
    path: string,
    headers?: any,
  ): Observable<T> {
    const serviceConfig = this.getServiceConfig(service);
    const url = `${serviceConfig.baseUrl}${path}`;

    this.logger.log(`DELETE ${url}`);

    return this.httpService
      .delete(url, {
        headers,
        timeout: serviceConfig.timeout,
      })
      .pipe(
        map((response: AxiosResponse<T>) => response.data),
        catchError((error) => this.handleError(error, 'DELETE', url)),
      );
  }

  /**
   * Forward PATCH request to a microservice
   */
  patch<T = any>(
    service: string,
    path: string,
    data?: any,
    headers?: any,
  ): Observable<T> {
    const serviceConfig = this.getServiceConfig(service);
    const url = `${serviceConfig.baseUrl}${path}`;

    this.logger.log(`PATCH ${url}`);

    return this.httpService
      .patch(url, data, {
        headers,
        timeout: serviceConfig.timeout,
      })
      .pipe(
        map((response: AxiosResponse<T>) => response.data),
        catchError((error) => this.handleError(error, 'PATCH', url)),
      );
  }

  /**
   * Get service configuration
   */
  private getServiceConfig(service: string): ServiceEndpoint {
    const serviceConfig = this.services[service];
    if (!serviceConfig) {
      throw new Error(`Service '${service}' not configured`);
    }
    return serviceConfig;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any, method: string, url: string) {
    this.logger.error(`${method} ${url} failed:`, error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      this.logger.error(`Service responded with status ${status}:`, data);
      return throwError(() => ({
        statusCode: status,
        message: data?.message || 'Service error',
        error: data?.error || 'Internal Server Error',
        service: this.getServiceFromUrl(url),
      }));
    } else if (error.request) {
      // The request was made but no response was received
      this.logger.error('No response received from service');
      return throwError(() => ({
        statusCode: 503,
        message: 'Service unavailable',
        error: 'Service Unavailable',
        service: this.getServiceFromUrl(url),
      }));
    } else {
      // Something happened in setting up the request that triggered an Error
      this.logger.error('Request setup error:', error.message);
      return throwError(() => ({
        statusCode: 500,
        message: 'Gateway error',
        error: 'Internal Server Error',
        service: this.getServiceFromUrl(url),
      }));
    }
  }

  /**
   * Extract service name from URL for error reporting
   */
  private getServiceFromUrl(url: string): string {
    for (const [serviceName, config] of Object.entries(this.services)) {
      if (url.startsWith(config.baseUrl)) {
        return serviceName;
      }
    }
    return 'unknown';
  }

  /**
   * Check health of all services
   */
  async checkServicesHealth(): Promise<Record<string, any>> {
    const healthChecks: Record<string, any> = {};

    for (const [serviceName, config] of Object.entries(this.services)) {
      try {
        const response = await this.httpService
          .get(`${config.baseUrl}/api/health`, { timeout: 5000 })
          .toPromise();
        
        healthChecks[serviceName] = {
          status: 'healthy',
          url: config.baseUrl,
          response: response?.data,
        };
      } catch (error) {
        healthChecks[serviceName] = {
          status: 'unhealthy',
          url: config.baseUrl,
          error: error.message,
        };
      }
    }

    return healthChecks;
  }
}

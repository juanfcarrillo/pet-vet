import Consul from 'consul';

export class ServiceDiscovery {
  private consul: Consul;

  constructor() {
    this.consul = new Consul({
      host: process.env.CONSUL_HOST || 'localhost',
      port: parseInt(process.env.CONSUL_PORT || '8500'),
    });
  }

  async getServiceAddress(serviceName: string): Promise<string | null> {
    try {
      const services = await this.consul.health.service({
        service: serviceName,
        passing: true,
      });

      if (services && services.length > 0) {
        const service = services[0].Service;
        return `http://${service.Address}:${service.Port}`;
      }
      return null;
    } catch (error) {
      console.error(`Error finding service ${serviceName}:`, error);
      return null;
    }
  }

  async getAllServices(): Promise<any[]> {
    try {
      const services = await this.consul.agent.service.list();
      return Object.values(services);
    } catch (error) {
      console.error('Error listing all services:', error);
      return [];
    }
  }

  async registerService(config: {
    id: string;
    name: string;
    address: string;
    port: number;
    check?: {
      name: string;
      http: string;
      interval: string;
      timeout: string;
    };
  }): Promise<void> {
    try {
      await this.consul.agent.service.register(config);
      console.log(`Service ${config.name} registered successfully`);
    } catch (error) {
      console.error(`Failed to register service ${config.name}:`, error);
      throw error;
    }
  }

  async deregisterService(serviceId: string): Promise<void> {
    try {
      await this.consul.agent.service.deregister(serviceId);
      console.log(`Service ${serviceId} deregistered successfully`);
    } catch (error) {
      console.error(`Failed to deregister service ${serviceId}:`, error);
      throw error;
    }
  }
}

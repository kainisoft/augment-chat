import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@app/logging';
import { ErrorLoggerService } from '@app/logging';

export interface ServiceInstance {
  id: string;
  name: string;
  url: string;
  health: 'healthy' | 'unhealthy' | 'unknown';
  lastHealthCheck: Date;
  weight: number;
  metadata: Record<string, any>;
}

export interface ServiceEndpoint {
  name: string;
  instances: ServiceInstance[];
  loadBalancingStrategy: 'round-robin' | 'weighted' | 'least-connections';
}

export interface HealthCheckResult {
  healthy: boolean;
  responseTime: number;
  error?: string;
}

/**
 * Service Registry Service
 *
 * Manages service discovery, health monitoring, and load balancing
 * for Apollo Federation Gateway.
 *
 * Phase 2, Step 3: Service Discovery and Routing
 */
@Injectable()
export class ServiceRegistryService implements OnModuleInit, OnModuleDestroy {
  private services = new Map<string, ServiceEndpoint>();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly healthCheckIntervalMs: number;
  private readonly healthCheckTimeoutMs: number;
  private roundRobinCounters = new Map<string, number>();

  constructor(
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(ServiceRegistryService.name);
    this.healthCheckIntervalMs = this.configService.get<number>(
      'SERVICE_HEALTH_CHECK_INTERVAL_MS',
      30000, // 30 seconds
    );
    this.healthCheckTimeoutMs = this.configService.get<number>(
      'SERVICE_HEALTH_CHECK_TIMEOUT_MS',
      5000, // 5 seconds
    );
  }

  async onModuleInit(): Promise<void> {
    this.loggingService.log(
      'Initializing Service Registry',
      'ServiceRegistryInit',
    );

    // Register default services from configuration
    await this.registerDefaultServices();

    // Start health check monitoring
    this.startHealthCheckMonitoring();

    this.loggingService.log(
      `Service Registry initialized with ${this.services.size} services`,
      'ServiceRegistryInit',
    );
  }

  async onModuleDestroy(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.loggingService.log(
      'Service Registry destroyed',
      'ServiceRegistryDestroy',
    );
  }

  /**
   * Register a service instance
   */
  async registerService(
    serviceName: string,
    instance: Omit<ServiceInstance, 'id' | 'health' | 'lastHealthCheck'>,
  ): Promise<void> {
    const serviceInstance: ServiceInstance = {
      ...instance,
      id: `${serviceName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      health: 'unknown',
      lastHealthCheck: new Date(),
    };

    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, {
        name: serviceName,
        instances: [],
        loadBalancingStrategy: 'round-robin',
      });
    }

    const service = this.services.get(serviceName)!;
    service.instances.push(serviceInstance);

    this.loggingService.log(
      `Registered service instance: ${serviceName}`,
      'ServiceRegistration',
      {
        instanceId: serviceInstance.id,
        url: serviceInstance.url,
        weight: serviceInstance.weight,
      },
    );

    // Perform initial health check
    await this.performHealthCheck(serviceInstance);
  }

  /**
   * Get healthy service instances for load balancing
   */
  async getHealthyServices(serviceName: string): Promise<ServiceInstance[]> {
    const service = this.services.get(serviceName);
    if (!service) {
      this.loggingService.warn(
        `Service not found: ${serviceName}`,
        'ServiceLookup',
      );
      return [];
    }

    const healthyInstances = service.instances.filter(
      (instance) => instance.health === 'healthy',
    );

    this.loggingService.debug(
      `Found ${healthyInstances.length} healthy instances for ${serviceName}`,
      'ServiceLookup',
      {
        totalInstances: service.instances.length,
        healthyInstances: healthyInstances.length,
      },
    );

    return healthyInstances;
  }

  /**
   * Route request to a service instance using load balancing
   */
  async routeRequest(serviceName: string): Promise<ServiceInstance | null> {
    const healthyInstances = await this.getHealthyServices(serviceName);

    if (healthyInstances.length === 0) {
      this.loggingService.error(
        `No healthy instances available for service: ${serviceName}`,
        undefined,
        'ServiceRouting',
      );
      return null;
    }

    const service = this.services.get(serviceName)!;
    let selectedInstance: ServiceInstance;

    switch (service.loadBalancingStrategy) {
      case 'weighted':
        selectedInstance = this.selectWeightedInstance(healthyInstances);
        break;
      case 'round-robin':
      default:
        selectedInstance = this.selectRoundRobinInstance(
          serviceName,
          healthyInstances,
        );
        break;
    }

    this.loggingService.debug(
      `Routed request to ${serviceName}`,
      'ServiceRouting',
      {
        instanceId: selectedInstance.id,
        url: selectedInstance.url,
        strategy: service.loadBalancingStrategy,
      },
    );

    return selectedInstance;
  }

  /**
   * Get service health status
   */
  getServiceHealth(serviceName: string): {
    healthy: number;
    unhealthy: number;
    unknown: number;
    total: number;
  } {
    const service = this.services.get(serviceName);
    if (!service) {
      return { healthy: 0, unhealthy: 0, unknown: 0, total: 0 };
    }

    const stats = service.instances.reduce(
      (acc, instance) => {
        acc[instance.health]++;
        acc.total++;
        return acc;
      },
      { healthy: 0, unhealthy: 0, unknown: 0, total: 0 },
    );

    return stats;
  }

  /**
   * Get all registered services
   */
  getAllServices(): ServiceEndpoint[] {
    return Array.from(this.services.values());
  }

  /**
   * Register default services from configuration
   */
  private async registerDefaultServices(): Promise<void> {
    const userServiceUrl = this.configService.get<string>(
      'USER_SERVICE_GRAPHQL_URL',
      'http://localhost:4002/graphql',
    );
    const chatServiceUrl = this.configService.get<string>(
      'CHAT_SERVICE_GRAPHQL_URL',
      'http://localhost:4003/graphql',
    );

    // Register User Service
    await this.registerService('user-service', {
      name: 'user-service',
      url: userServiceUrl,
      weight: 1,
      metadata: {
        type: 'graphql',
        version: '1.0.0',
      },
    });

    // Register Chat Service
    await this.registerService('chat-service', {
      name: 'chat-service',
      url: chatServiceUrl,
      weight: 1,
      metadata: {
        type: 'graphql',
        version: '1.0.0',
      },
    });
  }

  /**
   * Start health check monitoring
   */
  private startHealthCheckMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecksForAllServices();
    }, this.healthCheckIntervalMs);

    this.loggingService.log(
      `Started health check monitoring (interval: ${this.healthCheckIntervalMs}ms)`,
      'HealthCheckMonitoring',
    );
  }

  /**
   * Perform health checks for all registered services
   */
  private async performHealthChecksForAllServices(): Promise<void> {
    const allInstances: ServiceInstance[] = [];

    for (const service of this.services.values()) {
      allInstances.push(...service.instances);
    }

    const healthCheckPromises = allInstances.map((instance) =>
      this.performHealthCheck(instance),
    );

    await Promise.allSettled(healthCheckPromises);
  }

  /**
   * Perform health check for a single service instance
   */
  private async performHealthCheck(instance: ServiceInstance): Promise<void> {
    const startTime = Date.now();

    try {
      const healthUrl = instance.url.replace('/graphql', '/api/health');
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.healthCheckTimeoutMs,
      );

      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'API-Gateway-Health-Check/1.0',
        },
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const previousHealth = instance.health;
        instance.health = 'healthy';
        instance.lastHealthCheck = new Date();

        if (previousHealth !== 'healthy') {
          this.loggingService.log(
            `Service instance recovered: ${instance.name}`,
            'HealthCheckRecovery',
            {
              instanceId: instance.id,
              url: instance.url,
              responseTime,
            },
          );
        }
      } else {
        this.markInstanceUnhealthy(
          instance,
          `HTTP ${response.status}: ${response.statusText}`,
        );
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.markInstanceUnhealthy(instance, errorMessage);
    }
  }

  /**
   * Mark service instance as unhealthy
   */
  private markInstanceUnhealthy(
    instance: ServiceInstance,
    error: string,
  ): void {
    const previousHealth = instance.health;
    instance.health = 'unhealthy';
    instance.lastHealthCheck = new Date();

    if (previousHealth !== 'unhealthy') {
      this.loggingService.warn(
        `Service instance became unhealthy: ${instance.name}`,
        'HealthCheckFailure',
        {
          instanceId: instance.id,
          url: instance.url,
          error,
        },
      );
    }
  }

  /**
   * Select instance using round-robin strategy
   */
  private selectRoundRobinInstance(
    serviceName: string,
    instances: ServiceInstance[],
  ): ServiceInstance {
    const currentCounter = this.roundRobinCounters.get(serviceName) || 0;
    const selectedIndex = currentCounter % instances.length;
    this.roundRobinCounters.set(serviceName, currentCounter + 1);
    return instances[selectedIndex];
  }

  /**
   * Select instance using weighted strategy
   */
  private selectWeightedInstance(
    instances: ServiceInstance[],
  ): ServiceInstance {
    const totalWeight = instances.reduce(
      (sum, instance) => sum + instance.weight,
      0,
    );
    let randomWeight = Math.random() * totalWeight;

    for (const instance of instances) {
      randomWeight -= instance.weight;
      if (randomWeight <= 0) {
        return instance;
      }
    }

    // Fallback to first instance
    return instances[0];
  }
}

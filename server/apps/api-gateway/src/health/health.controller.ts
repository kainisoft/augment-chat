import { Controller, Injectable, Get } from '@nestjs/common';
import { BaseHealthController } from '@app/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { ServiceRegistryService } from '../services/service-registry.service';
import { CircuitBreakerService } from '../services/circuit-breaker.service';

/**
 * Service to check API Gateway dependencies
 */
@Injectable()
export class ApiGatewayHealthService {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly serviceRegistry: ServiceRegistryService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {
    // Set context for all logs from this service
    this.loggingService.setContext(ApiGatewayHealthService.name);
  }

  /**
   * Check connectivity to microservices using service registry
   */
  async checkServices(): Promise<{ status: 'ok' | 'error'; details?: any }> {
    this.loggingService.debug(
      'Checking service connectivity via service registry',
      'checkServices',
    );

    try {
      // Get all registered services and their health status
      const allServices = this.serviceRegistry.getAllServices();
      const serviceHealthMap: Record<string, any> = {};

      for (const service of allServices) {
        const healthStats = this.serviceRegistry.getServiceHealth(service.name);
        const circuitBreakerState = this.circuitBreaker.getState(service.name);

        serviceHealthMap[service.name] = {
          instances: {
            total: healthStats.total,
            healthy: healthStats.healthy,
            unhealthy: healthStats.unhealthy,
            unknown: healthStats.unknown,
          },
          circuitBreaker: {
            state: circuitBreakerState.state,
            failureCount: circuitBreakerState.failureCount,
            lastFailureTime: circuitBreakerState.lastFailureTime,
          },
          loadBalancing: service.loadBalancingStrategy,
        };
      }

      // Get circuit breaker statistics
      const circuitBreakerStats = this.circuitBreaker.getStatistics();

      const hasUnhealthyServices = allServices.some((service) => {
        const health = this.serviceRegistry.getServiceHealth(service.name);
        return health.healthy === 0 && health.total > 0;
      });

      const result = {
        status: hasUnhealthyServices ? ('error' as const) : ('ok' as const),
        details: {
          services: serviceHealthMap,
          circuitBreakers: circuitBreakerStats,
          totalServices: allServices.length,
        },
      };

      this.loggingService.debug(
        'Service connectivity check completed',
        'checkServices',
        {
          totalServices: allServices.length,
          hasUnhealthyServices,
        },
      );

      return result;
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack =
        error instanceof Error && process.env.NODE_ENV !== 'production'
          ? error.stack
          : undefined;

      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Service connectivity check failed', {
        source: ApiGatewayHealthService.name,
        method: 'checkServices',
        errorCode: 'SERVICE_CONN_ERROR',
      });

      return {
        status: 'error' as const,
        details: {
          message: errorMessage,
          stack: errorStack,
        },
      };
    }
  }
}

@Controller('health')
export class ApiGatewayHealthController extends BaseHealthController {
  constructor(
    private readonly healthService: ApiGatewayHealthService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly serviceRegistry: ServiceRegistryService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {
    super();
    // Set context for all logs from this controller
    this.loggingService.setContext(ApiGatewayHealthController.name);
  }

  protected getServiceName(): string {
    return 'api-gateway';
  }

  protected async checkComponents(): Promise<
    Record<string, { status: 'ok' | 'error'; details?: any }>
  > {
    this.loggingService.debug('Checking health components', 'checkComponents');

    // Get the base components (system check)
    const baseComponents = await super.checkComponents();

    // Add service-specific component checks
    const servicesStatus = await this.healthService.checkServices();

    const result = {
      ...baseComponents,
      services: servicesStatus,
    };

    this.loggingService.debug('Health check completed', 'checkComponents', {
      status: Object.values(result).every((comp) => comp.status === 'ok')
        ? 'ok'
        : 'error',
    });

    return result;
  }

  /**
   * Get detailed service health information
   */
  @Get('services')
  async getServiceHealth() {
    this.loggingService.debug(
      'Getting service health details',
      'getServiceHealth',
    );

    const allServices = this.serviceRegistry.getAllServices();
    const serviceDetails = allServices.map((service) => {
      const healthStats = this.serviceRegistry.getServiceHealth(service.name);
      const circuitBreakerState = this.circuitBreaker.getState(service.name);

      return {
        name: service.name,
        instances: service.instances.map((instance) => ({
          id: instance.id,
          url: instance.url,
          health: instance.health,
          lastHealthCheck: instance.lastHealthCheck,
          weight: instance.weight,
          metadata: instance.metadata,
        })),
        healthStats,
        circuitBreaker: circuitBreakerState,
        loadBalancingStrategy: service.loadBalancingStrategy,
      };
    });

    const circuitBreakerStats = this.circuitBreaker.getStatistics();

    return {
      timestamp: new Date().toISOString(),
      services: serviceDetails,
      summary: {
        totalServices: allServices.length,
        circuitBreakers: circuitBreakerStats,
      },
    };
  }

  /**
   * Get circuit breaker status
   */
  @Get('circuit-breakers')
  async getCircuitBreakerStatus() {
    this.loggingService.debug(
      'Getting circuit breaker status',
      'getCircuitBreakerStatus',
    );

    const allStates = this.circuitBreaker.getAllStates();
    const statistics = this.circuitBreaker.getStatistics();

    return {
      timestamp: new Date().toISOString(),
      statistics,
      circuitBreakers: Object.fromEntries(allStates),
    };
  }
}

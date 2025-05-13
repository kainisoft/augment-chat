import { Controller, Injectable } from '@nestjs/common';
import { BaseHealthController } from '@app/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';

/**
 * Service to check API Gateway dependencies
 */
@Injectable()
export class ApiGatewayHealthService {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    // Set context for all logs from this service
    this.loggingService.setContext(ApiGatewayHealthService.name);
  }

  /**
   * Check connectivity to microservices
   * In a real implementation, this would check actual service connections
   */
  async checkServices(): Promise<{ status: 'ok' | 'error'; details?: any }> {
    // Simulate service connectivity checks
    this.loggingService.debug('Checking service connectivity', 'checkServices');

    try {
      // Simulate checking connections to other services
      await new Promise((resolve) => setTimeout(resolve, 5));

      const result = {
        status: 'ok' as const,
        details: {
          services: {
            'user-service': 'connected',
            'auth-service': 'connected',
            'chat-service': 'connected',
            'notification-service': 'connected',
          },
        },
      };

      this.loggingService.debug(
        'Service connectivity check successful',
        'checkServices',
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
}

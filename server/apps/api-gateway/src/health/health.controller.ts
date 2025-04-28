import { Controller, Injectable } from '@nestjs/common';
import { BaseHealthController } from '@app/common';

/**
 * Service to check API Gateway dependencies
 */
@Injectable()
export class ApiGatewayHealthService {
  /**
   * Check connectivity to microservices
   * In a real implementation, this would check actual service connections
   */
  async checkServices(): Promise<{ status: 'ok' | 'error'; details?: any }> {
    // Simulate service connectivity checks
    try {
      // Simulate checking connections to other services
      await new Promise((resolve) => setTimeout(resolve, 5));

      return {
        status: 'ok',
        details: {
          services: {
            'user-service': 'connected',
            'auth-service': 'connected',
            'chat-service': 'connected',
            'notification-service': 'connected',
          },
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack =
        error instanceof Error && process.env.NODE_ENV !== 'production'
          ? error.stack
          : undefined;

      return {
        status: 'error',
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
  constructor(private readonly healthService: ApiGatewayHealthService) {
    super();
  }

  protected getServiceName(): string {
    return 'api-gateway';
  }

  protected async checkComponents(): Promise<
    Record<string, { status: 'ok' | 'error'; details?: any }>
  > {
    // Get the base components (system check)
    const baseComponents = await super.checkComponents();

    // Add service-specific component checks
    const servicesStatus = await this.healthService.checkServices();

    return {
      ...baseComponents,
      services: servicesStatus,
    };
  }
}

import { Controller, Injectable } from '@nestjs/common';
import { HealthController as BaseHealthController } from '@app/common';

/**
 * Service to check chat service dependencies
 */
@Injectable()
export class ChatServiceHealthService {
  /**
   * Check database connectivity
   * In a real implementation, this would check the actual database connection
   */
  async checkDatabase(): Promise<{ status: 'ok' | 'error'; details?: any }> {
    // Simulate database check
    try {
      await new Promise((resolve) => setTimeout(resolve, 10));

      return {
        status: 'ok',
        details: {
          responseTime: 10,
          connection: 'established',
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error && process.env.NODE_ENV !== 'production'
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
export class ChatServiceHealthController extends BaseHealthController {
  constructor(private readonly healthService: ChatServiceHealthService) {
    super();
  }

  protected getServiceName(): string {
    return 'chat-service';
  }

  protected async checkComponents(): Promise<
    Record<string, { status: 'ok' | 'error'; details?: any }>
  > {
    // Get the base components (system check)
    const baseComponents = await super.checkComponents();

    // Add service-specific component checks
    const dbStatus = await this.healthService.checkDatabase();

    return {
      ...baseComponents,
      database: dbStatus,
    };
  }
}

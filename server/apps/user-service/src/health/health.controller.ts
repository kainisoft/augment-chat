import { Controller, Injectable } from '@nestjs/common';
import { BaseHealthController } from '@app/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';

/**
 * Service to check database connectivity for the user service
 */
@Injectable()
export class UserServiceHealthService {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    // Set context for all logs from this service
    this.loggingService.setContext(UserServiceHealthService.name);
  }

  /**
   * Check database connectivity
   * In a real implementation, this would check the actual database connection
   */
  async checkDatabase(): Promise<{ status: 'ok' | 'error'; details?: any }> {
    // Simulate database check - in a real app, this would be an actual DB connection check
    this.loggingService.debug(
      'Checking database connectivity',
      'checkDatabase',
    );

    try {
      // Simulate a database query
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = {
        status: 'ok' as const,
        details: {
          responseTime: 10,
          connection: 'established',
        },
      };

      this.loggingService.debug(
        'Database connectivity check successful',
        'checkDatabase',
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
      this.errorLogger.error(error, 'Database connectivity check failed', {
        source: UserServiceHealthService.name,
        method: 'checkDatabase',
        errorCode: 'DB_CONN_ERROR',
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
export class UserServiceHealthController extends BaseHealthController {
  constructor(
    private readonly healthService: UserServiceHealthService,
    private readonly loggingService: LoggingService,
  ) {
    super();
    // Set context for all logs from this controller
    this.loggingService.setContext(UserServiceHealthController.name);
  }

  protected getServiceName(): string {
    return 'user-service';
  }

  protected async checkComponents(): Promise<
    Record<string, { status: 'ok' | 'error'; details?: any }>
  > {
    this.loggingService.debug('Checking health components', 'checkComponents');

    // Get the base components (system check)
    const baseComponents = await super.checkComponents();

    // Add service-specific component checks
    const dbStatus = await this.healthService.checkDatabase();

    const result = {
      ...baseComponents,
      database: dbStatus,
    };

    this.loggingService.debug('Health check completed', 'checkComponents', {
      status: Object.values(result).every((comp) => comp.status === 'ok')
        ? 'ok'
        : 'error',
    });

    return result;
  }
}

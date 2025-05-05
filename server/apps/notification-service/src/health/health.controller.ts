import { Controller, Injectable } from '@nestjs/common';
import { BaseHealthController } from '@app/common';
import {
  LoggingService,
  DatabaseLogMetadata,
  ErrorLogMetadata,
  NotificationLogMetadata,
} from '@app/logging';

/**
 * Service to check notification service dependencies
 */
@Injectable()
export class NotificationServiceHealthService {
  constructor(private readonly loggingService: LoggingService) {
    // Set context for all logs from this service
    this.loggingService.setContext(NotificationServiceHealthService.name);
  }

  /**
   * Check database connectivity
   * In a real implementation, this would check the actual database connection
   */
  async checkDatabase(): Promise<{ status: 'ok' | 'error'; details?: any }> {
    // Simulate database check
    const startTime = Date.now();

    // Create database metadata for logging
    const dbMetadata: DatabaseLogMetadata = {
      operation: 'query',
      table: 'system',
      duration: 0, // Will be updated after operation
    };

    this.loggingService.debug<DatabaseLogMetadata>(
      'Checking database connectivity',
      'checkDatabase',
      dbMetadata,
    );

    try {
      // Simulate a database query
      await new Promise((resolve) => setTimeout(resolve, 10));

      const duration = Date.now() - startTime;

      const result = {
        status: 'ok' as const,
        details: {
          responseTime: duration,
          connection: 'established',
        },
      };

      // Update metadata with actual duration
      const successMetadata: DatabaseLogMetadata = {
        ...dbMetadata,
        duration,
        recordCount: 1,
      };

      this.loggingService.debug<DatabaseLogMetadata>(
        'Database connectivity check successful',
        'checkDatabase',
        successMetadata,
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack =
        error instanceof Error && process.env.NODE_ENV !== 'production'
          ? error.stack
          : undefined;

      // Create error metadata
      const errorMetadata: ErrorLogMetadata = {
        errorName: error instanceof Error ? error.name : 'UnknownError',
        errorCode: 'DB_CONN_ERROR',
        stack: errorStack,
      };

      // Log the error with type-safe metadata
      this.loggingService.error<ErrorLogMetadata>(
        `Database connectivity check failed: ${errorMessage}`,
        errorStack,
        'checkDatabase',
        errorMetadata,
      );

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
export class NotificationServiceHealthController extends BaseHealthController {
  constructor(
    private readonly healthService: NotificationServiceHealthService,
    private readonly loggingService: LoggingService,
  ) {
    super();
    // Set context for all logs from this controller
    this.loggingService.setContext(NotificationServiceHealthController.name);
  }

  protected getServiceName(): string {
    return 'notification-service';
  }

  protected async checkComponents(): Promise<
    Record<string, { status: 'ok' | 'error'; details?: any }>
  > {
    // Create notification metadata for health check
    const startMetadata: NotificationLogMetadata = {
      notificationType: 'health-check',
      channel: 'internal',
    };

    this.loggingService.debug<NotificationLogMetadata>(
      'Checking health components',
      'checkComponents',
      startMetadata,
    );

    // Get the base components (system check)
    const baseComponents = await super.checkComponents();

    // Add service-specific component checks
    const dbStatus = await this.healthService.checkDatabase();

    const result = {
      ...baseComponents,
      database: dbStatus,
    };

    // Determine overall status
    const isHealthy = Object.values(result).every(
      (comp) => comp.status === 'ok',
    );

    // Create result metadata
    const resultMetadata: NotificationLogMetadata = {
      notificationType: 'health-check-result',
      channel: 'internal',
      success: isHealthy,
    };

    this.loggingService.debug<NotificationLogMetadata>(
      'Health check completed',
      'checkComponents',
      resultMetadata,
    );

    return result;
  }
}

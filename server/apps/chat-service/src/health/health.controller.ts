import { Controller, Injectable } from '@nestjs/common';
import { BaseHealthController } from '@app/common';
import {
  LoggingService,
  DatabaseLogMetadata,
  ErrorLoggerService,
} from '@app/logging';

/**
 * Service to check chat service dependencies
 */
@Injectable()
export class ChatServiceHealthService {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    // Set context for all logs from this service
    this.loggingService.setContext(ChatServiceHealthService.name);
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
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack =
        error instanceof Error && process.env.NODE_ENV !== 'production'
          ? error.stack
          : undefined;

      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Database connectivity check failed', {
        source: ChatServiceHealthService.name,
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
export class ChatServiceHealthController extends BaseHealthController {
  constructor(
    private readonly healthService: ChatServiceHealthService,
    private readonly loggingService: LoggingService,
  ) {
    super();
    // Set context for all logs from this controller
    this.loggingService.setContext(ChatServiceHealthController.name);
  }

  protected getServiceName(): string {
    return 'chat-service';
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

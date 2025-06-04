import { Controller, Injectable } from '@nestjs/common';
import { BaseHealthController } from '@app/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { ChatDatabaseService } from '../database/chat-database.service';

/**
 * Service to check chat service dependencies
 */
@Injectable()
export class ChatServiceHealthService {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly databaseService: ChatDatabaseService,
  ) {
    // Set context for all logs from this service
    this.loggingService.setContext(ChatServiceHealthService.name);
  }

  /**
   * Check database connectivity
   * Uses the database service to check the actual MongoDB connection
   */
  async checkDatabase(): Promise<{ status: 'ok' | 'error'; details?: any }> {
    this.loggingService.debug('Checking MongoDB connectivity', 'checkDatabase');

    try {
      // Use the database service to check connectivity
      return await this.databaseService.checkConnection();
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack =
        error instanceof Error && process.env.NODE_ENV !== 'production'
          ? error.stack
          : undefined;

      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'MongoDB connectivity check failed',
        {
          source: ChatServiceHealthService.name,
          method: 'checkDatabase',
          errorCode: 'MONGO_CONN_ERROR',
        },
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

import { Controller, Injectable } from '@nestjs/common';
import { BaseHealthController } from '@app/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { UserDatabaseService } from '../database/user-database.service';
import { Auth, AuthType } from '@app/security';

/**
 * Service to check database connectivity for the user service
 */
@Injectable()
export class UserServiceHealthService {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly databaseService: UserDatabaseService,
  ) {
    // Set context for all logs from this service
    this.loggingService.setContext(UserServiceHealthService.name);
  }

  /**
   * Check database connectivity
   * Uses the database service to check the actual database connection
   */
  async checkDatabase(): Promise<{ status: 'ok' | 'error'; details?: any }> {
    this.loggingService.debug(
      'Checking database connectivity',
      'checkDatabase',
    );

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
        'Database connectivity check failed',
        {
          source: UserServiceHealthService.name,
          method: 'checkDatabase',
          errorCode: 'DB_CONN_ERROR',
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
@Auth(AuthType.NONE)
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

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@app/database';
import { ErrorLoggerService, LoggingService } from '@app/logging';
import { DrizzleService } from '@app/database/drizzle/drizzle.service';
import * as schema from '@app/database/schemas';

/**
 * User Database Service
 *
 * Service for interacting with the User Service database.
 * This service provides a convenient way to access the database
 * and can be extended with additional functionality.
 */
@Injectable()
export class UserDatabaseService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserDatabaseService.name);
  }

  /**
   * Get the Drizzle service
   */
  get drizzle(): DrizzleService {
    return this.databaseService.drizzle;
  }

  /**
   * Get the user schema
   */
  get schema() {
    return schema.user;
  }

  /**
   * Check database connectivity
   * @returns Object with status and details
   */
  async checkConnection(): Promise<{ status: 'ok' | 'error'; details?: any }> {
    try {
      this.loggingService.debug(
        'Checking database connectivity',
        'checkConnection',
      );

      // Execute a simple query to check connectivity
      const startTime = Date.now();
      const result = await this.drizzle.db.execute(
        this.drizzle.sql`SELECT 1 as connected`,
      );
      const responseTime = Date.now() - startTime;

      if (result && result.rows && result.rows.length > 0) {
        this.loggingService.debug(
          'Database connectivity check successful',
          'checkConnection',
          {
            responseTime,
          },
        );

        return {
          status: 'ok',
          details: {
            responseTime,
            connection: 'established',
          },
        };
      }

      this.loggingService.error(
        'Database connectivity check failed: No result',
        'checkConnection',
      );
      return {
        status: 'error',
        details: {
          error: 'No result from database',
        },
      };
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.errorLogger.error(error, 'Database connectivity check failed', {
        source: UserDatabaseService.name,
        method: 'checkConnection',
        errorCode: 'DB_CONN_ERROR',
      });

      return {
        status: 'error',
        details: {
          error: errorMessage,
        },
      };
    }
  }
}

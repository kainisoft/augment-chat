import { Controller, Injectable } from '@nestjs/common';
import { BaseHealthController } from '@app/common';
import {
  LoggingService,
  DatabaseLogMetadata,
  ErrorLoggerService,
} from '@app/logging';
import { RedisHealthIndicator } from '@app/redis/health/redis-health.indicator';
import { DatabaseService } from '@app/database';
import { Auth, AuthType } from '@app/security';

/**
 * Service to check auth service dependencies
 */
@Injectable()
@Auth(AuthType.NONE)
export class AuthServiceHealthService {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly redisHealthIndicator: RedisHealthIndicator,
    private readonly errorLogger: ErrorLoggerService,
    private readonly databaseService: DatabaseService,
  ) {
    // Set context for all logs from this service
    this.loggingService.setContext(AuthServiceHealthService.name);
  }

  /**
   * Check Redis connectivity
   */
  async checkRedis(): Promise<{ status: 'ok' | 'error'; details?: any }> {
    const startTime = Date.now();

    this.loggingService.debug('Checking Redis connectivity', 'checkRedis', {
      service: 'redis',
    });

    try {
      // Use the Redis health indicator to check Redis
      const result = await this.redisHealthIndicator.check('redis');
      const duration = Date.now() - startTime;

      this.loggingService.debug(
        'Redis connectivity check successful',
        'checkRedis',
        {
          service: 'redis',
          duration,
          status: 'ok',
        },
      );

      return {
        status: 'ok',
        details: {
          ...result.redis,
          responseTime: duration,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack =
        error instanceof Error && process.env.NODE_ENV !== 'production'
          ? error.stack
          : undefined;

      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error instanceof Error ? error : new Error(errorMessage),
        'Redis connectivity check failed',
        {
          source: AuthServiceHealthService.name,
          method: 'checkRedis',
          errorCode: 'REDIS_CONN_ERROR',
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

  /**
   * Check database connectivity
   * Performs a real database connection check using a simple SQL query
   */
  async checkDatabase(): Promise<{ status: 'ok' | 'error'; details?: any }> {
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
      // Execute a simple SQL query to check database connectivity
      const result = await this.databaseService.drizzle.db.execute(
        this.databaseService.drizzle.sql`SELECT 1 as connected`,
      );

      const duration = Date.now() - startTime;
      const connected =
        result.rows && result.rows.length > 0 && result.rows[0].connected === 1;

      if (!connected) {
        throw new Error('Database connection check failed');
      }

      const successResult = {
        status: 'ok' as const,
        details: {
          responseTime: duration,
          connection: 'established',
          database: 'auth_db',
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

      return successResult;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack =
        error instanceof Error && process.env.NODE_ENV !== 'production'
          ? error.stack
          : undefined;

      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error instanceof Error ? error : new Error(errorMessage),
        'Database connectivity check failed',
        {
          source: AuthServiceHealthService.name,
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
export class AuthServiceHealthController extends BaseHealthController {
  constructor(
    private readonly healthService: AuthServiceHealthService,
    private readonly loggingService: LoggingService,
  ) {
    super();
    // Set context for all logs from this controller
    this.loggingService.setContext(AuthServiceHealthController.name);
  }

  protected getServiceName(): string {
    return 'auth-service';
  }

  protected async checkComponents(): Promise<
    Record<string, { status: 'ok' | 'error'; details?: any }>
  > {
    this.loggingService.debug('Checking health components', 'checkComponents');

    // Get the base components (system check)
    const baseComponents = await super.checkComponents();

    // Add service-specific component checks
    const dbStatus = await this.healthService.checkDatabase();
    const redisStatus = await this.healthService.checkRedis();

    const result = {
      ...baseComponents,
      database: dbStatus,
      redis: redisStatus,
    };

    this.loggingService.debug('Health check completed', 'checkComponents', {
      status: Object.values(result).every((comp) => comp.status === 'ok')
        ? 'ok'
        : 'error',
    });

    return result;
  }
}

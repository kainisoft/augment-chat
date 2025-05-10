import { Controller, Injectable } from '@nestjs/common';
import { BaseHealthController } from '@app/common';
import {
  LoggingService,
  DatabaseLogMetadata,
  ErrorLogMetadata,
} from '@app/logging';
import { RedisHealthIndicator } from '@app/redis/health/redis-health.indicator';

/**
 * Service to check auth service dependencies
 */
@Injectable()
export class AuthServiceHealthService {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly redisHealthIndicator: RedisHealthIndicator,
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

      // Create error metadata
      const errorMetadata: ErrorLogMetadata = {
        errorName: error instanceof Error ? error.name : 'UnknownError',
        errorCode: 'REDIS_CONN_ERROR',
        stack: errorStack,
      };

      // Log the error with type-safe metadata
      this.loggingService.error<ErrorLogMetadata>(
        `Redis connectivity check failed: ${errorMessage}`,
        errorStack,
        'checkRedis',
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

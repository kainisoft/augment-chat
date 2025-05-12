import { Injectable } from '@nestjs/common';
import { LoggingService } from '../logging.service';

/**
 * Example service that uses the LoggingService
 */
@Injectable()
export class ExampleService {
  constructor(private readonly loggingService: LoggingService) {
    // Set the context for all logs from this service
    this.loggingService.setContext(ExampleService.name);
  }

  /**
   * Example method that logs messages at different levels
   */
  async doSomething(userId: string, correlationId?: string): Promise<void> {
    // Set user ID for tracking
    this.loggingService.setUserId(userId);

    // Set correlation ID for distributed tracing if provided
    if (correlationId) {
      this.loggingService.setCorrelationId(correlationId);
    }

    // Log at info level
    this.loggingService.log('Starting operation', 'doSomething', {
      operationId: '123',
    });

    try {
      // Simulate some work
      await this.simulateWork();

      // Log at debug level
      this.loggingService.debug('Operation details', 'doSomething', {
        details: 'Some detailed information',
        duration: 123,
      });

      // Log at info level
      this.loggingService.log('Operation completed successfully', 'doSomething');
    } catch (error) {
      // Log at error level with stack trace
      this.loggingService.error(
        `Operation failed: ${error.message}`,
        error.stack,
        'doSomething',
        {
          errorCode: error.code || 500,
        },
      );

      throw error;
    }
  }

  /**
   * Example method that logs a warning
   */
  warnAboutSomething(): void {
    this.loggingService.warn('Something might be wrong', 'warnAboutSomething', {
      details: 'Warning details',
    });
  }

  /**
   * Simulate some asynchronous work
   */
  private async simulateWork(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Simulate work with 80% success rate
      setTimeout(() => {
        const success = Math.random() > 0.2;
        if (success) {
          resolve();
        } else {
          const error = new Error('Simulated failure');
          error['code'] = 'OPERATION_FAILED';
          reject(error);
        }
      }, 100);
    });
  }
}

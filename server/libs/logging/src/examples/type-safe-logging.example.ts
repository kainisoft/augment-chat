import { Injectable } from '@nestjs/common';
import { LoggingService } from '../logging.service';
import { LogHelpers } from '../utils/log-helpers';
import { 
  HttpLogMetadata, 
  AuthLogMetadata, 
  UserLogMetadata,
  ChatLogMetadata,
  DatabaseLogMetadata,
  ErrorLogMetadata
} from '../interfaces/log-message.interface';

/**
 * Example service demonstrating type-safe logging
 */
@Injectable()
export class TypeSafeLoggingExample {
  constructor(private readonly loggingService: LoggingService) {
    // Set the context for all logs from this service
    this.loggingService.setContext(TypeSafeLoggingExample.name);
  }

  /**
   * Example of logging HTTP requests with type safety
   */
  logHttpExample(): void {
    // Using the helper method
    LogHelpers.logHttpRequest(
      this.loggingService,
      'GET',
      '/api/users',
      {
        statusCode: 200,
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        duration: 45,
        context: 'HttpExample'
      }
    );

    // Or using the typed metadata directly
    const httpMetadata: HttpLogMetadata = {
      method: 'POST',
      url: '/api/auth/login',
      statusCode: 401,
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      duration: 120,
    };

    this.loggingService.error(
      'Authentication failed',
      undefined,
      'HttpExample',
      httpMetadata
    );
  }

  /**
   * Example of logging authentication events with type safety
   */
  logAuthExample(): void {
    // Using the helper method
    LogHelpers.logAuthEvent(
      this.loggingService,
      'login',
      true,
      {
        userId: 'user-123',
        username: 'john.doe',
        context: 'AuthExample'
      }
    );

    // Or using the typed metadata directly
    const authMetadata: AuthLogMetadata = {
      action: 'token-refresh',
      userId: 'user-123',
      success: true,
    };

    this.loggingService.log(
      'Token refreshed successfully',
      'AuthExample',
      authMetadata
    );
  }

  /**
   * Example of logging user operations with type safety
   */
  logUserExample(): void {
    // Using the helper method
    const userMetadata = LogHelpers.createUserLogMetadata(
      'user-123',
      'update',
      {
        fields: ['email', 'name']
      }
    );

    this.loggingService.log(
      'User profile updated',
      'UserExample',
      userMetadata
    );
  }

  /**
   * Example of logging chat operations with type safety
   */
  logChatExample(): void {
    // Using the helper method
    const chatMetadata = LogHelpers.createChatLogMetadata(
      'send',
      {
        userId: 'user-123',
        roomId: 'room-456',
        messageId: 'msg-789'
      }
    );

    this.loggingService.log(
      'Message sent to chat room',
      'ChatExample',
      chatMetadata
    );
  }

  /**
   * Example of logging database operations with type safety
   */
  logDatabaseExample(): void {
    // Using the helper method
    const dbMetadata = LogHelpers.createDatabaseLogMetadata(
      'query',
      150,
      {
        table: 'users',
        recordCount: 25
      }
    );

    this.loggingService.debug(
      'Database query executed',
      'DatabaseExample',
      dbMetadata
    );
  }

  /**
   * Example of logging errors with type safety
   */
  logErrorExample(): void {
    try {
      // Simulate an error
      throw new Error('Something went wrong');
    } catch (error) {
      // Using the helper method
      const errorMetadata = LogHelpers.createErrorLogMetadata(
        error as Error,
        {
          errorCode: 'ERR_INTERNAL'
        }
      );

      this.loggingService.error(
        'An error occurred',
        (error as Error).stack,
        'ErrorExample',
        errorMetadata
      );
    }
  }

  /**
   * Run all examples
   */
  runAllExamples(): void {
    this.logHttpExample();
    this.logAuthExample();
    this.logUserExample();
    this.logChatExample();
    this.logDatabaseExample();
    this.logErrorExample();
  }
}

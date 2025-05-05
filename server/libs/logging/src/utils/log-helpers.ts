import {
  HttpLogMetadata,
  AuthLogMetadata,
  UserLogMetadata,
  ChatLogMetadata,
  NotificationLogMetadata,
  DatabaseLogMetadata,
  ErrorLogMetadata,
} from '../interfaces/log-message.interface';
import { LoggingService } from '../logging.service';

/**
 * Helper functions for creating typed log metadata
 */
export class LogHelpers {
  /**
   * Create HTTP log metadata
   * @param method HTTP method
   * @param url URL
   * @param options Additional options
   * @returns HTTP log metadata
   */
  static createHttpLogMetadata(
    method: string,
    url: string,
    options?: {
      statusCode?: number;
      ip?: string;
      userAgent?: string;
      requestId?: string;
      duration?: number;
    },
  ): HttpLogMetadata {
    return {
      method,
      url,
      statusCode: options?.statusCode,
      ip: options?.ip,
      userAgent: options?.userAgent,
      requestId: options?.requestId,
      duration: options?.duration,
    };
  }

  /**
   * Create auth log metadata
   * @param action Auth action
   * @param options Additional options
   * @returns Auth log metadata
   */
  static createAuthLogMetadata(
    action: string,
    options?: {
      userId?: string;
      username?: string;
      success?: boolean;
      requestId?: string;
    },
  ): AuthLogMetadata {
    return {
      action,
      userId: options?.userId,
      username: options?.username,
      success: options?.success,
      requestId: options?.requestId,
    };
  }

  /**
   * Create user log metadata
   * @param userId User ID
   * @param action User action
   * @param options Additional options
   * @returns User log metadata
   */
  static createUserLogMetadata(
    userId: string,
    action: string,
    options?: {
      fields?: string[];
      requestId?: string;
    },
  ): UserLogMetadata {
    return {
      userId,
      action,
      fields: options?.fields,
      requestId: options?.requestId,
    };
  }

  /**
   * Create chat log metadata
   * @param action Chat action
   * @param options Additional options
   * @returns Chat log metadata
   */
  static createChatLogMetadata(
    action: string,
    options?: {
      userId?: string;
      roomId?: string;
      messageId?: string;
      requestId?: string;
    },
  ): ChatLogMetadata {
    return {
      action,
      userId: options?.userId,
      roomId: options?.roomId,
      messageId: options?.messageId,
      requestId: options?.requestId,
    };
  }

  /**
   * Create notification log metadata
   * @param notificationType Notification type
   * @param options Additional options
   * @returns Notification log metadata
   */
  static createNotificationLogMetadata(
    notificationType: string,
    options?: {
      userId?: string;
      notificationId?: string;
      channel?: string;
      success?: boolean;
      requestId?: string;
    },
  ): NotificationLogMetadata {
    return {
      notificationType,
      userId: options?.userId,
      notificationId: options?.notificationId,
      channel: options?.channel,
      success: options?.success,
      requestId: options?.requestId,
    };
  }

  /**
   * Create database log metadata
   * @param operation Database operation
   * @param duration Operation duration
   * @param options Additional options
   * @returns Database log metadata
   */
  static createDatabaseLogMetadata(
    operation: string,
    duration: number,
    options?: {
      table?: string;
      collection?: string;
      recordCount?: number;
      requestId?: string;
    },
  ): DatabaseLogMetadata {
    return {
      operation,
      duration,
      table: options?.table,
      collection: options?.collection,
      recordCount: options?.recordCount,
      requestId: options?.requestId,
    };
  }

  /**
   * Create error log metadata
   * @param error Error object
   * @param options Additional options
   * @returns Error log metadata
   */
  static createErrorLogMetadata(
    error: Error,
    options?: {
      errorCode?: string | number;
      requestId?: string;
    },
  ): ErrorLogMetadata {
    return {
      errorName: error.name,
      errorCode: options?.errorCode,
      stack: error.stack,
      requestId: options?.requestId,
    };
  }

  /**
   * Log HTTP request
   * @param logger Logging service
   * @param method HTTP method
   * @param url URL
   * @param options Additional options
   */
  static logHttpRequest(
    logger: LoggingService,
    method: string,
    url: string,
    options?: {
      statusCode?: number;
      ip?: string;
      userAgent?: string;
      requestId?: string;
      duration?: number;
      context?: string;
    },
  ): void {
    const metadata = this.createHttpLogMetadata(method, url, options);
    const message = `${method} ${url}${
      options?.statusCode ? ` - ${options.statusCode}` : ''
    }${options?.duration ? ` - ${options.duration}ms` : ''}`;

    if (options?.statusCode && options.statusCode >= 400) {
      logger.error(message, undefined, options?.context, metadata);
    } else {
      logger.log(message, options?.context, metadata);
    }
  }

  /**
   * Log auth event
   * @param logger Logging service
   * @param action Auth action
   * @param success Whether the action was successful
   * @param options Additional options
   */
  static logAuthEvent(
    logger: LoggingService,
    action: string,
    success: boolean,
    options?: {
      userId?: string;
      username?: string;
      requestId?: string;
      context?: string;
      error?: Error;
    },
  ): void {
    const metadata = this.createAuthLogMetadata(action, {
      userId: options?.userId,
      username: options?.username,
      success,
      requestId: options?.requestId,
    });

    const message = `Auth ${action} ${success ? 'succeeded' : 'failed'}${
      options?.username ? ` for user ${options.username}` : ''
    }`;

    if (success) {
      logger.log(message, options?.context, metadata);
    } else {
      logger.error(message, options?.error?.stack, options?.context, metadata);
    }
  }
}

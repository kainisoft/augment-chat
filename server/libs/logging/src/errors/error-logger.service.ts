import { Injectable } from '@nestjs/common';
import { LoggingService } from '../logging.service';
import { AppError } from '@app/common/errors/app-error';
import { ErrorFactory } from '@app/common/errors/error-factory';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Error context information
 */
export interface ErrorContext {
  /**
   * The service or component where the error occurred
   */
  source?: string;

  /**
   * The method or function where the error occurred
   */
  method?: string;

  /**
   * The correlation ID for tracking errors across services
   */
  correlationId?: string;

  /**
   * The request ID for tracking errors within a request
   */
  requestId?: string;

  /**
   * The user ID if the error is associated with a user
   */
  userId?: string;

  /**
   * Additional context information
   */
  [key: string]: any;
}

/**
 * Enhanced error logging service
 *
 * Provides structured error logging with severity levels, correlation IDs,
 * and automatic error conversion.
 */
@Injectable()
export class ErrorLoggerService {
  constructor(private readonly loggingService: LoggingService) {}

  /**
   * Log an error with debug severity
   * @param error The error
   * @param message Optional message
   * @param context Error context
   */
  debug(error: Error | string, message?: string, context?: ErrorContext): void {
    this.logError(error, ErrorSeverity.DEBUG, message, context);
  }

  /**
   * Log an error with info severity
   * @param error The error
   * @param message Optional message
   * @param context Error context
   */
  info(error: Error | string, message?: string, context?: ErrorContext): void {
    this.logError(error, ErrorSeverity.INFO, message, context);
  }

  /**
   * Log an error with warning severity
   * @param error The error
   * @param message Optional message
   * @param context Error context
   */
  warning(
    error: Error | string,
    message?: string,
    context?: ErrorContext,
  ): void {
    this.logError(error, ErrorSeverity.WARNING, message, context);
  }

  /**
   * Log an error with error severity
   * @param error The error
   * @param message Optional message
   * @param context Error context
   */
  error(error: Error | string, message?: string, context?: ErrorContext): void {
    this.logError(error, ErrorSeverity.ERROR, message, context);
  }

  /**
   * Log an error with critical severity
   * @param error The error
   * @param message Optional message
   * @param context Error context
   */
  critical(
    error: Error | string,
    message?: string,
    context?: ErrorContext,
  ): void {
    this.logError(error, ErrorSeverity.CRITICAL, message, context);
  }

  /**
   * Log an error with the specified severity
   * @param error The error
   * @param severity The error severity
   * @param message Optional message
   * @param context Error context
   */
  private logError(
    error: Error | string,
    severity: ErrorSeverity,
    message?: string,
    context?: ErrorContext,
  ): void {
    // Convert string to error if needed
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    // Convert to AppError
    const appError =
      errorObj instanceof AppError
        ? errorObj
        : ErrorFactory.fromError(errorObj);

    // Create log message
    const logMessage = message || appError.message;

    // Set context for logging
    const contextName = context?.source || 'ErrorLogger';
    this.loggingService.setContext(contextName);

    // Set correlation ID if provided
    if (context?.correlationId) {
      this.loggingService.setCorrelationId(context.correlationId);
    }

    // Set request ID if provided
    if (context?.requestId) {
      this.loggingService.setRequestId(context.requestId);
    }

    // Create metadata
    const metadata = {
      errorName: appError.name,
      errorCode: appError.code,
      statusCode: appError.statusCode,
      severity,
      method: context?.method,
      ...(appError.metadata || {}),
      ...(context || {}),
    };

    // Log based on severity
    switch (severity) {
      case ErrorSeverity.DEBUG:
        this.loggingService.debug(logMessage, context?.method, metadata);
        break;
      case ErrorSeverity.INFO:
        this.loggingService.log(logMessage, context?.method, metadata);
        break;
      case ErrorSeverity.WARNING:
        this.loggingService.warn(logMessage, context?.method, metadata);
        break;
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        this.loggingService.error(
          logMessage,
          appError.stack,
          context?.method,
          metadata,
        );
        break;
    }
  }
}

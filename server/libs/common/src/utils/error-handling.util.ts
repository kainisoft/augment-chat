/**
 * Error Handling Utilities
 *
 * Centralized error handling utilities to standardize error patterns
 * across all shared modules and services.
 */

import {
  AppError,
  DomainError,
  AuthError,
  InfrastructureError,
  ValidationError,
  ErrorCode,
  ErrorFactory,
} from '../errors';
import { HttpException } from '@nestjs/common';

/**
 * Error transformation utilities
 */
export class ErrorTransformer {
  /**
   * Transform any error to a standardized AppError
   * @param error - Error to transform
   * @param context - Additional context for the error
   * @returns Standardized AppError
   */
  static toAppError(error: unknown, context?: string): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return ErrorFactory.fromError(error);
    }

    // Handle string errors
    if (typeof error === 'string') {
      return new AppError(error, ErrorCode.UNKNOWN_ERROR, 500, {
        context,
        originalType: 'string',
      });
    }

    // Handle unknown errors
    return new AppError(
      'An unknown error occurred',
      ErrorCode.UNKNOWN_ERROR,
      500,
      { context, originalType: typeof error, originalValue: String(error) },
    );
  }

  /**
   * Transform domain errors to appropriate HTTP exceptions
   * @param error - Domain error to transform
   * @returns HTTP exception
   */
  static toHttpException(error: DomainError): HttpException {
    return new HttpException(
      {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        metadata: error.metadata,
      },
      error.statusCode,
    );
  }

  /**
   * Extract error message safely from any error type
   * @param error - Error to extract message from
   * @returns Error message
   */
  static extractMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as any).message);
    }

    return 'An unknown error occurred';
  }

  /**
   * Extract error code safely from any error type
   * @param error - Error to extract code from
   * @returns Error code
   */
  static extractCode(error: unknown): ErrorCode {
    if (error instanceof AppError) {
      return error.code;
    }

    if (error instanceof HttpException) {
      const status = error.getStatus();
      switch (status) {
        case 400:
          return ErrorCode.VALIDATION_ERROR;
        case 401:
          return ErrorCode.UNAUTHORIZED;
        case 403:
          return ErrorCode.FORBIDDEN;
        case 404:
          return ErrorCode.NOT_FOUND;
        case 409:
          return ErrorCode.CONFLICT;
        case 422:
          return ErrorCode.VALIDATION_ERROR;
        case 429:
          return ErrorCode.RATE_LIMIT_EXCEEDED;
        case 500:
          return ErrorCode.INTERNAL_SERVER_ERROR;
        default:
          return ErrorCode.UNKNOWN_ERROR;
      }
    }

    return ErrorCode.UNKNOWN_ERROR;
  }
}

/**
 * Error validation utilities
 */
export class ErrorValidator {
  /**
   * Check if error is a domain error
   * @param error - Error to check
   * @returns True if domain error
   */
  static isDomainError(error: unknown): error is DomainError {
    return error instanceof DomainError;
  }

  /**
   * Check if error is an auth error
   * @param error - Error to check
   * @returns True if auth error
   */
  static isAuthError(error: unknown): error is AuthError {
    return error instanceof AuthError;
  }

  /**
   * Check if error is an infrastructure error
   * @param error - Error to check
   * @returns True if infrastructure error
   */
  static isInfrastructureError(error: unknown): error is InfrastructureError {
    return error instanceof InfrastructureError;
  }

  /**
   * Check if error is a validation error
   * @param error - Error to check
   * @returns True if validation error
   */
  static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }

  /**
   * Check if error is retryable
   * @param error - Error to check
   * @returns True if error is retryable
   */
  static isRetryable(error: unknown): boolean {
    if (error instanceof AppError) {
      const retryableCodes = [
        ErrorCode.NETWORK_ERROR,
        ErrorCode.DATABASE_CONNECTION_ERROR,
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        ErrorCode.REDIS_ERROR,
        ErrorCode.RATE_LIMIT_EXCEEDED,
      ];
      return retryableCodes.includes(error.code);
    }

    if (error instanceof HttpException) {
      const status = error.getStatus();
      // Retry on 5xx errors and 429 (rate limit)
      return status >= 500 || status === 429;
    }

    return false;
  }

  /**
   * Check if error should be logged
   * @param error - Error to check
   * @returns True if error should be logged
   */
  static shouldLog(error: unknown): boolean {
    if (error instanceof AppError) {
      // Don't log validation errors and client errors
      const noLogCodes = [
        ErrorCode.VALIDATION_ERROR,
        ErrorCode.INVALID_INPUT,
        ErrorCode.BAD_REQUEST,
      ];
      return !noLogCodes.includes(error.code);
    }

    if (error instanceof HttpException) {
      const status = error.getStatus();
      // Don't log 4xx client errors except 401, 403
      return status < 400 || status >= 500 || status === 401 || status === 403;
    }

    return true;
  }
}

/**
 * Error context utilities
 */
export class ErrorContext {
  /**
   * Create error context for a service operation
   * @param service - Service name
   * @param method - Method name
   * @param params - Method parameters
   * @returns Error context
   */
  static forService(
    service: string,
    method: string,
    params?: Record<string, any>,
  ) {
    return {
      service,
      method,
      params: params ? this.sanitizeParams(params) : undefined,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create error context for a controller operation
   * @param controller - Controller name
   * @param action - Action name
   * @param request - Request information
   * @returns Error context
   */
  static forController(
    controller: string,
    action: string,
    request?: { method?: string; url?: string; ip?: string },
  ) {
    return {
      controller,
      action,
      request: request
        ? {
            method: request.method,
            url: request.url,
            ip: request.ip,
          }
        : undefined,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create error context for a repository operation
   * @param repository - Repository name
   * @param operation - Operation name
   * @param entity - Entity information
   * @returns Error context
   */
  static forRepository(
    repository: string,
    operation: string,
    entity?: { type?: string; id?: string },
  ) {
    return {
      repository,
      operation,
      entity,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Sanitize parameters for logging (remove sensitive data)
   * @param params - Parameters to sanitize
   * @returns Sanitized parameters
   */
  private static sanitizeParams(
    params: Record<string, any>,
  ): Record<string, any> {
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
    ];
    const sanitized = { ...params };

    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

/**
 * Error aggregation utilities
 */
export class ErrorAggregator {
  /**
   * Combine multiple errors into a single error
   * @param errors - Errors to combine
   * @param message - Combined error message
   * @returns Combined error
   */
  static combine(errors: Error[], message?: string): AppError {
    if (errors.length === 0) {
      return new AppError('No errors to combine', ErrorCode.UNKNOWN_ERROR, 500);
    }

    if (errors.length === 1) {
      return ErrorTransformer.toAppError(errors[0]);
    }

    const combinedMessage =
      message ||
      `Multiple errors occurred: ${errors.map((e) => e.message).join('; ')}`;
    const firstError = ErrorTransformer.toAppError(errors[0]);

    return new AppError(
      combinedMessage,
      firstError.code,
      firstError.statusCode,
      {
        errorCount: errors.length,
        errors: errors.map((e) => ({
          message: e.message,
          name: e.name,
          code: ErrorTransformer.extractCode(e),
        })),
      },
    );
  }

  /**
   * Create validation error from multiple field errors
   * @param fieldErrors - Field-specific errors
   * @param message - Overall validation message
   * @returns Validation error
   */
  static validationError(
    fieldErrors: Record<string, string[]>,
    message = 'Validation failed',
  ): ValidationError {
    return new ValidationError(message, {
      fields: fieldErrors,
      errorCount: Object.values(fieldErrors).flat().length,
    });
  }
}

/**
 * Export all error handling utilities
 */
export const ErrorUtils = {
  Transformer: ErrorTransformer,
  Validator: ErrorValidator,
  Context: ErrorContext,
  Aggregator: ErrorAggregator,
} as const;

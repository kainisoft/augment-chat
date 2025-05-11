import { HttpException, HttpStatus } from '@nestjs/common';
import { AppError, ErrorCode } from './app-error';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
} from './domain-error';
import {
  InvalidCredentialsError,
  InvalidTokenError,
  ExpiredTokenError,
  AccountInactiveError,
} from './auth-error';
import {
  DatabaseError,
  RedisError,
  NetworkError,
  ExternalServiceError,
} from './infrastructure-error';

/**
 * Error factory for creating application errors
 */
export class ErrorFactory {
  /**
   * Create an application error from a NestJS HttpException
   *
   * @param exception The HttpException
   * @returns An AppError
   */
  static fromHttpException(exception: HttpException): AppError {
    const status = exception.getStatus();
    const response = exception.getResponse();

    let message: string;
    let metadata: Record<string, any> | undefined;

    if (typeof response === 'object' && response !== null) {
      message = (response as any).message || exception.message;

      // Extract metadata from response
      const { message: _, ...rest } = response as any;
      metadata = Object.keys(rest).length > 0 ? rest : undefined;
    } else {
      message = exception.message;
    }

    // Map HTTP status to appropriate error
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return new ValidationError(message, metadata);
      case HttpStatus.UNAUTHORIZED:
        return new UnauthorizedError(message, metadata);
      case HttpStatus.FORBIDDEN:
        return new ForbiddenError(message, metadata);
      case HttpStatus.NOT_FOUND:
        return new NotFoundError(message, metadata);
      case HttpStatus.CONFLICT:
        return new ConflictError(message, metadata);
      default:
        return new AppError(message, ErrorCode.UNKNOWN_ERROR, status, metadata);
    }
  }

  /**
   * Create an application error from any error
   *
   * @param error The error
   * @returns An AppError
   */
  static fromError(error: Error): AppError {
    // If it's already an AppError, return it
    if (error instanceof AppError) {
      return error;
    }

    // If it's a NestJS HttpException, convert it
    if (error instanceof HttpException) {
      return this.fromHttpException(error);
    }

    // Otherwise, create a generic AppError
    return new AppError(
      error.message || 'An unknown error occurred',
      ErrorCode.UNKNOWN_ERROR,
      500,
      undefined,
      error,
    );
  }
}

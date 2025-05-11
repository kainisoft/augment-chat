import { AppError, ErrorCode } from './app-error';

/**
 * Base class for infrastructure errors
 *
 * Infrastructure errors represent errors that occur in the infrastructure layer,
 * such as database errors, external service errors, etc.
 */
export class InfrastructureError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 500,
    metadata?: Record<string, any>,
    cause?: Error,
  ) {
    super(message, code, statusCode, metadata, cause);
  }
}

/**
 * Error thrown when a database error occurs
 */
export class DatabaseError extends InfrastructureError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.DATABASE_ERROR, 500, metadata, cause);
  }
}

/**
 * Error thrown when a Redis error occurs
 */
export class RedisError extends InfrastructureError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.REDIS_ERROR, 500, metadata, cause);
  }
}

/**
 * Error thrown when a network error occurs
 */
export class NetworkError extends InfrastructureError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.NETWORK_ERROR, 500, metadata, cause);
  }
}

/**
 * Error thrown when an external service error occurs
 */
export class ExternalServiceError extends InfrastructureError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.EXTERNAL_SERVICE_ERROR, 500, metadata, cause);
  }
}

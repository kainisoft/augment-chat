/**
 * Error codes for the application
 */
export enum ErrorCode {
  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  BAD_REQUEST = 'BAD_REQUEST',

  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',

  // Domain-specific errors
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  ENTITY_STATE_ERROR = 'ENTITY_STATE_ERROR',
  ENTITY_RELATIONSHIP_ERROR = 'ENTITY_RELATIONSHIP_ERROR',
  DOMAIN_SERVICE_ERROR = 'DOMAIN_SERVICE_ERROR',
  VALUE_OBJECT_ERROR = 'VALUE_OBJECT_ERROR',
  AGGREGATE_ROOT_ERROR = 'AGGREGATE_ROOT_ERROR',

  // Infrastructure errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR = 'DATABASE_QUERY_ERROR',
  DATABASE_TRANSACTION_ERROR = 'DATABASE_TRANSACTION_ERROR',
  DATABASE_CONSTRAINT_ERROR = 'DATABASE_CONSTRAINT_ERROR',
  DATABASE_MIGRATION_ERROR = 'DATABASE_MIGRATION_ERROR',
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  REDIS_ERROR = 'REDIS_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Recovery errors
  CIRCUIT_OPEN = 'CIRCUIT_OPEN',
  RETRY_EXHAUSTED = 'RETRY_EXHAUSTED',
}

/**
 * Error metadata interface
 */
export interface ErrorMetadata {
  /**
   * Additional context about the error
   */
  [key: string]: any;
}

/**
 * Error serialization format
 */
export interface SerializedError {
  /**
   * Error name
   */
  name: string;

  /**
   * Error message
   */
  message: string;

  /**
   * Error code
   */
  code: ErrorCode;

  /**
   * HTTP status code
   */
  statusCode: number;

  /**
   * Error metadata
   */
  metadata?: ErrorMetadata;

  /**
   * Error stack trace
   */
  stack?: string;

  /**
   * Cause of the error
   */
  cause?:
    | SerializedError
    | {
        name: string;
        message: string;
        stack?: string;
      };
}

/**
 * Base error class for the application
 *
 * All application errors should extend this class
 *
 * @template T - Type of metadata for this error
 */
export class AppError<T extends ErrorMetadata = ErrorMetadata> extends Error {
  /**
   * Error code
   */
  readonly code: ErrorCode;

  /**
   * HTTP status code
   */
  readonly statusCode: number;

  /**
   * Additional error metadata
   */
  readonly metadata?: T;

  /**
   * Original error if this error wraps another error
   */
  readonly cause?: Error;

  /**
   * Create a new AppError
   *
   * @param message Error message
   * @param code Error code
   * @param statusCode HTTP status code
   * @param metadata Additional error metadata
   * @param cause Original error if this error wraps another error
   */
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 500,
    metadata?: T,
    cause?: Error,
  ) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
    this.cause = cause;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to a plain object for logging or serialization
   */
  toJSON(): SerializedError {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      metadata: this.metadata,
      stack: this.stack,
      cause: this.cause
        ? this.cause instanceof AppError
          ? this.cause.toJSON()
          : {
              name: this.cause.name,
              message: this.cause.message,
              stack: this.cause.stack,
            }
        : undefined,
    };
  }

  /**
   * Create a new error with additional metadata
   * @param metadata Additional metadata to merge with existing metadata
   * @returns A new error instance with merged metadata
   */
  withMetadata(metadata: Partial<T>): AppError<T> {
    return new (this.constructor as any)(
      this.message,
      this.code,
      this.statusCode,
      { ...this.metadata, ...metadata } as T,
      this.cause,
    );
  }

  /**
   * Create a new error with a different message
   * @param message The new message
   * @returns A new error instance with the new message
   */
  withMessage(message: string): AppError<T> {
    return new (this.constructor as any)(
      message,
      this.code,
      this.statusCode,
      this.metadata,
      this.cause,
    );
  }

  /**
   * Create a new error with a different cause
   * @param cause The new cause
   * @returns A new error instance with the new cause
   */
  withCause(cause: Error): AppError<T> {
    return new (this.constructor as any)(
      this.message,
      this.code,
      this.statusCode,
      this.metadata,
      cause,
    );
  }
}

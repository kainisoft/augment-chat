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

  // Infrastructure errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  REDIS_ERROR = 'REDIS_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

/**
 * Base error class for the application
 *
 * All application errors should extend this class
 */
export class AppError extends Error {
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
  readonly metadata?: Record<string, any>;

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
    metadata?: Record<string, any>,
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
  toJSON(): Record<string, any> {
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
}

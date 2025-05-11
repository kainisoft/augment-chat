import { AppError, ErrorCode } from './app-error';

/**
 * Base class for authentication errors
 *
 * Authentication errors represent errors that occur during
 * authentication and authorization processes.
 */
export class AuthError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNAUTHORIZED,
    statusCode: number = 401,
    metadata?: Record<string, any>,
    cause?: Error,
  ) {
    super(message, code, statusCode, metadata, cause);
  }
}

/**
 * Error thrown when invalid credentials are provided
 */
export class InvalidCredentialsError extends AuthError {
  constructor(
    message: string = 'Invalid email or password',
    metadata?: Record<string, any>,
    cause?: Error,
  ) {
    super(message, ErrorCode.INVALID_CREDENTIALS, 401, metadata, cause);
  }
}

/**
 * Error thrown when an invalid token is provided
 */
export class InvalidTokenError extends AuthError {
  constructor(
    message: string = 'Invalid token',
    metadata?: Record<string, any>,
    cause?: Error,
  ) {
    super(message, ErrorCode.INVALID_TOKEN, 401, metadata, cause);
  }
}

/**
 * Error thrown when a token has expired
 */
export class ExpiredTokenError extends AuthError {
  constructor(
    message: string = 'Token has expired',
    metadata?: Record<string, any>,
    cause?: Error,
  ) {
    super(message, ErrorCode.EXPIRED_TOKEN, 401, metadata, cause);
  }
}

/**
 * Error thrown when an account is inactive
 */
export class AccountInactiveError extends AuthError {
  constructor(
    message: string = 'Account is inactive',
    metadata?: Record<string, any>,
    cause?: Error,
  ) {
    super(message, ErrorCode.ACCOUNT_INACTIVE, 401, metadata, cause);
  }
}

import { AppError, ErrorCode } from './app-error';

/**
 * Base class for domain errors
 *
 * Domain errors represent errors that occur in the domain layer
 * and are related to business rules and domain logic.
 */
export class DomainError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 400,
    metadata?: Record<string, any>,
    cause?: Error,
  ) {
    super(message, code, statusCode, metadata, cause);
  }
}

/**
 * Error thrown when a validation error occurs in the domain
 */
export class ValidationError extends DomainError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, metadata, cause);
  }
}

/**
 * Error thrown when an entity is not found
 */
export class NotFoundError extends DomainError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.NOT_FOUND, 404, metadata, cause);
  }
}

/**
 * Error thrown when there is a conflict with an existing entity
 */
export class ConflictError extends DomainError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.CONFLICT, 409, metadata, cause);
  }
}

/**
 * Error thrown when a user is not authorized to perform an action
 */
export class UnauthorizedError extends DomainError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.UNAUTHORIZED, 401, metadata, cause);
  }
}

/**
 * Error thrown when a user is forbidden from performing an action
 */
export class ForbiddenError extends DomainError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, ErrorCode.FORBIDDEN, 403, metadata, cause);
  }
}

import { AppError, ErrorCode, ErrorMetadata } from './app-error';

/**
 * Domain error metadata
 */
export interface DomainErrorMetadata extends ErrorMetadata {
  /**
   * Domain entity ID
   */
  entityId?: string;

  /**
   * Domain entity type
   */
  entityType?: string;

  /**
   * Domain operation
   */
  operation?: string;
}

/**
 * Validation error metadata
 */
export interface ValidationErrorMetadata extends DomainErrorMetadata {
  /**
   * Field-level validation errors
   */
  errors?: Record<string, string[]>;

  /**
   * Validation constraints
   */
  constraints?: Record<string, any>;
}

/**
 * Not found error metadata
 */
export interface NotFoundErrorMetadata extends DomainErrorMetadata {
  /**
   * Entity ID that was not found
   */
  id?: string | number;

  /**
   * Entity type that was not found
   */
  type?: string;
}

/**
 * Conflict error metadata
 */
export interface ConflictErrorMetadata extends DomainErrorMetadata {
  /**
   * Conflicting entity ID
   */
  conflictingId?: string | number;

  /**
   * Conflicting field
   */
  conflictingField?: string;
}

/**
 * Authorization error metadata
 */
export interface AuthorizationErrorMetadata extends DomainErrorMetadata {
  /**
   * User ID
   */
  userId?: string;

  /**
   * Required permissions
   */
  requiredPermissions?: string[];

  /**
   * User permissions
   */
  userPermissions?: string[];
}

/**
 * Base class for domain errors
 *
 * Domain errors represent errors that occur in the domain layer
 * and are related to business rules and domain logic.
 *
 * @template T - Type of metadata for this error
 */
export class DomainError<
  T extends DomainErrorMetadata = DomainErrorMetadata,
> extends AppError<T> {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 400,
    metadata?: T,
    cause?: Error,
  ) {
    super(message, code, statusCode, metadata, cause);
  }
}

/**
 * Error thrown when a validation error occurs in the domain
 */
export class ValidationError extends DomainError<ValidationErrorMetadata> {
  constructor(
    message: string,
    metadata?: ValidationErrorMetadata,
    cause?: Error,
  ) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, metadata, cause);
  }

  /**
   * Add field errors to the validation error
   * @param field Field name
   * @param errors Error messages
   * @returns A new validation error with the added field errors
   */
  addFieldError(field: string, errors: string | string[]): ValidationError {
    const errorMessages = Array.isArray(errors) ? errors : [errors];
    const currentErrors = this.metadata?.errors || {};

    const newMetadata = {
      ...this.metadata,
      errors: {
        ...currentErrors,
        [field]: errorMessages,
      },
    };

    return new ValidationError(this.message, newMetadata, this.cause);
  }
}

/**
 * Error thrown when an entity is not found
 */
export class NotFoundError extends DomainError<NotFoundErrorMetadata> {
  constructor(
    message: string,
    metadata?: NotFoundErrorMetadata,
    cause?: Error,
  ) {
    super(message, ErrorCode.NOT_FOUND, 404, metadata, cause);
  }

  /**
   * Create a not found error for an entity
   * @param entityType Entity type
   * @param id Entity ID
   * @returns A not found error
   */
  static forEntity(entityType: string, id: string | number): NotFoundError {
    return new NotFoundError(`${entityType} with ID ${id} not found`, {
      entityType,
      id,
      entityId: String(id),
    });
  }
}

/**
 * Error thrown when there is a conflict with an existing entity
 */
export class ConflictError extends DomainError<ConflictErrorMetadata> {
  constructor(
    message: string,
    metadata?: ConflictErrorMetadata,
    cause?: Error,
  ) {
    super(message, ErrorCode.CONFLICT, 409, metadata, cause);
  }

  /**
   * Create a conflict error for a unique constraint
   * @param entityType Entity type
   * @param field Field name
   * @param value Field value
   * @returns A conflict error
   */
  static uniqueConstraint(
    entityType: string,
    field: string,
    value: string | number,
  ): ConflictError {
    return new ConflictError(
      `${entityType} with ${field} '${value}' already exists`,
      {
        entityType,
        conflictingField: field,
        [field]: value,
      },
    );
  }
}

/**
 * Error thrown when a user is not authorized to perform an action
 */
export class UnauthorizedError extends DomainError<AuthorizationErrorMetadata> {
  constructor(
    message: string,
    metadata?: AuthorizationErrorMetadata,
    cause?: Error,
  ) {
    super(message, ErrorCode.UNAUTHORIZED, 401, metadata, cause);
  }
}

/**
 * Error thrown when a user is forbidden from performing an action
 */
export class ForbiddenError extends DomainError<AuthorizationErrorMetadata> {
  constructor(
    message: string,
    metadata?: AuthorizationErrorMetadata,
    cause?: Error,
  ) {
    super(message, ErrorCode.FORBIDDEN, 403, metadata, cause);
  }

  /**
   * Create a forbidden error for missing permissions
   * @param userId User ID
   * @param requiredPermissions Required permissions
   * @param userPermissions User permissions
   * @returns A forbidden error
   */
  static missingPermissions(
    userId: string,
    requiredPermissions: string[],
    userPermissions: string[] = [],
  ): ForbiddenError {
    return new ForbiddenError(
      'Insufficient permissions to perform this action',
      {
        userId,
        requiredPermissions,
        userPermissions,
      },
    );
  }
}

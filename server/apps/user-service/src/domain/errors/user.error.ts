import {
  NotFoundError,
  ConflictError,
  EntityStateError,
  ErrorCode,
} from '@app/common/errors';

/**
 * User Not Found Error
 */
export class UserNotFoundError extends NotFoundError {
  /**
   * Create a new user not found error
   * @param id - The ID of the user that was not found
   */
  constructor(id: string) {
    super(`User with ID ${id} not found`, {
      entityType: 'User',
      entityId: id,
    });
    this.name = 'UserNotFoundError';
    Object.defineProperty(this, 'code', { value: ErrorCode.USER_NOT_FOUND });
  }

  /**
   * Create a user not found error
   * @param id - The ID of the user that was not found
   * @returns A user not found error
   */
  static withId(id: string): UserNotFoundError {
    return new UserNotFoundError(id);
  }
}

/**
 * Username Already Exists Error
 */
export class UsernameAlreadyExistsError extends ConflictError {
  /**
   * Create a new username already exists error
   * @param username - The username that already exists
   */
  constructor(username: string) {
    super(`Username '${username}' is already taken`, {
      entityType: 'User',
      conflictingField: 'username',
      username,
    });
    this.name = 'UsernameAlreadyExistsError';
  }

  /**
   * Create a username already exists error
   * @param username - The username that already exists
   * @returns A username already exists error
   */
  static withUsername(username: string): UsernameAlreadyExistsError {
    return new UsernameAlreadyExistsError(username);
  }
}

/**
 * Invalid User Operation Error
 */
export class InvalidUserOperationError extends EntityStateError {
  /**
   * Create a new invalid user operation error
   * @param operation - The invalid operation
   * @param reason - The reason why the operation is invalid
   */
  constructor(operation: string, reason: string, userId?: string) {
    super(`Cannot perform operation '${operation}': ${reason}`, {
      entityType: 'User',
      entityId: userId,
      operation,
      reason,
    });
    this.name = 'InvalidUserOperationError';
  }
}

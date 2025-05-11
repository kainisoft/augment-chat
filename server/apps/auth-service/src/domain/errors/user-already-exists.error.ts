import { ConflictError, ErrorCode } from '@app/common/errors';

/**
 * User Already Exists Error
 *
 * Error thrown when attempting to create a user that already exists.
 */
export class UserAlreadyExistsError extends ConflictError {
  constructor(
    message: string = 'User with this email already exists',
    metadata?: Record<string, any>,
    cause?: Error,
  ) {
    super(message, { ...metadata, errorType: 'UserAlreadyExistsError' }, cause);
    this.name = 'UserAlreadyExistsError';
    Object.defineProperty(this, 'code', {
      value: ErrorCode.USER_ALREADY_EXISTS,
    });
  }
}

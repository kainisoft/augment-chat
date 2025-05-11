import { NotFoundError, ErrorCode } from '@app/common/errors';

/**
 * User Not Found Error
 *
 * Error thrown when a user is not found.
 */
export class UserNotFoundError extends NotFoundError {
  constructor(
    message: string = 'User not found',
    metadata?: Record<string, any>,
    cause?: Error,
  ) {
    super(message, { ...metadata, errorType: 'UserNotFoundError' }, cause);
    this.name = 'UserNotFoundError';
    Object.defineProperty(this, 'code', { value: ErrorCode.USER_NOT_FOUND });
  }
}

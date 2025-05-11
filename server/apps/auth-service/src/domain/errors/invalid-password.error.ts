import { ValidationError, ErrorCode } from '@app/common/errors';

/**
 * Invalid Password Error
 *
 * Error thrown when an invalid password is provided.
 */
export class InvalidPasswordError extends ValidationError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, { ...metadata, errorType: 'InvalidPasswordError' }, cause);
    this.name = 'InvalidPasswordError';
    Object.defineProperty(this, 'code', { value: ErrorCode.INVALID_PASSWORD });
  }
}

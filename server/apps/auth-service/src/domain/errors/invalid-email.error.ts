import { ValidationError, ErrorCode } from '@app/common/errors';

/**
 * Invalid Email Error
 *
 * Error thrown when an invalid email is provided.
 */
export class InvalidEmailError extends ValidationError {
  constructor(message: string, metadata?: Record<string, any>, cause?: Error) {
    super(message, { ...metadata, errorType: 'InvalidEmailError' }, cause);
    this.name = 'InvalidEmailError';
    Object.defineProperty(this, 'code', { value: ErrorCode.INVALID_EMAIL });
  }
}

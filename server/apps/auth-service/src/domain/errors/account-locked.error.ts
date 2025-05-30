import { AuthError, ErrorCode } from '@app/common/errors';

/**
 * Error thrown when a user account is locked due to too many failed login attempts
 */
export class AccountLockedError extends AuthError {
  /**
   * Create a new AccountLockedError
   * @param lockedUntil - The date until which the account is locked
   */
  constructor(lockedUntil?: Date | null) {
    const message = lockedUntil
      ? `Account is locked until ${lockedUntil.toISOString()}`
      : 'Account is locked due to too many failed login attempts';

    super(message, ErrorCode.ACCOUNT_LOCKED, 423, {
      lockedUntil: lockedUntil?.toISOString(),
      errorType: 'AccountLockedError',
    });
    this.name = 'AccountLockedError';
  }
}

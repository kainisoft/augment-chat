import { UnauthorizedException } from '@nestjs/common';

/**
 * Error thrown when a user account is locked due to too many failed login attempts
 */
export class AccountLockedError extends UnauthorizedException {
  /**
   * Create a new AccountLockedError
   * @param lockedUntil - The date until which the account is locked
   */
  constructor(lockedUntil?: Date | null) {
    const message = lockedUntil
      ? `Account is locked until ${lockedUntil.toISOString()}`
      : 'Account is locked due to too many failed login attempts';

    super(message);
    this.name = 'AccountLockedError';
  }
}

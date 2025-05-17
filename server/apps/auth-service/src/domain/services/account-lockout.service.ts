import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../models/user.entity';

/**
 * Service for managing account lockout
 */
@Injectable()
export class AccountLockoutService {
  private readonly maxFailedAttempts: number;
  private readonly lockoutDurationMinutes: number;

  /**
   * Create a new AccountLockoutService
   * @param configService - The configuration service
   */
  constructor(private readonly configService: ConfigService) {
    this.maxFailedAttempts = this.configService.get<number>('AUTH_MAX_FAILED_LOGIN_ATTEMPTS', 5);
    this.lockoutDurationMinutes = this.configService.get<number>('AUTH_ACCOUNT_LOCKOUT_DURATION_MINUTES', 30);
  }

  /**
   * Check if a user account should be locked based on failed login attempts
   * @param user - The user to check
   * @returns True if the account should be locked, false otherwise
   */
  shouldLockAccount(user: User): boolean {
    return user.getFailedLoginAttempts() >= this.maxFailedAttempts;
  }

  /**
   * Lock a user account for the configured duration
   * @param user - The user to lock
   */
  lockAccount(user: User): void {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + this.lockoutDurationMinutes);
    user.lockUntil(lockUntil);
  }

  /**
   * Handle a failed login attempt for a user
   * @param user - The user who failed to log in
   * @returns True if the account was locked, false otherwise
   */
  handleFailedLoginAttempt(user: User): boolean {
    user.incrementFailedLoginAttempts();

    if (this.shouldLockAccount(user)) {
      this.lockAccount(user);
      return true;
    }

    return false;
  }

  /**
   * Handle a successful login for a user
   * @param user - The user who logged in successfully
   */
  handleSuccessfulLogin(user: User): void {
    user.resetFailedLoginAttempts();
    user.unlock();
  }
}

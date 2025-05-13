import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@app/redis';
import { LoggingService, ErrorLoggerService } from '@app/logging';

/**
 * Rate limit options
 */
export interface RateLimitOptions {
  /**
   * Maximum number of attempts
   */
  maxAttempts: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Block time in seconds after max attempts
   */
  blockSeconds: number;
}

/**
 * Rate Limit Service
 *
 * Handles rate limiting for authentication attempts using Redis
 */
@Injectable()
export class RateLimitService {
  private readonly keyPrefix = 'rate-limit:';
  private readonly blockKeyPrefix = 'rate-limit:block:';

  // Default rate limit options
  private readonly defaultOptions: RateLimitOptions = {
    maxAttempts: 5,
    windowSeconds: 60,
    blockSeconds: 300, // 5 minutes
  };

  // Rate limit options for different actions
  private readonly loginOptions: RateLimitOptions;
  private readonly registrationOptions: RateLimitOptions;
  private readonly passwordResetOptions: RateLimitOptions;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    // Set context for all logs from this service
    this.loggingService.setContext(RateLimitService.name);

    // Load rate limit options from config
    this.loginOptions = {
      maxAttempts: this.configService.get<number>(
        'RATE_LIMIT_LOGIN_MAX_ATTEMPTS',
        5,
      ),
      windowSeconds: this.configService.get<number>(
        'RATE_LIMIT_LOGIN_WINDOW',
        60,
      ),
      blockSeconds: this.configService.get<number>(
        'RATE_LIMIT_LOGIN_BLOCK',
        300,
      ),
    };

    this.registrationOptions = {
      maxAttempts: this.configService.get<number>(
        'RATE_LIMIT_REGISTRATION_MAX_ATTEMPTS',
        3,
      ),
      windowSeconds: this.configService.get<number>(
        'RATE_LIMIT_REGISTRATION_WINDOW',
        3600,
      ),
      blockSeconds: this.configService.get<number>(
        'RATE_LIMIT_REGISTRATION_BLOCK',
        86400,
      ),
    };

    this.passwordResetOptions = {
      maxAttempts: this.configService.get<number>(
        'RATE_LIMIT_PASSWORD_RESET_MAX_ATTEMPTS',
        3,
      ),
      windowSeconds: this.configService.get<number>(
        'RATE_LIMIT_PASSWORD_RESET_WINDOW',
        3600,
      ),
      blockSeconds: this.configService.get<number>(
        'RATE_LIMIT_PASSWORD_RESET_BLOCK',
        7200,
      ),
    };
  }

  /**
   * Check if an action is rate limited
   * @param key Rate limit key (e.g., IP address, username)
   * @param action Action type
   * @returns True if rate limited, false otherwise
   */
  async isRateLimited(
    key: string,
    action: 'login' | 'registration' | 'password-reset',
  ): Promise<boolean> {
    const options = this.getOptionsForAction(action);
    const rateLimitKey = `${this.keyPrefix}${action}:${key}`;
    const blockKey = `${this.blockKeyPrefix}${action}:${key}`;

    try {
      // Check if key is blocked
      const isBlocked = await this.redisService.get(blockKey);
      if (isBlocked) {
        this.loggingService.warn(
          `Rate limit exceeded for ${action} by ${key} (blocked)`,
          'isRateLimited',
          { key, action, blocked: true },
        );
        return true;
      }

      // Get current count
      const count = await this.redisService.get(rateLimitKey);
      const attempts = count ? parseInt(count, 10) : 0;

      // Check if rate limited
      if (attempts >= options.maxAttempts) {
        // Block the key
        await this.redisService.set(blockKey, '1', options.blockSeconds);

        this.loggingService.warn(
          `Rate limit exceeded for ${action} by ${key}, blocked for ${options.blockSeconds} seconds`,
          'isRateLimited',
          { key, action, attempts, blockSeconds: options.blockSeconds },
        );

        return true;
      }

      return false;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Error checking rate limit', {
        source: RateLimitService.name,
        method: 'isRateLimited',
        key,
        action,
      });

      // In case of error, allow the request to proceed
      return false;
    }
  }

  /**
   * Increment the rate limit counter
   * @param key Rate limit key (e.g., IP address, username)
   * @param action Action type
   * @returns Current attempt count
   */
  async increment(
    key: string,
    action: 'login' | 'registration' | 'password-reset',
  ): Promise<number> {
    const options = this.getOptionsForAction(action);
    const rateLimitKey = `${this.keyPrefix}${action}:${key}`;

    try {
      // Increment counter
      const count = await this.redisService.getClient().incr(rateLimitKey);

      // Set expiry if this is the first attempt
      if (count === 1) {
        await this.redisService.expire(rateLimitKey, options.windowSeconds);
      }

      this.loggingService.debug(
        `Incremented rate limit counter for ${action} by ${key} to ${count}`,
        'increment',
        { key, action, count, maxAttempts: options.maxAttempts },
      );

      return count;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Error incrementing rate limit counter', {
        source: RateLimitService.name,
        method: 'increment',
        key,
        action,
      });

      return 0;
    }
  }

  /**
   * Reset the rate limit counter
   * @param key Rate limit key (e.g., IP address, username)
   * @param action Action type
   * @returns True if reset successful
   */
  async reset(
    key: string,
    action: 'login' | 'registration' | 'password-reset',
  ): Promise<boolean> {
    const rateLimitKey = `${this.keyPrefix}${action}:${key}`;
    const blockKey = `${this.blockKeyPrefix}${action}:${key}`;

    try {
      // Delete both keys
      await this.redisService.del([rateLimitKey, blockKey]);

      this.loggingService.debug(
        `Reset rate limit for ${action} by ${key}`,
        'reset',
        { key, action },
      );

      return true;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Error resetting rate limit', {
        source: RateLimitService.name,
        method: 'reset',
        key,
        action,
      });

      return false;
    }
  }

  /**
   * Get rate limit options for an action
   * @param action Action type
   * @returns Rate limit options
   */
  private getOptionsForAction(
    action: 'login' | 'registration' | 'password-reset',
  ): RateLimitOptions {
    switch (action) {
      case 'login':
        return this.loginOptions;
      case 'registration':
        return this.registrationOptions;
      case 'password-reset':
        return this.passwordResetOptions;
      default:
        return this.defaultOptions;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { RedisService } from '@app/redis';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { RateLimitConfig } from '../decorators/rate-limit.decorator';
import { FastifyRequest } from 'fastify';

/**
 * Rate Limit Service
 *
 * Provides rate limiting functionality using Redis as the backend store.
 * This service can be used across all microservices for consistent
 * rate limiting behavior.
 */
@Injectable()
export class RateLimitService {
  private readonly keyPrefix = 'rate_limit:';

  constructor(
    private readonly redisService: RedisService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(RateLimitService.name);
  }

  /**
   * Check if a key is rate limited
   *
   * @param key - The key to check (e.g., IP address, user ID)
   * @param config - Rate limit configuration
   * @returns True if rate limited, false otherwise
   */
  async isRateLimited(key: string, config: RateLimitConfig): Promise<boolean> {
    const rateLimitKey = `${this.keyPrefix}${key}`;
    const blockKey = `${this.keyPrefix}block:${key}`;

    try {
      // Check if key is blocked
      const isBlocked = await this.redisService.get(blockKey);
      if (isBlocked) {
        this.loggingService.warn(
          `Rate limit exceeded for ${key} (blocked)`,
          'isRateLimited',
          { key, blocked: true, config },
        );
        return true;
      }

      // Get current count
      const count = await this.redisService.get(rateLimitKey);
      const attempts = count ? parseInt(count, 10) : 0;

      // Check if rate limited
      if (attempts >= config.maxAttempts) {
        // Block the key
        await this.redisService.set(blockKey, '1', config.blockSeconds);

        this.loggingService.warn(
          `Rate limit exceeded for ${key}, blocked for ${config.blockSeconds} seconds`,
          'isRateLimited',
          {
            key,
            attempts,
            maxAttempts: config.maxAttempts,
            blockSeconds: config.blockSeconds,
          },
        );

        return true;
      }

      return false;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Error checking rate limit',
        {
          source: RateLimitService.name,
          method: 'isRateLimited',
          key,
          config,
        },
      );

      // In case of error, allow the request to proceed
      return false;
    }
  }

  /**
   * Increment the rate limit counter
   *
   * @param key - The key to increment
   * @param config - Rate limit configuration
   * @returns Current attempt count
   */
  async increment(key: string, config: RateLimitConfig): Promise<number> {
    const rateLimitKey = `${this.keyPrefix}${key}`;

    try {
      // Increment counter
      const count = await this.redisService.getClient().incr(rateLimitKey);

      // Set expiry if this is the first attempt
      if (count === 1) {
        await this.redisService.expire(rateLimitKey, config.windowSeconds);
      }

      this.loggingService.debug(
        `Incremented rate limit counter for ${key} to ${count}`,
        'increment',
        {
          key,
          count,
          maxAttempts: config.maxAttempts,
          windowSeconds: config.windowSeconds,
        },
      );

      return count;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Error incrementing rate limit counter',
        {
          source: RateLimitService.name,
          method: 'increment',
          key,
          config,
        },
      );

      return 0;
    }
  }

  /**
   * Reset rate limit for a key
   *
   * @param key - The key to reset
   */
  async reset(key: string): Promise<void> {
    const rateLimitKey = `${this.keyPrefix}${key}`;
    const blockKey = `${this.keyPrefix}block:${key}`;

    try {
      await Promise.all([
        this.redisService.del(rateLimitKey),
        this.redisService.del(blockKey),
      ]);

      this.loggingService.log(`Reset rate limit for ${key}`, 'reset', { key });
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Error resetting rate limit',
        {
          source: RateLimitService.name,
          method: 'reset',
          key,
        },
      );
    }
  }

  /**
   * Get current rate limit status for a key
   *
   * @param key - The key to check
   * @param config - Rate limit configuration
   * @returns Rate limit status information
   */
  async getStatus(
    key: string,
    config: RateLimitConfig,
  ): Promise<{
    attempts: number;
    remaining: number;
    resetTime: number | null;
    isBlocked: boolean;
    blockExpiresAt: number | null;
  }> {
    const rateLimitKey = `${this.keyPrefix}${key}`;
    const blockKey = `${this.keyPrefix}block:${key}`;

    try {
      const [count, ttl, isBlocked, blockTtl] = await Promise.all([
        this.redisService.get(rateLimitKey),
        this.redisService.ttl(rateLimitKey),
        this.redisService.get(blockKey),
        this.redisService.ttl(blockKey),
      ]);

      const attempts = count ? parseInt(count, 10) : 0;
      const remaining = Math.max(0, config.maxAttempts - attempts);
      const resetTime = ttl > 0 ? Date.now() + ttl * 1000 : null;
      const blocked = !!isBlocked;
      const blockExpiresAt =
        blocked && blockTtl > 0 ? Date.now() + blockTtl * 1000 : null;

      return {
        attempts,
        remaining,
        resetTime,
        isBlocked: blocked,
        blockExpiresAt,
      };
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Error getting rate limit status',
        {
          source: RateLimitService.name,
          method: 'getStatus',
          key,
          config,
        },
      );

      // Return safe defaults on error
      return {
        attempts: 0,
        remaining: config.maxAttempts,
        resetTime: null,
        isBlocked: false,
        blockExpiresAt: null,
      };
    }
  }

  /**
   * Generate a default rate limit key from request
   *
   * @param req - The request object
   * @param action - The action being rate limited
   * @returns Generated key
   */
  generateKey(req: FastifyRequest, action: string): string {
    // Try to get user ID first, fallback to IP
    const userId = req.user?.id || req.user?.sub;
    if (userId) {
      return `user:${userId}:${action}`;
    }

    // Fallback to IP address
    const ip = req.ip || 'unknown';
    return `ip:${ip}:${action}`;
  }
}

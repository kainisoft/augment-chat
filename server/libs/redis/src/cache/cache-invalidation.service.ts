import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis.service';

/**
 * Cache invalidation strategy
 */
export enum CacheInvalidationStrategy {
  /**
   * Delete a specific key
   */
  KEY = 'key',

  /**
   * Delete all keys with a specific prefix
   */
  PREFIX = 'prefix',

  /**
   * Delete all keys matching a pattern
   */
  PATTERN = 'pattern',

  /**
   * Delete all keys
   */
  ALL = 'all',
}

/**
 * Cache invalidation options
 */
export interface CacheInvalidationOptions {
  /**
   * Whether to log invalidation operations
   * @default false
   */
  enableLogs?: boolean;
}

/**
 * Cache Invalidation Service
 *
 * This service provides methods for invalidating cached data in Redis.
 */
@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Invalidate a specific cache key
   * @param key Cache key
   * @param options Invalidation options
   * @returns Promise resolving to true if the key was deleted
   */
  async invalidateKey(
    key: string,
    options: CacheInvalidationOptions = {},
  ): Promise<boolean> {
    try {
      const result = await this.redisService.del(key);

      if (options.enableLogs) {
        this.logger.log(`Invalidated cache key: ${key}`);
      }

      return result === 1;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error invalidating cache key ${key}: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Invalidate all cache keys with a specific prefix
   * @param prefix Key prefix
   * @param options Invalidation options
   * @returns Promise resolving to the number of keys deleted
   */
  async invalidateByPrefix(
    prefix: string,
    options: CacheInvalidationOptions = {},
  ): Promise<number> {
    return this.invalidateByPattern(`${prefix}:*`, options);
  }

  /**
   * Invalidate all cache keys matching a pattern
   * @param pattern Key pattern (using Redis KEYS pattern syntax)
   * @param options Invalidation options
   * @returns Promise resolving to the number of keys deleted
   */
  async invalidateByPattern(
    pattern: string,
    options: CacheInvalidationOptions = {},
  ): Promise<number> {
    try {
      const client = this.redisService.getClient();

      // Find all keys matching the pattern
      const keys = await client.keys(pattern);

      if (keys.length === 0) {
        if (options.enableLogs) {
          this.logger.log(`No keys found matching pattern: ${pattern}`);
        }

        return 0;
      }

      // Delete all matching keys
      const result = await this.redisService.del(keys);

      if (options.enableLogs) {
        this.logger.log(
          `Invalidated ${result} keys matching pattern: ${pattern}`,
        );
      }

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error invalidating keys matching pattern ${pattern}: ${errorMessage}`,
      );
      return 0;
    }
  }

  /**
   * Invalidate all cache keys
   * @param options Invalidation options
   * @returns Promise resolving to the number of keys deleted
   */
  async invalidateAll(options: CacheInvalidationOptions = {}): Promise<number> {
    try {
      const client = this.redisService.getClient();

      // Find all keys
      const keys = await client.keys('*');

      if (keys.length === 0) {
        if (options.enableLogs) {
          this.logger.log('No keys found to invalidate');
        }

        return 0;
      }

      // Delete all keys
      const result = await this.redisService.del(keys);

      if (options.enableLogs) {
        this.logger.log(`Invalidated all ${result} keys`);
      }

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error invalidating all keys: ${errorMessage}`);
      return 0;
    }
  }

  /**
   * Invalidate cache using a specific strategy
   * @param strategy Invalidation strategy
   * @param key Key, prefix, or pattern (depending on the strategy)
   * @param options Invalidation options
   * @returns Promise resolving to the number of keys deleted
   */
  async invalidate(
    strategy: CacheInvalidationStrategy,
    key: string,
    options: CacheInvalidationOptions = {},
  ): Promise<number> {
    switch (strategy) {
      case CacheInvalidationStrategy.KEY:
        return this.invalidateKey(key, options) ? 1 : 0;

      case CacheInvalidationStrategy.PREFIX:
        return this.invalidateByPrefix(key, options);

      case CacheInvalidationStrategy.PATTERN:
        return this.invalidateByPattern(key, options);

      case CacheInvalidationStrategy.ALL:
        return this.invalidateAll(options);

      default:
        this.logger.error(`Unknown invalidation strategy: ${strategy}`);
        return 0;
    }
  }
}

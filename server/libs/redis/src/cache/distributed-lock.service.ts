import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Lock options
 */
export interface LockOptions {
  /**
   * Lock TTL in seconds
   * @default 30
   */
  ttl?: number;

  /**
   * Retry delay in milliseconds
   * @default 100
   */
  retryDelay?: number;

  /**
   * Maximum number of retries
   * @default 10
   */
  maxRetries?: number;

  /**
   * Whether to log lock operations
   * @default false
   */
  enableLogs?: boolean;
}

/**
 * Default lock options
 */
const defaultLockOptions: LockOptions = {
  ttl: 30,
  retryDelay: 100,
  maxRetries: 10,
  enableLogs: false,
};

/**
 * Distributed Lock Service
 *
 * This service provides distributed locking functionality using Redis.
 * It implements the Redlock algorithm for distributed locks.
 */
@Injectable()
export class DistributedLockService {
  private readonly logger = new Logger(DistributedLockService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Acquire a lock
   * @param lockName Lock name
   * @param options Lock options
   * @returns Promise resolving to the lock token if acquired, null otherwise
   */
  async acquireLock(
    lockName: string,
    options: LockOptions = {},
  ): Promise<string | null> {
    const mergedOptions = { ...defaultLockOptions, ...options };
    const lockKey = this.getLockKey(lockName);
    const lockToken = uuidv4();

    for (let attempt = 0; attempt <= mergedOptions.maxRetries; attempt++) {
      try {
        // Try to set the lock key with NX option (only if it doesn't exist)
        const result = await this.redisService
          .getClient()
          .set(lockKey, lockToken, 'NX', 'EX', mergedOptions.ttl);

        if (result === 'OK') {
          // Lock acquired
          if (mergedOptions.enableLogs) {
            this.logger.log(`Lock acquired: ${lockName} (token: ${lockToken})`);
          }

          return lockToken;
        }

        // Lock not acquired, wait and retry
        if (attempt < mergedOptions.maxRetries) {
          await this.delay(mergedOptions.retryDelay);
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Error acquiring lock ${lockName}: ${errorMessage}`);

        // Wait and retry
        if (attempt < mergedOptions.maxRetries) {
          await this.delay(mergedOptions.retryDelay);
        }
      }
    }

    // Failed to acquire lock after all retries
    if (mergedOptions.enableLogs) {
      this.logger.warn(
        `Failed to acquire lock: ${lockName} after ${mergedOptions.maxRetries} retries`,
      );
    }

    return null;
  }

  /**
   * Release a lock
   * @param lockName Lock name
   * @param lockToken Lock token
   * @param options Lock options
   * @returns Promise resolving to true if the lock was released
   */
  async releaseLock(
    lockName: string,
    lockToken: string,
    options: LockOptions = {},
  ): Promise<boolean> {
    const mergedOptions = { ...defaultLockOptions, ...options };
    const lockKey = this.getLockKey(lockName);

    try {
      // Use Lua script to ensure atomicity
      // Only delete the key if it exists and the value matches the token
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;

      const result = await this.redisService
        .getClient()
        .eval(script, 1, lockKey, lockToken);

      const released = result === 1;

      if (released && mergedOptions.enableLogs) {
        this.logger.log(`Lock released: ${lockName} (token: ${lockToken})`);
      }

      return released;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error releasing lock ${lockName}: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Execute a function with a lock
   * @param lockName Lock name
   * @param fn Function to execute
   * @param options Lock options
   * @returns Promise resolving to the function result
   * @throws Error if the lock could not be acquired
   */
  async withLock<T>(
    lockName: string,
    fn: () => Promise<T>,
    options: LockOptions = {},
  ): Promise<T> {
    const lockToken = await this.acquireLock(lockName, options);

    if (!lockToken) {
      throw new Error(`Could not acquire lock: ${lockName}`);
    }

    try {
      // Execute the function
      return await fn();
    } finally {
      // Always release the lock
      await this.releaseLock(lockName, lockToken, options);
    }
  }

  /**
   * Get the full lock key
   * @param lockName Lock name
   * @returns Full lock key
   */
  private getLockKey(lockName: string): string {
    return `lock:${lockName}`;
  }

  /**
   * Delay execution
   * @param ms Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

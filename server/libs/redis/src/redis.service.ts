import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { REDIS_CLIENT } from './constants/redis.constants';
import { Redis, Cluster } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis | Cluster,
  ) {
    this.logger.log('Redis service initialized');
  }

  /**
   * Get the Redis client instance
   * @returns Redis client
   */
  getClient(): Redis | Cluster {
    return this.redisClient;
  }

  /**
   * Set a key-value pair in Redis
   * @param key Key
   * @param value Value
   * @param ttl Time to live in seconds (optional)
   * @returns Promise resolving to 'OK' if successful
   */
  async set(
    key: string,
    value: string | number | Buffer,
    ttl?: number,
  ): Promise<'OK'> {
    try {
      if (ttl) {
        return await this.redisClient.set(key, value, 'EX', ttl);
      }
      return await this.redisClient.set(key, value);
    } catch (error) {
      this.logger.error(
        `Error setting key ${key}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get a value by key from Redis
   * @param key Key
   * @returns Promise resolving to the value or null if not found
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error(
        `Error getting key ${key}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete a key from Redis
   * @param key Key
   * @returns Promise resolving to the number of keys removed
   */
  async del(key: string | string[]): Promise<number> {
    try {
      return await this.redisClient.del(Array.isArray(key) ? key : [key]);
    } catch (error) {
      this.logger.error(
        `Error deleting key(s) ${key}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Check if a key exists in Redis
   * @param key Key
   * @returns Promise resolving to true if the key exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(
        `Error checking if key ${key} exists: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Set the expiration time for a key
   * @param key Key
   * @param seconds Time to live in seconds
   * @returns Promise resolving to true if the timeout was set, false otherwise
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.redisClient.expire(key, seconds);
      return result === 1;
    } catch (error) {
      this.logger.error(
        `Error setting expiration for key ${key}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get the time to live for a key in seconds
   * @param key Key
   * @returns Promise resolving to the TTL in seconds, -1 if the key exists but has no TTL, -2 if the key does not exist
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redisClient.ttl(key);
    } catch (error) {
      this.logger.error(
        `Error getting TTL for key ${key}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Clean up resources when the module is destroyed
   */
  async onModuleDestroy() {
    try {
      await this.redisClient.quit();
      this.logger.log('Redis client disconnected');
    } catch (error) {
      this.logger.error(
        `Error disconnecting Redis client: ${error.message}`,
        error.stack,
      );
    }
  }
}

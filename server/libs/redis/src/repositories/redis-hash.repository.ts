import { Logger } from '@nestjs/common';
import { Redis, Cluster } from 'ioredis';

/**
 * Redis Hash Repository
 *
 * This class provides methods for working with Redis hash data structures.
 * It allows storing and retrieving objects as Redis hashes.
 */
export class RedisHashRepository<T extends Record<string, any>> {
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * Constructor
   * @param redisClient Redis client
   * @param prefix Key prefix for all Redis operations
   */
  constructor(
    protected readonly redisClient: Redis | Cluster,
    protected readonly prefix: string = '',
  ) {}

  /**
   * Get the full key for a hash
   * @param id Hash ID
   * @returns Full key including prefix
   */
  protected getKey(id: string): string {
    return `${this.prefix}:${id}`;
  }

  /**
   * Get all fields and values from a hash
   * @param id Hash ID
   * @returns Promise resolving to the hash object or null if not found
   */
  async getAll(id: string): Promise<T | null> {
    try {
      const key = this.getKey(id);
      const data = await this.redisClient.hgetall(key);

      if (!data || Object.keys(data).length === 0) {
        return null;
      }

      // Convert string values to appropriate types
      const result: Record<string, any> = {};

      for (const [field, value] of Object.entries(data)) {
        // Try to parse JSON values
        try {
          result[field] = JSON.parse(value);
        } catch {
          // If not JSON, keep as string
          result[field] = value;
        }
      }

      return result as T;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting hash ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get a specific field from a hash
   * @param id Hash ID
   * @param field Field name
   * @returns Promise resolving to the field value or null if not found
   */
  async getField<K extends keyof T>(
    id: string,
    field: K,
  ): Promise<T[K] | null> {
    try {
      const key = this.getKey(id);
      const value = await this.redisClient.hget(key, field as string);

      if (value === null) {
        return null;
      }

      // Try to parse JSON value
      try {
        return JSON.parse(value);
      } catch {
        // If not JSON, return as string
        return value as unknown as T[K];
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error getting field ${String(field)} from hash ${id}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Set a hash with multiple fields
   * @param id Hash ID
   * @param data Object with field-value pairs
   * @param ttl Time to live in seconds (optional)
   * @returns Promise resolving to true if the hash was set
   */
  async setAll(id: string, data: T, ttl?: number): Promise<boolean> {
    try {
      const key = this.getKey(id);

      // Convert values to strings
      const hashData: Record<string, string> = {};

      for (const [field, value] of Object.entries(data)) {
        if (value === undefined) {
          continue;
        }

        if (typeof value === 'string') {
          hashData[field] = value;
        } else {
          hashData[field] = JSON.stringify(value);
        }
      }

      // Use pipeline for better performance
      const pipeline = this.redisClient.pipeline();

      // Delete existing hash to ensure clean state
      pipeline.del(key);

      // Set hash fields
      if (Object.keys(hashData).length > 0) {
        pipeline.hset(key, hashData);
      }

      // Set expiration if provided
      if (ttl) {
        pipeline.expire(key, ttl);
      }

      await pipeline.exec();

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error setting hash ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Set a specific field in a hash
   * @param id Hash ID
   * @param field Field name
   * @param value Field value
   * @returns Promise resolving to true if the field was set
   */
  async setField<K extends keyof T>(
    id: string,
    field: K,
    value: T[K],
  ): Promise<boolean> {
    try {
      const key = this.getKey(id);

      // Convert value to string
      let stringValue: string;

      if (typeof value === 'string') {
        stringValue = value;
      } else {
        stringValue = JSON.stringify(value);
      }

      const result = await this.redisClient.hset(
        key,
        field as string,
        stringValue,
      );

      return result === 1;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error setting field ${String(field)} in hash ${id}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Delete a hash
   * @param id Hash ID
   * @returns Promise resolving to true if the hash was deleted
   */
  async delete(id: string): Promise<boolean> {
    try {
      const key = this.getKey(id);
      const result = await this.redisClient.del(key);

      return result === 1;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error deleting hash ${id}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Delete a specific field from a hash
   * @param id Hash ID
   * @param field Field name
   * @returns Promise resolving to true if the field was deleted
   */
  async deleteField(id: string, field: keyof T): Promise<boolean> {
    try {
      const key = this.getKey(id);
      const result = await this.redisClient.hdel(key, field as string);

      return result === 1;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error deleting field ${String(field)} from hash ${id}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Check if a hash exists
   * @param id Hash ID
   * @returns Promise resolving to true if the hash exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const key = this.getKey(id);
      const result = await this.redisClient.exists(key);

      return result === 1;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error checking if hash ${id} exists: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Set the expiration time for a hash
   * @param id Hash ID
   * @param seconds Time to live in seconds
   * @returns Promise resolving to true if the timeout was set
   */
  async expire(id: string, seconds: number): Promise<boolean> {
    try {
      const key = this.getKey(id);
      const result = await this.redisClient.expire(key, seconds);

      return result === 1;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error setting expiration for hash ${id}: ${errorMessage}`,
      );
      throw error;
    }
  }
}

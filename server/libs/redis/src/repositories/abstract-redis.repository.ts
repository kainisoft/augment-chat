import { Logger } from '@nestjs/common';
import { Redis, Cluster } from 'ioredis';
import { BaseRedisRepository } from './base-redis.repository';

/**
 * Abstract Redis Repository
 *
 * This class provides a base implementation for Redis repositories.
 * It implements the BaseRedisRepository interface and provides common functionality
 * for storing and retrieving entities in Redis.
 */
export abstract class AbstractRedisRepository<T, ID>
  implements BaseRedisRepository<T, ID>
{
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
   * Get the full key for an entity
   * @param id Entity ID
   * @returns Full key including prefix
   */
  protected getKey(id: ID): string {
    return `${this.prefix}:${String(id)}`;
  }

  /**
   * Serialize an entity to a string
   * @param entity Entity to serialize
   * @returns Serialized entity
   */
  protected serialize(entity: T): string {
    return JSON.stringify(entity);
  }

  /**
   * Deserialize a string to an entity
   * @param data Serialized entity
   * @returns Deserialized entity
   */
  protected deserialize(data: string): T {
    return JSON.parse(data) as T;
  }

  /**
   * Find an entity by its ID
   * @param id Entity ID
   * @returns Promise resolving to the entity or null if not found
   */
  async findById(id: ID): Promise<T | null> {
    try {
      const key = this.getKey(id);
      const data = await this.redisClient.get(key);

      if (!data) {
        return null;
      }

      return this.deserialize(data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error finding entity by ID ${String(id)}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Save an entity
   * @param id Entity ID
   * @param entity Entity to save
   * @param ttl Time to live in seconds (optional)
   * @returns Promise resolving to the saved entity
   */
  async save(id: ID, entity: T, ttl?: number): Promise<T> {
    try {
      const key = this.getKey(id);
      const data = this.serialize(entity);

      if (ttl) {
        await this.redisClient.set(key, data, 'EX', ttl);
      } else {
        await this.redisClient.set(key, data);
      }

      return entity;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error saving entity with ID ${String(id)}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Delete an entity by its ID
   * @param id Entity ID
   * @returns Promise resolving to true if the entity was deleted, false otherwise
   */
  async delete(id: ID): Promise<boolean> {
    try {
      const key = this.getKey(id);
      const result = await this.redisClient.del(key);

      return result === 1;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error deleting entity with ID ${String(id)}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Check if an entity exists by its ID
   * @param id Entity ID
   * @returns Promise resolving to true if the entity exists, false otherwise
   */
  async exists(id: ID): Promise<boolean> {
    try {
      const key = this.getKey(id);
      const result = await this.redisClient.exists(key);

      return result === 1;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error checking if entity with ID ${String(id)} exists: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Set the expiration time for an entity
   * @param id Entity ID
   * @param seconds Time to live in seconds
   * @returns Promise resolving to true if the timeout was set, false otherwise
   */
  async expire(id: ID, seconds: number): Promise<boolean> {
    try {
      const key = this.getKey(id);
      const result = await this.redisClient.expire(key, seconds);

      return result === 1;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error setting expiration for entity with ID ${String(id)}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Get the time to live for an entity in seconds
   * @param id Entity ID
   * @returns Promise resolving to the TTL in seconds, -1 if the entity exists but has no TTL, -2 if the entity does not exist
   */
  async ttl(id: ID): Promise<number> {
    try {
      const key = this.getKey(id);
      return await this.redisClient.ttl(key);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error getting TTL for entity with ID ${String(id)}: ${errorMessage}`,
      );
      throw error;
    }
  }
}

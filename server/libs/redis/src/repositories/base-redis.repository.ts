/**
 * Base Redis Repository Interface
 *
 * This interface defines the common operations for Redis repositories.
 * It provides a generic interface for storing and retrieving entities in Redis.
 */
export interface BaseRedisRepository<T, ID> {
  /**
   * Find an entity by its ID
   * @param id Entity ID
   * @returns Promise resolving to the entity or null if not found
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Save an entity
   * @param id Entity ID
   * @param entity Entity to save
   * @param ttl Time to live in seconds (optional)
   * @returns Promise resolving to the saved entity
   */
  save(id: ID, entity: T, ttl?: number): Promise<T>;

  /**
   * Delete an entity by its ID
   * @param id Entity ID
   * @returns Promise resolving to true if the entity was deleted, false otherwise
   */
  delete(id: ID): Promise<boolean>;

  /**
   * Check if an entity exists by its ID
   * @param id Entity ID
   * @returns Promise resolving to true if the entity exists, false otherwise
   */
  exists(id: ID): Promise<boolean>;

  /**
   * Set the expiration time for an entity
   * @param id Entity ID
   * @param seconds Time to live in seconds
   * @returns Promise resolving to true if the timeout was set, false otherwise
   */
  expire(id: ID, seconds: number): Promise<boolean>;

  /**
   * Get the time to live for an entity in seconds
   * @param id Entity ID
   * @returns Promise resolving to the TTL in seconds, -1 if the entity exists but has no TTL, -2 if the entity does not exist
   */
  ttl(id: ID): Promise<number>;
}

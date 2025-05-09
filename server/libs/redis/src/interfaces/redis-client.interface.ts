/**
 * Redis client interface
 *
 * This interface defines the methods that should be implemented by any Redis client.
 * It provides a common interface for both single-node and cluster Redis clients.
 */
export interface RedisClient {
  /**
   * Set a key-value pair in Redis
   * @param key Key
   * @param value Value
   * @param ttl Time to live in seconds (optional)
   * @returns Promise resolving to 'OK' if successful
   */
  set(
    key: string,
    value: string | number | Buffer,
    ttl?: number,
  ): Promise<'OK'>;

  /**
   * Get a value by key from Redis
   * @param key Key
   * @returns Promise resolving to the value or null if not found
   */
  get(key: string): Promise<string | null>;

  /**
   * Delete a key from Redis
   * @param key Key or array of keys
   * @returns Promise resolving to the number of keys removed
   */
  del(key: string | string[]): Promise<number>;

  /**
   * Check if a key exists in Redis
   * @param key Key
   * @returns Promise resolving to 1 if the key exists, 0 otherwise
   */
  exists(key: string): Promise<number>;

  /**
   * Set the expiration time for a key
   * @param key Key
   * @param seconds Time to live in seconds
   * @returns Promise resolving to 1 if the timeout was set, 0 otherwise
   */
  expire(key: string, seconds: number): Promise<number>;

  /**
   * Get the time to live for a key in seconds
   * @param key Key
   * @returns Promise resolving to the TTL in seconds, -1 if the key exists but has no TTL, -2 if the key does not exist
   */
  ttl(key: string): Promise<number>;
}

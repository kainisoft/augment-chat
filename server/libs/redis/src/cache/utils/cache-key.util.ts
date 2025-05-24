/**
 * Cache key utilities
 *
 * This file contains utility functions for generating cache keys.
 */

/**
 * Generate a cache key for a user
 * @param userId User ID
 * @param prefix Optional prefix
 * @returns Cache key
 */
export function generateUserCacheKey(userId: string, prefix = 'user'): string {
  return `${prefix}:${userId}`;
}

/**
 * Generate a cache key for a user by email
 * @param email User email
 * @param prefix Optional prefix
 * @returns Cache key
 */
export function generateUserEmailCacheKey(
  email: string,
  prefix = 'user:email',
): string {
  return `${prefix}:${email}`;
}

/**
 * Generate a cache key for a search query
 * @param searchTerm Search term
 * @param prefix Optional prefix
 * @returns Cache key
 */
export function generateSearchCacheKey(
  searchTerm: string,
  prefix = 'search',
): string {
  // Normalize the search term (lowercase, trim whitespace)
  const normalizedTerm = searchTerm.toLowerCase().trim();

  // Replace special characters with underscores
  const sanitizedTerm = normalizedTerm.replace(/[^a-z0-9]/g, '_');

  return `${prefix}:${sanitizedTerm}`;
}

/**
 * Generate a cache key for permissions
 * @param userId User ID
 * @param prefix Optional prefix
 * @returns Cache key
 */
export function generatePermissionsCacheKey(
  userId: string,
  prefix = 'permissions:user',
): string {
  return `${prefix}:${userId}`;
}

/**
 * Generate a cache key for a method call
 * @param className Class name
 * @param methodName Method name
 * @param args Method arguments
 * @param prefix Optional prefix
 * @returns Cache key
 */
export function generateMethodCacheKey(
  className: string,
  methodName: string,
  args: any[],
  prefix = 'method',
): string {
  // Create a string representation of the arguments
  const argsStr = args
    .map((arg) => {
      if (arg === null || arg === undefined) {
        return 'null';
      }

      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return String(arg);
        }
      }

      return String(arg);
    })
    .join(':');

  return `${prefix}:${className}:${methodName}:${argsStr}`;
}

/**
 * Generate a cache key with a hash
 *
 * This is useful for long cache keys or keys with complex arguments.
 *
 * @param parts Parts to include in the cache key
 * @param prefix Optional prefix
 * @returns Cache key
 */
export function generateHashedCacheKey(parts: string[], prefix = ''): string {
  // Join all parts with a separator
  const combined = parts.join(':');

  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Use absolute value of hash
  const hashStr = Math.abs(hash).toString(16);

  return prefix ? `${prefix}:${hashStr}` : hashStr;
}

/**
 * Cache key generator options
 */
export interface CacheKeyOptions {
  /**
   * Whether to use a hash for the cache key
   * @default false
   */
  useHash?: boolean;

  /**
   * Cache key prefix
   * @default ''
   */
  prefix?: string;

  /**
   * Separator for cache key parts
   * @default ':'
   */
  separator?: string;
}

/**
 * Generate a cache key
 * @param parts Parts to include in the cache key
 * @param options Cache key options
 * @returns Cache key
 */
export function generateCacheKey(
  parts: (string | number | boolean | null | undefined)[],
  options: CacheKeyOptions = {},
): string {
  const { useHash = false, prefix = '', separator = ':' } = options;

  // Filter out null and undefined values and convert to strings
  const validParts = parts
    .filter((part) => part !== null && part !== undefined)
    .map((part) => String(part));

  // If using a hash, generate a hashed key
  if (useHash) {
    return generateHashedCacheKey(validParts, prefix);
  }

  // Otherwise, join all parts with the separator
  const key = validParts.join(separator);

  return prefix ? `${prefix}${separator}${key}` : key;
}

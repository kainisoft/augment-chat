import { Injectable } from '@nestjs/common';

/**
 * Validation Cache Service
 *
 * Provides caching for frequently used validation results to improve performance.
 * Uses in-memory LRU cache with configurable TTL and size limits.
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  maxSize?: number;
  ttlMs?: number;
  enableStats?: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
}

@Injectable()
export class ValidationCacheService {
  private readonly caches = new Map<string, Map<string, CacheEntry<any>>>();
  private readonly stats = new Map<string, CacheStats>();
  private readonly defaultOptions: Required<CacheOptions> = {
    maxSize: 1000,
    ttlMs: 5 * 60 * 1000, // 5 minutes
    enableStats: true,
  };

  /**
   * Get cached validation result
   */
  get<T>(cacheKey: string, key: string): T | undefined {
    const cache = this.getOrCreateCache(cacheKey);
    const entry = cache.get(key);

    if (!entry) {
      this.incrementMisses(cacheKey);
      return undefined;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      cache.delete(key);
      this.incrementMisses(cacheKey);
      return undefined;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    this.incrementHits(cacheKey);
    return entry.value;
  }

  /**
   * Set cached validation result
   */
  set<T>(
    cacheKey: string,
    key: string,
    value: T,
    options?: CacheOptions,
  ): void {
    const cache = this.getOrCreateCache(cacheKey);
    const opts = { ...this.defaultOptions, ...options };

    // Check if we need to evict entries
    if (cache.size >= opts.maxSize) {
      this.evictLeastRecentlyUsed(cache, opts.maxSize);
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    cache.set(key, entry);
    this.updateCacheSize(cacheKey, cache.size);
  }

  /**
   * Check if cache has a valid entry
   */
  has(cacheKey: string, key: string): boolean {
    const cache = this.caches.get(cacheKey);
    if (!cache) return false;

    const entry = cache.get(key);
    if (!entry) return false;

    if (this.isExpired(entry)) {
      cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cached entry
   */
  delete(cacheKey: string, key: string): boolean {
    const cache = this.caches.get(cacheKey);
    if (!cache) return false;

    const result = cache.delete(key);
    this.updateCacheSize(cacheKey, cache.size);
    return result;
  }

  /**
   * Clear entire cache
   */
  clear(cacheKey?: string): void {
    if (cacheKey) {
      const cache = this.caches.get(cacheKey);
      if (cache) {
        cache.clear();
        this.updateCacheSize(cacheKey, 0);
      }
    } else {
      this.caches.clear();
      this.stats.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getStats(cacheKey: string): CacheStats | undefined {
    return this.stats.get(cacheKey);
  }

  /**
   * Get all cache statistics
   */
  getAllStats(): Map<string, CacheStats> {
    return new Map(this.stats);
  }

  /**
   * Memoize a validation function with caching
   */
  memoize<TArgs extends any[], TReturn>(
    cacheKey: string,
    fn: (...args: TArgs) => TReturn,
    keyGenerator?: (...args: TArgs) => string,
    options?: CacheOptions,
  ): (...args: TArgs) => TReturn {
    const generateKey = keyGenerator || ((...args) => JSON.stringify(args));

    return (...args: TArgs): TReturn => {
      const key = generateKey(...args);

      // Try to get from cache
      const cached = this.get<TReturn>(cacheKey, key);
      if (cached !== undefined) {
        return cached;
      }

      // Execute function and cache result
      const result = fn(...args);
      this.set(cacheKey, key, result, options);

      return result;
    };
  }

  /**
   * Create a cached validation decorator
   */
  createCachedValidator<T>(
    cacheKey: string,
    validator: (value: any) => T,
    options?: CacheOptions,
  ): (value: any) => T {
    return this.memoize(
      cacheKey,
      validator,
      (value) => (typeof value === 'string' ? value : JSON.stringify(value)),
      options,
    );
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    for (const [cacheKey, cache] of this.caches.entries()) {
      const expiredKeys: string[] = [];

      for (const [key, entry] of cache.entries()) {
        if (this.isExpired(entry)) {
          expiredKeys.push(key);
        }
      }

      for (const key of expiredKeys) {
        cache.delete(key);
        this.incrementEvictions(cacheKey);
      }

      this.updateCacheSize(cacheKey, cache.size);
    }
  }

  /**
   * Get cache efficiency metrics
   */
  getEfficiencyMetrics(): {
    totalHits: number;
    totalMisses: number;
    overallHitRate: number;
    cacheCount: number;
    totalSize: number;
  } {
    let totalHits = 0;
    let totalMisses = 0;
    let totalSize = 0;

    for (const stats of this.stats.values()) {
      totalHits += stats.hits;
      totalMisses += stats.misses;
      totalSize += stats.size;
    }

    const overallHitRate =
      totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0;

    return {
      totalHits,
      totalMisses,
      overallHitRate,
      cacheCount: this.caches.size,
      totalSize,
    };
  }

  private getOrCreateCache(cacheKey: string): Map<string, CacheEntry<any>> {
    let cache = this.caches.get(cacheKey);
    if (!cache) {
      cache = new Map();
      this.caches.set(cacheKey, cache);
      this.initializeStats(cacheKey);
    }
    return cache;
  }

  private initializeStats(cacheKey: string): void {
    if (!this.stats.has(cacheKey)) {
      this.stats.set(cacheKey, {
        hits: 0,
        misses: 0,
        evictions: 0,
        size: 0,
        hitRate: 0,
      });
    }
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > this.defaultOptions.ttlMs;
  }

  private evictLeastRecentlyUsed(
    cache: Map<string, CacheEntry<any>>,
    maxSize: number,
  ): void {
    const entries = Array.from(cache.entries());

    // Sort by last accessed time (oldest first)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    // Remove oldest entries until we're under the limit
    const toRemove = Math.max(1, entries.length - maxSize + 1);
    for (let i = 0; i < toRemove; i++) {
      cache.delete(entries[i][0]);
    }
  }

  private incrementHits(cacheKey: string): void {
    const stats = this.stats.get(cacheKey);
    if (stats) {
      stats.hits++;
      this.updateHitRate(stats);
    }
  }

  private incrementMisses(cacheKey: string): void {
    const stats = this.stats.get(cacheKey);
    if (stats) {
      stats.misses++;
      this.updateHitRate(stats);
    }
  }

  private incrementEvictions(cacheKey: string): void {
    const stats = this.stats.get(cacheKey);
    if (stats) {
      stats.evictions++;
    }
  }

  private updateCacheSize(cacheKey: string, size: number): void {
    const stats = this.stats.get(cacheKey);
    if (stats) {
      stats.size = size;
    }
  }

  private updateHitRate(stats: CacheStats): void {
    const total = stats.hits + stats.misses;
    stats.hitRate = total > 0 ? stats.hits / total : 0;
  }
}

/**
 * Global validation cache instance
 */
export const validationCache = new ValidationCacheService();

/**
 * Cache key constants for different validation types
 */
export const VALIDATION_CACHE_KEYS = {
  EMAIL: 'email-validation',
  UUID: 'uuid-validation',
  USERNAME: 'username-validation',
  PASSWORD: 'password-validation',
  JWT: 'jwt-validation',
  URL: 'url-validation',
  DATE: 'date-validation',
} as const;

/**
 * Cached validation decorators
 */
export const CachedValidators = {
  /**
   * Cached email validation
   */
  validateEmail: validationCache.createCachedValidator(
    VALIDATION_CACHE_KEYS.EMAIL,
    (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    { maxSize: 500, ttlMs: 10 * 60 * 1000 }, // 10 minutes for emails
  ),

  /**
   * Cached UUID validation
   */
  validateUUID: validationCache.createCachedValidator(
    VALIDATION_CACHE_KEYS.UUID,
    (uuid: string) => {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
    },
    { maxSize: 1000, ttlMs: 30 * 60 * 1000 }, // 30 minutes for UUIDs
  ),

  /**
   * Cached username validation
   */
  validateUsername: validationCache.createCachedValidator(
    VALIDATION_CACHE_KEYS.USERNAME,
    (username: string) => {
      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      return (
        usernameRegex.test(username) &&
        username.length >= 3 &&
        username.length <= 50
      );
    },
    { maxSize: 300, ttlMs: 15 * 60 * 1000 }, // 15 minutes for usernames
  ),

  /**
   * Cached JWT validation
   */
  validateJWT: validationCache.createCachedValidator(
    VALIDATION_CACHE_KEYS.JWT,
    (token: string) => {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
      return parts.every((part) => base64UrlRegex.test(part));
    },
    { maxSize: 200, ttlMs: 5 * 60 * 1000 }, // 5 minutes for JWTs
  ),
};

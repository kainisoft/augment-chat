/**
 * Memoization Utilities
 *
 * Provides advanced memoization capabilities for expensive operations
 * with configurable caching strategies, TTL, and memory management.
 */

interface MemoizeOptions {
  maxSize?: number;
  ttlMs?: number;
  keyGenerator?: (...args: any[]) => string;
  enableStats?: boolean;
  onEvict?: (key: string, value: any) => void;
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface MemoizeStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
  averageAccessCount: number;
}

/**
 * Advanced memoization class with LRU eviction and TTL
 */
export class Memoizer<TArgs extends any[], TReturn> {
  private cache = new Map<string, CacheEntry<TReturn>>();
  private stats: MemoizeStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    hitRate: 0,
    averageAccessCount: 0,
  };

  constructor(
    private fn: (...args: TArgs) => TReturn,
    private options: Required<MemoizeOptions> = {
      maxSize: 100,
      ttlMs: 5 * 60 * 1000, // 5 minutes
      keyGenerator: (...args) => JSON.stringify(args),
      enableStats: true,
      onEvict: () => {},
    },
  ) {}

  /**
   * Execute function with memoization
   */
  execute(...args: TArgs): TReturn {
    const key = this.options.keyGenerator(...args);

    // Check cache first
    const cached = this.cache.get(key);
    if (cached && !this.isExpired(cached)) {
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      this.incrementHits();
      return cached.value;
    }

    // Remove expired entry
    if (cached && this.isExpired(cached)) {
      this.cache.delete(key);
    }

    // Execute function
    this.incrementMisses();
    const result = this.fn(...args);

    // Store in cache
    this.set(key, result);

    return result;
  }

  /**
   * Set value in cache
   */
  private set(key: string, value: TReturn): void {
    // Check if we need to evict
    if (this.cache.size >= this.options.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    const entry: CacheEntry<TReturn> = {
      value,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
    this.updateStats();
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry<TReturn>): boolean {
    return Date.now() - entry.timestamp > this.options.ttlMs;
  }

  /**
   * Evict least recently used entry
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | undefined;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const evicted = this.cache.get(oldestKey);
      this.cache.delete(oldestKey);
      this.stats.evictions++;

      if (evicted) {
        this.options.onEvict(oldestKey, evicted.value);
      }
    }
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    this.stats.size = this.cache.size;
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;

    const totalAccessCount = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.accessCount,
      0,
    );
    this.stats.averageAccessCount =
      this.cache.size > 0 ? totalAccessCount / this.cache.size : 0;
  }

  /**
   * Increment hit counter
   */
  private incrementHits(): void {
    this.stats.hits++;
    this.updateStats();
  }

  /**
   * Increment miss counter
   */
  private incrementMisses(): void {
    this.stats.misses++;
    this.updateStats();
  }

  /**
   * Get memoization statistics
   */
  getStats(): MemoizeStats {
    return { ...this.stats };
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      hitRate: 0,
      averageAccessCount: 0,
    };
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry ? !this.isExpired(entry) : false;
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
    }

    this.updateStats();
    return expiredKeys.length;
  }
}

/**
 * Simple memoization decorator
 */
export function memoize<TArgs extends any[], TReturn>(
  options?: Partial<MemoizeOptions>,
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const memoizer = new Memoizer(originalMethod, {
      maxSize: 100,
      ttlMs: 5 * 60 * 1000,
      keyGenerator: (...args) => JSON.stringify(args),
      enableStats: true,
      onEvict: () => {},
      ...options,
    });

    descriptor.value = function (...args: TArgs) {
      return memoizer.execute.apply(memoizer, [this, ...args]);
    };

    // Attach stats getter to the method
    (descriptor.value as any).getMemoStats = () => memoizer.getStats();
    (descriptor.value as any).clearMemoCache = () => memoizer.clear();

    return descriptor;
  };
}

/**
 * Memoization utility functions
 */
export class MemoizationUtils {
  private static globalMemoizers = new Map<string, Memoizer<any[], any>>();

  /**
   * Create a memoized function
   */
  static memoizeFunction<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => TReturn,
    options?: Partial<MemoizeOptions>,
  ): (...args: TArgs) => TReturn {
    const memoizer = new Memoizer(fn, {
      maxSize: 100,
      ttlMs: 5 * 60 * 1000,
      keyGenerator: (...args) => JSON.stringify(args),
      enableStats: true,
      onEvict: () => {},
      ...options,
    });

    const memoizedFn = (...args: TArgs) => memoizer.execute(...args);

    // Attach utility methods
    (memoizedFn as any).getStats = () => memoizer.getStats();
    (memoizedFn as any).clear = () => memoizer.clear();
    (memoizedFn as any).cleanup = () => memoizer.cleanup();

    return memoizedFn;
  }

  /**
   * Create a global memoized function
   */
  static createGlobalMemoizer<TArgs extends any[], TReturn>(
    key: string,
    fn: (...args: TArgs) => TReturn,
    options?: Partial<MemoizeOptions>,
  ): (...args: TArgs) => TReturn {
    if (this.globalMemoizers.has(key)) {
      throw new Error(`Global memoizer with key '${key}' already exists`);
    }

    const memoizer = new Memoizer(fn, {
      maxSize: 100,
      ttlMs: 5 * 60 * 1000,
      keyGenerator: (...args) => JSON.stringify(args),
      enableStats: true,
      onEvict: () => {},
      ...options,
    });

    this.globalMemoizers.set(key, memoizer);

    return (...args: TArgs) => memoizer.execute(...args);
  }

  /**
   * Get global memoizer statistics
   */
  static getGlobalStats(): Record<string, MemoizeStats> {
    const stats: Record<string, MemoizeStats> = {};

    for (const [key, memoizer] of this.globalMemoizers.entries()) {
      stats[key] = memoizer.getStats();
    }

    return stats;
  }

  /**
   * Clear all global memoizers
   */
  static clearAllGlobal(): void {
    for (const memoizer of this.globalMemoizers.values()) {
      memoizer.clear();
    }
  }

  /**
   * Cleanup expired entries in all global memoizers
   */
  static cleanupAllGlobal(): Record<string, number> {
    const cleaned: Record<string, number> = {};

    for (const [key, memoizer] of this.globalMemoizers.entries()) {
      cleaned[key] = memoizer.cleanup();
    }

    return cleaned;
  }

  /**
   * Get memory usage of all memoizers
   */
  static getMemoryUsage(): {
    totalMemoizers: number;
    totalCacheSize: number;
    averageCacheSize: number;
    totalHits: number;
    totalMisses: number;
    overallHitRate: number;
  } {
    let totalCacheSize = 0;
    let totalHits = 0;
    let totalMisses = 0;

    for (const memoizer of this.globalMemoizers.values()) {
      const stats = memoizer.getStats();
      totalCacheSize += stats.size;
      totalHits += stats.hits;
      totalMisses += stats.misses;
    }

    const totalMemoizers = this.globalMemoizers.size;
    const averageCacheSize =
      totalMemoizers > 0 ? totalCacheSize / totalMemoizers : 0;
    const overallHitRate =
      totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0;

    return {
      totalMemoizers,
      totalCacheSize,
      averageCacheSize,
      totalHits,
      totalMisses,
      overallHitRate,
    };
  }
}

/**
 * Specialized memoizers for common operations
 */
export const CommonMemoizers = {
  /**
   * Memoized JSON parsing
   */
  parseJSON: MemoizationUtils.memoizeFunction(
    (jsonString: string) => JSON.parse(jsonString),
    {
      maxSize: 200,
      ttlMs: 10 * 60 * 1000, // 10 minutes
      keyGenerator: (str) => `json_${str.length}_${str.slice(0, 50)}`,
    },
  ),

  /**
   * Memoized regex matching
   */
  regexTest: MemoizationUtils.memoizeFunction(
    (pattern: string, flags: string, text: string) => {
      const regex = new RegExp(pattern, flags);
      return regex.test(text);
    },
    {
      maxSize: 100,
      ttlMs: 15 * 60 * 1000, // 15 minutes
      keyGenerator: (pattern, flags, text) =>
        `regex_${pattern}_${flags}_${text}`,
    },
  ),

  /**
   * Memoized string operations
   */
  stringOperations: {
    toLowerCase: MemoizationUtils.memoizeFunction(
      (str: string) => str.toLowerCase(),
      { maxSize: 500, ttlMs: 30 * 60 * 1000 },
    ),

    toUpperCase: MemoizationUtils.memoizeFunction(
      (str: string) => str.toUpperCase(),
      { maxSize: 500, ttlMs: 30 * 60 * 1000 },
    ),

    trim: MemoizationUtils.memoizeFunction((str: string) => str.trim(), {
      maxSize: 300,
      ttlMs: 20 * 60 * 1000,
    }),
  },
};

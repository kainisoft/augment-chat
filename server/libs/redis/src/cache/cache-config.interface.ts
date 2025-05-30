/**
 * Cache Configuration Interface
 *
 * Defines the configuration options for cache modules across services.
 */
export interface CacheConfig {
  /**
   * Default TTL for cache entries in seconds
   * @default 300 (5 minutes)
   */
  defaultTtl?: number;

  /**
   * TTL for search results in seconds
   * @default 60 (1 minute)
   */
  searchTtl?: number;

  /**
   * TTL for user data in seconds
   * @default 3600 (1 hour)
   */
  userTtl?: number;

  /**
   * TTL for permission data in seconds
   * @default 3600 (1 hour)
   */
  permissionTtl?: number;

  /**
   * Whether to enable cache jitter to prevent cache stampedes
   * @default true
   */
  enableJitter?: boolean;

  /**
   * Jitter factor for TTL randomization (0-1)
   * @default 0.1 (10%)
   */
  jitterFactor?: number;

  /**
   * Whether to enable cache logging
   * @default false
   */
  enableLogging?: boolean;

  /**
   * Cache key prefix for the service
   * @default ''
   */
  keyPrefix?: string;

  /**
   * Maximum number of cache keys to process in batch operations
   * @default 100
   */
  batchSize?: number;

  /**
   * Whether to enable cache metrics collection
   * @default false
   */
  enableMetrics?: boolean;
}

/**
 * Default cache configuration values
 */
export const DEFAULT_CACHE_CONFIG: Required<CacheConfig> = {
  defaultTtl: 300, // 5 minutes
  searchTtl: 60, // 1 minute
  userTtl: 3600, // 1 hour
  permissionTtl: 3600, // 1 hour
  enableJitter: true,
  jitterFactor: 0.1, // 10%
  enableLogging: false,
  keyPrefix: '',
  batchSize: 100,
  enableMetrics: false,
};

/**
 * Cache configuration for User Service
 */
export const USER_SERVICE_CACHE_CONFIG: Partial<CacheConfig> = {
  defaultTtl: 300, // 5 minutes
  searchTtl: 60, // 1 minute
  userTtl: 1800, // 30 minutes
  enableJitter: true,
  jitterFactor: 0.1,
  enableLogging: true,
  keyPrefix: 'user-service',
};

/**
 * Cache configuration for Auth Service
 */
export const AUTH_SERVICE_CACHE_CONFIG: Partial<CacheConfig> = {
  defaultTtl: 3600, // 1 hour
  userTtl: 3600, // 1 hour
  permissionTtl: 1800, // 30 minutes
  enableJitter: true,
  jitterFactor: 0.1,
  enableLogging: true,
  keyPrefix: 'auth-service',
};

/**
 * Environment variable names for cache configuration
 */
export const CACHE_CONFIG_ENV_VARS = {
  DEFAULT_TTL: 'CACHE_DEFAULT_TTL',
  SEARCH_TTL: 'CACHE_SEARCH_TTL',
  USER_TTL: 'CACHE_USER_TTL',
  PERMISSION_TTL: 'CACHE_PERMISSION_TTL',
  ENABLE_JITTER: 'CACHE_ENABLE_JITTER',
  JITTER_FACTOR: 'CACHE_JITTER_FACTOR',
  ENABLE_LOGGING: 'CACHE_ENABLE_LOGGING',
  KEY_PREFIX: 'CACHE_KEY_PREFIX',
  BATCH_SIZE: 'CACHE_BATCH_SIZE',
  ENABLE_METRICS: 'CACHE_ENABLE_METRICS',
} as const;

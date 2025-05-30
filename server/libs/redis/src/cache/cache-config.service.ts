import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CacheConfig,
  DEFAULT_CACHE_CONFIG,
  CACHE_CONFIG_ENV_VARS,
} from './cache-config.interface';

/**
 * Cache Configuration Service
 *
 * Provides centralized cache configuration management across services.
 * Supports environment variable overrides and service-specific defaults.
 */
@Injectable()
export class CacheConfigService {
  private readonly config: Required<CacheConfig>;

  constructor(
    private readonly configService: ConfigService,
    private readonly serviceDefaults: Partial<CacheConfig> = {},
  ) {
    this.config = this.buildConfig();
  }

  /**
   * Build the final cache configuration
   *
   * Priority order:
   * 1. Environment variables
   * 2. Service-specific defaults
   * 3. Global defaults
   */
  private buildConfig(): Required<CacheConfig> {
    return {
      defaultTtl: this.getNumberConfig(
        CACHE_CONFIG_ENV_VARS.DEFAULT_TTL,
        this.serviceDefaults.defaultTtl ?? DEFAULT_CACHE_CONFIG.defaultTtl,
      ),
      searchTtl: this.getNumberConfig(
        CACHE_CONFIG_ENV_VARS.SEARCH_TTL,
        this.serviceDefaults.searchTtl ?? DEFAULT_CACHE_CONFIG.searchTtl,
      ),
      userTtl: this.getNumberConfig(
        CACHE_CONFIG_ENV_VARS.USER_TTL,
        this.serviceDefaults.userTtl ?? DEFAULT_CACHE_CONFIG.userTtl,
      ),
      permissionTtl: this.getNumberConfig(
        CACHE_CONFIG_ENV_VARS.PERMISSION_TTL,
        this.serviceDefaults.permissionTtl ??
          DEFAULT_CACHE_CONFIG.permissionTtl,
      ),
      enableJitter: this.getBooleanConfig(
        CACHE_CONFIG_ENV_VARS.ENABLE_JITTER,
        this.serviceDefaults.enableJitter ?? DEFAULT_CACHE_CONFIG.enableJitter,
      ),
      jitterFactor: this.getNumberConfig(
        CACHE_CONFIG_ENV_VARS.JITTER_FACTOR,
        this.serviceDefaults.jitterFactor ?? DEFAULT_CACHE_CONFIG.jitterFactor,
      ),
      enableLogging: this.getBooleanConfig(
        CACHE_CONFIG_ENV_VARS.ENABLE_LOGGING,
        this.serviceDefaults.enableLogging ??
          DEFAULT_CACHE_CONFIG.enableLogging,
      ),
      keyPrefix: this.getStringConfig(
        CACHE_CONFIG_ENV_VARS.KEY_PREFIX,
        this.serviceDefaults.keyPrefix ?? DEFAULT_CACHE_CONFIG.keyPrefix,
      ),
      batchSize: this.getNumberConfig(
        CACHE_CONFIG_ENV_VARS.BATCH_SIZE,
        this.serviceDefaults.batchSize ?? DEFAULT_CACHE_CONFIG.batchSize,
      ),
      enableMetrics: this.getBooleanConfig(
        CACHE_CONFIG_ENV_VARS.ENABLE_METRICS,
        this.serviceDefaults.enableMetrics ??
          DEFAULT_CACHE_CONFIG.enableMetrics,
      ),
    };
  }

  /**
   * Get a number configuration value
   */
  private getNumberConfig(envVar: string, defaultValue: number): number {
    const value = this.configService.get<string>(envVar);
    if (value === undefined || value === null) {
      return defaultValue;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Get a boolean configuration value
   */
  private getBooleanConfig(envVar: string, defaultValue: boolean): boolean {
    const value = this.configService.get<string>(envVar);
    if (value === undefined || value === null) {
      return defaultValue;
    }
    return value.toLowerCase() === 'true';
  }

  /**
   * Get a string configuration value
   */
  private getStringConfig(envVar: string, defaultValue: string): string {
    return this.configService.get<string>(envVar, defaultValue);
  }

  /**
   * Get the default TTL
   */
  getDefaultTtl(): number {
    return this.config.defaultTtl;
  }

  /**
   * Get the search TTL
   */
  getSearchTtl(): number {
    return this.config.searchTtl;
  }

  /**
   * Get the user TTL
   */
  getUserTtl(): number {
    return this.config.userTtl;
  }

  /**
   * Get the permission TTL
   */
  getPermissionTtl(): number {
    return this.config.permissionTtl;
  }

  /**
   * Check if jitter is enabled
   */
  isJitterEnabled(): boolean {
    return this.config.enableJitter;
  }

  /**
   * Get the jitter factor
   */
  getJitterFactor(): number {
    return this.config.jitterFactor;
  }

  /**
   * Check if logging is enabled
   */
  isLoggingEnabled(): boolean {
    return this.config.enableLogging;
  }

  /**
   * Get the key prefix
   */
  getKeyPrefix(): string {
    return this.config.keyPrefix;
  }

  /**
   * Get the batch size
   */
  getBatchSize(): number {
    return this.config.batchSize;
  }

  /**
   * Check if metrics are enabled
   */
  isMetricsEnabled(): boolean {
    return this.config.enableMetrics;
  }

  /**
   * Get the full configuration
   */
  getConfig(): Required<CacheConfig> {
    return { ...this.config };
  }
}

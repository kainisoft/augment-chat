import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@app/redis';
import { RedisRepositoryFactory } from '@app/redis/repositories/redis-repository.factory';
import { CacheInvalidationService } from '@app/redis/cache';
import { LoggingService, ErrorLoggerService } from '@app/logging';

/**
 * User permission data
 */
export interface UserPermissionData {
  /**
   * User ID
   */
  userId: string;

  /**
   * User roles
   */
  roles: string[];

  /**
   * User permissions
   */
  permissions: string[];

  /**
   * Last updated timestamp
   */
  updatedAt: number;
}

/**
 * Permission Cache Service
 *
 * Handles caching of user permissions in Redis.
 * This service uses Redis repositories for type-safe caching operations
 * and follows the standardized caching pattern across services.
 */
@Injectable()
export class PermissionCacheService {
  private readonly permissionRepository;
  private readonly defaultTtl: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly repositoryFactory: RedisRepositoryFactory,
    private readonly cacheInvalidation: CacheInvalidationService,
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    // Set context for all logs from this service
    this.loggingService.setContext(PermissionCacheService.name);

    // Create repository
    this.permissionRepository = this.repositoryFactory.create<
      UserPermissionData,
      string
    >('permissions:user');

    // Get default TTL from config
    this.defaultTtl = this.configService.get<number>(
      'PERMISSION_CACHE_TTL',
      3600,
    ); // 1 hour
  }

  /**
   * Cache user permissions
   *
   * Stores a user's roles and permissions in the cache.
   * This method is typically called after retrieving permissions from the database
   * or after updating a user's permissions.
   *
   * @param userId User ID
   * @param roles User roles
   * @param permissions User permissions
   * @param ttl Cache TTL in seconds (defaults to the service's default TTL)
   * @returns The cached permission data
   */
  async cachePermissions(
    userId: string,
    roles: string[],
    permissions: string[],
    ttl: number = this.defaultTtl,
  ): Promise<UserPermissionData> {
    try {
      const data: UserPermissionData = {
        userId,
        roles,
        permissions,
        updatedAt: Date.now(),
      };

      const result = await this.permissionRepository.save(userId, data, ttl);

      this.loggingService.debug(
        `Cached permissions for user ${userId}`,
        'cachePermissions',
        {
          userId,
          roleCount: roles.length,
          permissionCount: permissions.length,
          ttl,
        },
      );

      return result;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to cache permissions', {
        source: PermissionCacheService.name,
        method: 'cachePermissions',
        userId,
        roleCount: roles.length,
        permissionCount: permissions.length,
      });

      // Return the original data even if caching fails
      return {
        userId,
        roles,
        permissions,
        updatedAt: Date.now(),
      };
    }
  }

  /**
   * Get user permissions from cache
   *
   * Retrieves a user's roles and permissions from the cache.
   * This method is typically called before querying the database to improve performance.
   *
   * @param userId User ID
   * @returns User permission data or null if not found
   */
  async getPermissions(userId: string): Promise<UserPermissionData | null> {
    try {
      const permissionData = await this.permissionRepository.findById(userId);

      if (permissionData) {
        this.loggingService.debug(
          `Retrieved permissions for user ${userId} from cache`,
          'getPermissions',
          { userId, source: 'cache' },
        );
      }

      return permissionData;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to get permissions from cache', {
        source: PermissionCacheService.name,
        method: 'getPermissions',
        userId,
      });
      return null;
    }
  }

  /**
   * Check if user has a specific role
   * @param userId User ID
   * @param role Role to check
   * @returns True if user has the role
   */
  async hasRole(userId: string, role: string): Promise<boolean> {
    try {
      const permissions = await this.getPermissions(userId);

      if (!permissions) {
        return false;
      }

      return permissions.roles.includes(role);
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to check role', {
        source: PermissionCacheService.name,
        method: 'hasRole',
        userId,
        role,
      });
      return false;
    }
  }

  /**
   * Check if user has a specific permission
   * @param userId User ID
   * @param permission Permission to check
   * @returns True if user has the permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const permissions = await this.getPermissions(userId);

      if (!permissions) {
        return false;
      }

      return permissions.permissions.includes(permission);
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to check permission', {
        source: PermissionCacheService.name,
        method: 'hasPermission',
        userId,
        permission,
      });
      return false;
    }
  }

  /**
   * Invalidate user permissions cache
   *
   * Removes a user's permissions data from the cache.
   * This method should be called whenever a user's permissions are updated
   * to ensure that cached data doesn't become stale.
   *
   * @param userId User ID
   * @returns True if invalidated successfully
   */
  async invalidatePermissions(userId: string): Promise<boolean> {
    try {
      await this.permissionRepository.delete(userId);

      this.loggingService.debug(
        `Invalidated permissions cache for user ${userId}`,
        'invalidatePermissions',
        { userId },
      );

      return true;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to invalidate permissions cache', {
        source: PermissionCacheService.name,
        method: 'invalidatePermissions',
        userId,
      });
      return false;
    }
  }

  /**
   * Invalidate all permissions cache entries
   *
   * Removes all permissions data from the cache.
   * This is a more aggressive form of cache invalidation that should be used
   * sparingly, such as when making schema changes or during maintenance.
   *
   * @returns True if invalidation was successful
   */
  async invalidateAllPermissions(): Promise<boolean> {
    try {
      // Use the cache invalidation service to invalidate by prefix
      await this.cacheInvalidation.invalidateByPrefix('permissions:user');

      this.loggingService.debug(
        'Invalidated all permissions cache entries',
        'invalidateAllPermissions',
      );

      return true;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error,
        'Failed to invalidate all permissions cache',
        {
          source: PermissionCacheService.name,
          method: 'invalidateAllPermissions',
        },
      );
      return false;
    }
  }
}

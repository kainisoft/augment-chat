import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@app/redis';
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
 * Handles caching of user permissions in Redis
 */
@Injectable()
export class PermissionCacheService {
  private readonly keyPrefix = 'permissions:user:';
  private readonly defaultTtl: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    // Set context for all logs from this service
    this.loggingService.setContext(PermissionCacheService.name);

    // Get default TTL from config
    this.defaultTtl = this.configService.get<number>(
      'PERMISSION_CACHE_TTL',
      3600,
    ); // 1 hour
  }

  /**
   * Cache user permissions
   * @param userId User ID
   * @param roles User roles
   * @param permissions User permissions
   * @param ttl Cache TTL in seconds
   * @returns True if cached successfully
   */
  async cachePermissions(
    userId: string,
    roles: string[],
    permissions: string[],
    ttl: number = this.defaultTtl,
  ): Promise<boolean> {
    try {
      const key = `${this.keyPrefix}${userId}`;
      const data: UserPermissionData = {
        userId,
        roles,
        permissions,
        updatedAt: Date.now(),
      };

      await this.redisService.set(key, JSON.stringify(data), ttl);

      this.loggingService.debug(
        `Cached permissions for user ${userId}`,
        'cachePermissions',
        {
          userId,
          roleCount: roles.length,
          permissionCount: permissions.length,
        },
      );

      return true;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to cache permissions', {
        source: PermissionCacheService.name,
        method: 'cachePermissions',
        userId,
        roleCount: roles.length,
        permissionCount: permissions.length,
      });
      return false;
    }
  }

  /**
   * Get user permissions from cache
   * @param userId User ID
   * @returns User permission data or null if not found
   */
  async getPermissions(userId: string): Promise<UserPermissionData | null> {
    try {
      const key = `${this.keyPrefix}${userId}`;
      const data = await this.redisService.get(key);

      if (!data) {
        return null;
      }

      const permissionData = JSON.parse(data) as UserPermissionData;

      this.loggingService.debug(
        `Retrieved permissions for user ${userId} from cache`,
        'getPermissions',
        { userId },
      );

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
   * @param userId User ID
   * @returns True if invalidated successfully
   */
  async invalidatePermissions(userId: string): Promise<boolean> {
    try {
      const key = `${this.keyPrefix}${userId}`;
      await this.redisService.del(key);

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
}

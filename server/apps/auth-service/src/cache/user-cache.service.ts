import { Injectable } from '@nestjs/common';
import { RedisService } from '@app/redis';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { UserAuthInfoReadModel } from '../domain/read-models/user-auth-info.read-model';

/**
 * User Cache Service
 *
 * Service for caching user authentication data.
 */
@Injectable()
export class UserCacheService {
  private readonly userPrefix = 'user:auth:';
  private readonly emailPrefix = 'user:email:';
  private readonly defaultTtl = 3600; // 1 hour

  constructor(
    private readonly redisService: RedisService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserCacheService.name);
  }

  /**
   * Cache a user by ID
   * @param userId - The user ID
   * @param user - The user data
   * @param ttl - Optional TTL in seconds
   */
  async cacheUser(
    userId: string,
    user: UserAuthInfoReadModel,
    ttl = this.defaultTtl,
  ): Promise<void> {
    try {
      const key = this.getUserKey(userId);
      await this.redisService.set(key, JSON.stringify(user), ttl);

      this.loggingService.debug(`Cached user: ${userId}`, 'cacheUser', {
        userId,
      });
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Failed to cache user: ${userId}`,
        {
          source: UserCacheService.name,
          method: 'cacheUser',
          userId,
        },
      );
    }
  }

  /**
   * Get a user by ID from cache
   * @param userId - The user ID
   * @returns The user data or null if not found
   */
  async getUser(userId: string): Promise<UserAuthInfoReadModel | null> {
    try {
      const key = this.getUserKey(userId);
      const data = await this.redisService.get(key);

      if (!data) {
        return null;
      }

      const user = JSON.parse(data) as UserAuthInfoReadModel;

      this.loggingService.debug(
        `Retrieved user from cache: ${userId}`,
        'getUser',
        { userId },
      );

      return user;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Failed to get user from cache: ${userId}`,
        {
          source: UserCacheService.name,
          method: 'getUser',
          userId,
        },
      );
      return null;
    }
  }

  /**
   * Cache a user by email
   * @param email - The user email
   * @param user - The user data
   * @param ttl - Optional TTL in seconds
   */
  async cacheUserByEmail(
    email: string,
    user: UserAuthInfoReadModel,
    ttl = this.defaultTtl,
  ): Promise<void> {
    try {
      const key = this.getEmailKey(email);
      await this.redisService.set(key, JSON.stringify(user), ttl);

      this.loggingService.debug(
        `Cached user by email: ${email}`,
        'cacheUserByEmail',
        { email, userId: user.id },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Failed to cache user by email: ${email}`,
        {
          source: UserCacheService.name,
          method: 'cacheUserByEmail',
          email,
          userId: user.id,
        },
      );
    }
  }

  /**
   * Get a user by email from cache
   * @param email - The user email
   * @returns The user data or null if not found
   */
  async getUserByEmail(email: string): Promise<UserAuthInfoReadModel | null> {
    try {
      const key = this.getEmailKey(email);
      const data = await this.redisService.get(key);

      if (!data) {
        return null;
      }

      const user = JSON.parse(data) as UserAuthInfoReadModel;

      this.loggingService.debug(
        `Retrieved user by email from cache: ${email}`,
        'getUserByEmail',
        { email, userId: user.id },
      );

      return user;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Failed to get user by email from cache: ${email}`,
        {
          source: UserCacheService.name,
          method: 'getUserByEmail',
          email,
        },
      );
      return null;
    }
  }

  /**
   * Invalidate user cache
   * @param userId - The user ID
   * @param email - Optional user email
   */
  async invalidateUser(userId: string, email?: string): Promise<void> {
    try {
      const userKey = this.getUserKey(userId);
      await this.redisService.del(userKey);

      if (email) {
        const emailKey = this.getEmailKey(email);
        await this.redisService.del(emailKey);
      }

      this.loggingService.debug(
        `Invalidated user cache: ${userId}`,
        'invalidateUser',
        { userId, email },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Failed to invalidate user cache: ${userId}`,
        {
          source: UserCacheService.name,
          method: 'invalidateUser',
          userId,
          email,
        },
      );
    }
  }

  /**
   * Get the Redis key for a user ID
   * @param userId - The user ID
   * @returns The Redis key
   */
  private getUserKey(userId: string): string {
    return `${this.userPrefix}${userId}`;
  }

  /**
   * Get the Redis key for a user email
   * @param email - The user email
   * @returns The Redis key
   */
  private getEmailKey(email: string): string {
    return `${this.emailPrefix}${email}`;
  }
}

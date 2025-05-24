import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@app/redis';
import { RedisRepositoryFactory } from '@app/redis/repositories/redis-repository.factory';
import { CacheInvalidationService } from '@app/redis/cache';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { UserAuthInfoReadModel } from '../domain/read-models/user-auth-info.read-model';

/**
 * User Cache Service
 *
 * Service for caching user authentication data in Redis.
 * This service uses Redis repositories for type-safe caching operations
 * and follows the standardized caching pattern across services.
 */
@Injectable()
export class UserCacheService {
  private readonly userRepository;
  private readonly emailRepository;
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
    this.loggingService.setContext(UserCacheService.name);

    // Create repositories
    this.userRepository = this.repositoryFactory.create<
      UserAuthInfoReadModel,
      string
    >('user:auth');
    this.emailRepository = this.repositoryFactory.create<
      UserAuthInfoReadModel,
      string
    >('user:email');

    // Get TTL value from config
    this.defaultTtl = this.configService.get<number>('USER_CACHE_TTL', 3600); // 1 hour default
  }

  /**
   * Cache a user by ID
   *
   * Stores a user's authentication information in the cache using the user ID as the key.
   * This method is typically called after retrieving a user from the database to avoid
   * future database queries for the same user.
   *
   * @param userId - The user ID to use as the cache key
   * @param user - The user authentication data to cache
   * @param ttl - Optional TTL in seconds (defaults to the service's default TTL)
   * @returns The cached user data
   */
  async cacheUser(
    userId: string,
    user: UserAuthInfoReadModel,
    ttl = this.defaultTtl,
  ): Promise<UserAuthInfoReadModel> {
    try {
      const result = await this.userRepository.save(userId, user, ttl);

      this.loggingService.debug(`Cached user: ${userId}`, 'cacheUser', {
        userId,
        ttl,
      });

      return result;
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
      return user; // Return the original user even if caching fails
    }
  }

  /**
   * Get a user by ID from cache
   *
   * Retrieves a user's authentication information from the cache using the user ID.
   * This method is typically called before querying the database to improve performance.
   *
   * @param userId - The user ID to look up in the cache
   * @returns The cached user data or null if not found
   */
  async getUser(userId: string): Promise<UserAuthInfoReadModel | null> {
    try {
      const user = await this.userRepository.findById(userId);

      if (user) {
        this.loggingService.debug(
          `Retrieved user from cache: ${userId}`,
          'getUser',
          { userId, source: 'cache' },
        );
      }

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
   *
   * Stores a user's authentication information in the cache using the email as the key.
   * This method is typically called after retrieving a user from the database to avoid
   * future database queries for the same email.
   *
   * @param email - The user email to use as the cache key
   * @param user - The user authentication data to cache
   * @param ttl - Optional TTL in seconds (defaults to the service's default TTL)
   * @returns The cached user data
   */
  async cacheUserByEmail(
    email: string,
    user: UserAuthInfoReadModel,
    ttl = this.defaultTtl,
  ): Promise<UserAuthInfoReadModel> {
    try {
      const result = await this.emailRepository.save(email, user, ttl);

      this.loggingService.debug(
        `Cached user by email: ${email}`,
        'cacheUserByEmail',
        { email, userId: user.id, ttl },
      );

      return result;
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
      return user; // Return the original user even if caching fails
    }
  }

  /**
   * Get a user by email from cache
   *
   * Retrieves a user's authentication information from the cache using the email.
   * This method is typically called before querying the database to improve performance.
   *
   * @param email - The user email to look up in the cache
   * @returns The cached user data or null if not found
   */
  async getUserByEmail(email: string): Promise<UserAuthInfoReadModel | null> {
    try {
      const user = await this.emailRepository.findById(email);

      if (user) {
        this.loggingService.debug(
          `Retrieved user by email from cache: ${email}`,
          'getUserByEmail',
          { email, userId: user.id, source: 'cache' },
        );
      }

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
   *
   * Removes a user's data from the cache, both by ID and optionally by email.
   * This method should be called whenever a user's data is updated to ensure
   * that cached data doesn't become stale.
   *
   * @param userId - The user ID to invalidate
   * @param email - Optional user email to invalidate
   * @returns True if invalidation was successful
   */
  async invalidateUser(userId: string, email?: string): Promise<boolean> {
    try {
      // Delete from user repository
      await this.userRepository.delete(userId);

      // If email is provided, delete from email repository too
      if (email) {
        await this.emailRepository.delete(email);
      }

      // Log the invalidation
      this.loggingService.debug(
        `Invalidated user cache: ${userId}`,
        'invalidateUser',
        { userId, email },
      );

      return true;
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
      return false;
    }
  }

  /**
   * Invalidate all user cache entries
   *
   * Removes all user data from the cache.
   * This is a more aggressive form of cache invalidation that should be used
   * sparingly, such as when making schema changes or during maintenance.
   *
   * @returns True if invalidation was successful
   */
  async invalidateAllUsers(): Promise<boolean> {
    try {
      // Use the cache invalidation service to invalidate by prefix
      await this.cacheInvalidation.invalidateByPrefix('user:auth');
      await this.cacheInvalidation.invalidateByPrefix('user:email');

      this.loggingService.debug(
        'Invalidated all user cache entries',
        'invalidateAllUsers',
      );

      return true;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to invalidate all user cache entries',
        {
          source: UserCacheService.name,
          method: 'invalidateAllUsers',
        },
      );
      return false;
    }
  }
}

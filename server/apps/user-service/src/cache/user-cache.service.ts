import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisRepositoryFactory } from '@app/redis/repositories/redis-repository.factory';
import { CacheInvalidationService } from '@app/redis/cache';
import {
  generateSearchCacheKey,
  CacheTTL,
  calculateTTLWithJitter,
} from '@app/redis/cache/utils';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { UserProfileReadModel } from '../domain/read-models/user-profile.read-model';

/**
 * User Cache Service
 *
 * Handles caching of user profile data in Redis.
 * This service uses Redis repositories for type-safe caching operations
 * and follows the standardized caching pattern across services.
 */
@Injectable()
export class UserCacheService {
  private readonly userProfileRepository;
  private readonly searchResultsRepository;
  private readonly defaultTtl: number;
  private readonly searchTtl: number;

  constructor(
    private readonly repositoryFactory: RedisRepositoryFactory,
    private readonly cacheInvalidation: CacheInvalidationService,
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    // Set context for all logs from this service
    this.loggingService.setContext(UserCacheService.name);

    // Create repositories
    this.userProfileRepository = this.repositoryFactory.create<
      UserProfileReadModel,
      string
    >('user:profile');
    this.searchResultsRepository = this.repositoryFactory.create<
      UserProfileReadModel[],
      string
    >('user:search');

    // Get TTL values from config with defaults
    this.defaultTtl = this.configService.get<number>('USER_CACHE_TTL', CacheTTL.FIVE_MINUTES);
    this.searchTtl = this.configService.get<number>('SEARCH_CACHE_TTL', CacheTTL.ONE_MINUTE);
  }

  /**
   * Cache a user profile
   *
   * Stores a user's profile information in the cache using the user ID as the key.
   * This method is typically called after retrieving a user profile from the database
   * to avoid future database queries for the same user.
   *
   * @param userId - The user ID to use as the cache key
   * @param profile - The user profile data to cache
   * @param ttl - Optional TTL in seconds (defaults to the service's default TTL)
   * @returns The cached profile data
   */
  async cacheUserProfile(
    userId: string,
    profile: UserProfileReadModel,
    ttl: number = this.defaultTtl,
  ): Promise<UserProfileReadModel> {
    try {
      // Add jitter to TTL to prevent cache stampedes
      const ttlWithJitter = calculateTTLWithJitter(ttl);

      const result = await this.userProfileRepository.save(
        userId,
        profile,
        ttlWithJitter,
      );

      this.loggingService.debug(
        `Cached user profile for user ${userId}`,
        'cacheUserProfile',
        { userId, ttl: ttlWithJitter },
      );

      return result;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to cache user profile',
        {
          source: UserCacheService.name,
          method: 'cacheUserProfile',
          userId,
        },
      );
      return profile; // Return the original profile even if caching fails
    }
  }

  /**
   * Get a user profile from cache
   *
   * Retrieves a user's profile information from the cache using the user ID.
   * This method is typically called before querying the database to improve performance.
   *
   * @param userId - The user ID to look up in the cache
   * @returns The cached user profile or null if not found
   */
  async getUserProfile(userId: string): Promise<UserProfileReadModel | null> {
    try {
      const profile = await this.userProfileRepository.findById(userId);

      if (profile) {
        this.loggingService.debug(
          `Retrieved user profile for user ${userId} from cache`,
          'getUserProfile',
          { userId, source: 'cache' },
        );
      }

      return profile;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to get user profile from cache',
        {
          source: UserCacheService.name,
          method: 'getUserProfile',
          userId,
        },
      );
      return null;
    }
  }

  /**
   * Cache search results
   *
   * Stores search results in the cache using a normalized search term as the key.
   * This method is typically called after performing a search to avoid
   * future database queries for the same search term.
   *
   * @param searchTerm - The search term to use as the cache key
   * @param results - The search results to cache
   * @param ttl - Optional TTL in seconds (defaults to the service's search TTL)
   * @returns The cached search results
   */
  async cacheSearchResults(
    searchTerm: string,
    results: UserProfileReadModel[],
    ttl: number = this.searchTtl,
  ): Promise<UserProfileReadModel[]> {
    try {
      // Use the utility function to generate a normalized cache key
      const cacheKey = generateSearchCacheKey(searchTerm);

      // Add jitter to TTL to prevent cache stampedes
      const ttlWithJitter = calculateTTLWithJitter(ttl);

      const result = await this.searchResultsRepository.save(
        cacheKey,
        results,
        ttlWithJitter,
      );

      this.loggingService.debug(
        `Cached search results for term "${searchTerm}"`,
        'cacheSearchResults',
        { searchTerm, resultCount: results.length, ttl: ttlWithJitter },
      );

      return result;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to cache search results',
        {
          source: UserCacheService.name,
          method: 'cacheSearchResults',
          searchTerm,
          resultCount: results.length,
        },
      );
      return results; // Return the original results even if caching fails
    }
  }

  /**
   * Get search results from cache
   *
   * Retrieves search results from the cache using a normalized search term.
   * This method is typically called before performing a search to improve performance.
   *
   * @param searchTerm - The search term to look up in the cache
   * @returns The cached search results or null if not found
   */
  async getSearchResults(
    searchTerm: string,
  ): Promise<UserProfileReadModel[] | null> {
    try {
      // Use the utility function to generate a normalized cache key
      const cacheKey = generateSearchCacheKey(searchTerm);
      const results = await this.searchResultsRepository.findById(cacheKey);

      if (results) {
        this.loggingService.debug(
          `Retrieved search results for term "${searchTerm}" from cache`,
          'getSearchResults',
          { searchTerm, resultCount: results.length, source: 'cache' },
        );
      }

      return results;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to get search results from cache',
        {
          source: UserCacheService.name,
          method: 'getSearchResults',
          searchTerm,
        },
      );
      return null;
    }
  }

  /**
   * Invalidate a user profile in cache
   *
   * Removes a user's profile data from the cache.
   * This method should be called whenever a user's profile is updated
   * to ensure that cached data doesn't become stale.
   *
   * @param userId - The user ID to invalidate
   * @returns True if invalidated successfully
   */
  async invalidateUserProfile(userId: string): Promise<boolean> {
    try {
      await this.userProfileRepository.delete(userId);

      this.loggingService.debug(
        `Invalidated user profile cache for user ${userId}`,
        'invalidateUserProfile',
        { userId },
      );

      return true;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to invalidate user profile cache',
        {
          source: UserCacheService.name,
          method: 'invalidateUserProfile',
          userId,
        },
      );
      return false;
    }
  }

  /**
   * Invalidate search results in cache
   *
   * Removes search results from the cache. If a search term is provided,
   * only that specific search result is invalidated. Otherwise, all search
   * results are invalidated.
   *
   * @param searchTerm - Optional search term to invalidate (if not provided, all search results are invalidated)
   * @returns True if invalidated successfully
   */
  async invalidateSearchResults(searchTerm?: string): Promise<boolean> {
    try {
      if (searchTerm) {
        // Use the utility function to generate a normalized cache key
        const cacheKey = generateSearchCacheKey(searchTerm);
        await this.searchResultsRepository.delete(cacheKey);

        this.loggingService.debug(
          `Invalidated search results cache for term "${searchTerm}"`,
          'invalidateSearchResults',
          { searchTerm },
        );
      } else {
        // Use the cache invalidation service to invalidate by prefix
        await this.cacheInvalidation.invalidateByPrefix('user:search');

        this.loggingService.debug(
          'Invalidated all search results cache',
          'invalidateSearchResults',
        );
      }

      return true;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to invalidate search results cache',
        {
          source: UserCacheService.name,
          method: 'invalidateSearchResults',
          searchTerm,
        },
      );
      return false;
    }
  }

  /**
   * Invalidate all user cache entries
   *
   * Removes all user data from the cache, including profiles and search results.
   * This is a more aggressive form of cache invalidation that should be used
   * sparingly, such as when making schema changes or during maintenance.
   *
   * @returns True if invalidation was successful
   */
  async invalidateAllUsers(): Promise<boolean> {
    try {
      // Use the cache invalidation service to invalidate by prefix
      await this.cacheInvalidation.invalidateByPrefix('user:profile');
      await this.cacheInvalidation.invalidateByPrefix('user:search');

      this.loggingService.debug(
        'Invalidated all user cache entries',
        'invalidateAllUsers',
      );

      return true;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
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

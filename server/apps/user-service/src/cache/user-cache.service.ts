import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@app/redis';
import { RedisRepositoryFactory } from '@app/redis/repositories/redis-repository.factory';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { UserProfileReadModel } from '../domain/read-models/user-profile.read-model';

/**
 * User Cache Service
 *
 * Handles caching of user data in Redis
 */
@Injectable()
export class UserCacheService {
  private readonly userProfileRepository;
  private readonly searchResultsRepository;
  private readonly defaultTtl: number;
  private readonly searchTtl: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly repositoryFactory: RedisRepositoryFactory,
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
    >('profile');
    this.searchResultsRepository = this.repositoryFactory.create<
      UserProfileReadModel[],
      string
    >('search');

    // Get TTL values from config
    this.defaultTtl = this.configService.get<number>('USER_CACHE_TTL', 300); // 5 minutes
    this.searchTtl = this.configService.get<number>('SEARCH_CACHE_TTL', 60); // 1 minute
  }

  /**
   * Cache a user profile
   * @param userId User ID
   * @param profile User profile data
   * @param ttl Cache TTL in seconds (optional)
   * @returns The cached profile
   */
  async cacheUserProfile(
    userId: string,
    profile: UserProfileReadModel,
    ttl: number = this.defaultTtl,
  ): Promise<UserProfileReadModel> {
    try {
      const result = await this.userProfileRepository.save(
        userId,
        profile,
        ttl,
      );

      this.loggingService.debug(
        `Cached user profile for user ${userId}`,
        'cacheUserProfile',
        { userId, ttl },
      );

      return result;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to cache user profile', {
        source: UserCacheService.name,
        method: 'cacheUserProfile',
        userId,
      });
      return profile; // Return the original profile even if caching fails
    }
  }

  /**
   * Get a user profile from cache
   * @param userId User ID
   * @returns User profile or null if not found
   */
  async getUserProfile(userId: string): Promise<UserProfileReadModel | null> {
    try {
      const profile = await this.userProfileRepository.findById(userId);

      if (profile) {
        this.loggingService.debug(
          `Retrieved user profile for user ${userId} from cache`,
          'getUserProfile',
          { userId },
        );
      }

      return profile;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to get user profile from cache', {
        source: UserCacheService.name,
        method: 'getUserProfile',
        userId,
      });
      return null;
    }
  }

  /**
   * Cache search results
   * @param searchTerm Search term
   * @param results Search results
   * @param ttl Cache TTL in seconds (optional)
   * @returns The cached search results
   */
  async cacheSearchResults(
    searchTerm: string,
    results: UserProfileReadModel[],
    ttl: number = this.searchTtl,
  ): Promise<UserProfileReadModel[]> {
    try {
      const cacheKey = this.getSearchCacheKey(searchTerm);
      const result = await this.searchResultsRepository.save(
        cacheKey,
        results,
        ttl,
      );

      this.loggingService.debug(
        `Cached search results for term "${searchTerm}"`,
        'cacheSearchResults',
        { searchTerm, resultCount: results.length, ttl },
      );

      return result;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to cache search results', {
        source: UserCacheService.name,
        method: 'cacheSearchResults',
        searchTerm,
        resultCount: results.length,
      });
      return results; // Return the original results even if caching fails
    }
  }

  /**
   * Get search results from cache
   * @param searchTerm Search term
   * @returns Search results or null if not found
   */
  async getSearchResults(
    searchTerm: string,
  ): Promise<UserProfileReadModel[] | null> {
    try {
      const cacheKey = this.getSearchCacheKey(searchTerm);
      const results = await this.searchResultsRepository.findById(cacheKey);

      if (results) {
        this.loggingService.debug(
          `Retrieved search results for term "${searchTerm}" from cache`,
          'getSearchResults',
          { searchTerm, resultCount: results.length },
        );
      }

      return results;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Failed to get search results from cache', {
        source: UserCacheService.name,
        method: 'getSearchResults',
        searchTerm,
      });
      return null;
    }
  }

  /**
   * Invalidate a user profile in cache
   * @param userId User ID
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
      this.errorLogger.error(error, 'Failed to invalidate user profile cache', {
        source: UserCacheService.name,
        method: 'invalidateUserProfile',
        userId,
      });
      return false;
    }
  }

  /**
   * Invalidate search results in cache
   * @param searchTerm Search term (optional, if not provided all search results will be invalidated)
   * @returns True if invalidated successfully
   */
  async invalidateSearchResults(searchTerm?: string): Promise<boolean> {
    try {
      if (searchTerm) {
        const cacheKey = this.getSearchCacheKey(searchTerm);
        await this.searchResultsRepository.delete(cacheKey);

        this.loggingService.debug(
          `Invalidated search results cache for term "${searchTerm}"`,
          'invalidateSearchResults',
          { searchTerm },
        );
      } else {
        // Invalidate all search results by pattern
        const pattern = `${this.searchResultsRepository.getKeyPrefix()}*`;
        const keys = await this.redisService.getClient().keys(pattern);

        if (keys.length > 0) {
          await this.redisService.del(keys);
        }

        this.loggingService.debug(
          `Invalidated all search results cache (${keys.length} keys)`,
          'invalidateSearchResults',
        );
      }

      return true;
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error,
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
   * Get a cache key for search results
   * @param searchTerm Search term
   * @returns Cache key
   */
  private getSearchCacheKey(searchTerm: string): string {
    // Normalize search term (lowercase, trim whitespace)
    return searchTerm.toLowerCase().trim();
  }
}

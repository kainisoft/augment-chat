import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@app/database/drizzle/drizzle.service';
import { AbstractDrizzleReadRepository } from '@app/database/repositories/drizzle/drizzle-base-read.repository';
import { QueryOptions } from '@app/database/repositories/base-read.repository';
import { eq, ilike, or, and, desc, asc } from 'drizzle-orm';
import * as schema from '@app/database/schemas';
import { LoggingService } from '@app/logging';
import { ErrorLoggerService } from '@app/logging';
import { RepositoryError } from '@app/common/errors';

import { UserProfileReadModel } from '../../domain/read-models/user-profile.read-model';
import { UserReadRepository } from '../../domain/repositories/user-read.repository.interface';
import { UserCacheService } from '../../cache/user-cache.service';

/**
 * Drizzle User Read Repository
 *
 * Implementation of the UserReadRepository interface using Drizzle ORM.
 */
@Injectable()
export class DrizzleUserReadRepository
  extends AbstractDrizzleReadRepository<
    UserProfileReadModel,
    string,
    typeof schema.user.profiles
  >
  implements UserReadRepository
{
  constructor(
    drizzle: DrizzleService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly userCacheService: UserCacheService,
  ) {
    super(
      drizzle,
      schema.user.profiles,
      schema.user.profiles.id,
      [schema.user.profiles.username, schema.user.profiles.displayName], // Search fields
    );
    this.loggingService.setContext(DrizzleUserReadRepository.name);
  }

  /**
   * Find a user by username
   * @param username - The username
   * @returns The user profile or null if not found
   */
  async findByUsername(username: string): Promise<UserProfileReadModel | null> {
    try {
      this.loggingService.debug(
        `Finding user by username: ${username}`,
        'findByUsername',
      );

      // We don't have a direct cache for username lookups, but we can check
      // if we have any search results that might contain this exact username
      const cachedResults =
        await this.userCacheService.getSearchResults(username);
      if (cachedResults) {
        // Look for exact match in cached results
        const exactMatch = cachedResults.find(
          (profile) =>
            profile.username.toLowerCase() === username.toLowerCase(),
        );

        if (exactMatch) {
          this.loggingService.debug(
            `Found user by username in cache: ${username}`,
            'findByUsername',
            { username, userId: exactMatch.id, source: 'cache' },
          );

          // Get the full profile from cache using the ID
          return this.findById(exactMatch.id);
        }
      }

      // If not found in cache, get from database
      const result = await this.drizzle.db
        .select()
        .from(schema.user.profiles)
        .where(eq(schema.user.profiles.username, username))
        .limit(1);

      if (result.length === 0) {
        this.loggingService.debug(
          `User with username ${username} not found`,
          'findByUsername',
        );
        return null;
      }

      const profile = this.mapToDto(result[0]);

      // Cache the profile by ID
      await this.userCacheService.cacheUserProfile(profile.id, profile);

      this.loggingService.debug(
        `Found user by username in database: ${username}`,
        'findByUsername',
        { username, userId: profile.id, source: 'database' },
      );

      return profile;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding user by username: ${username}`,
        {
          source: DrizzleUserReadRepository.name,
          method: 'findByUsername',
          username,
        },
      );
      throw new RepositoryError(
        `Error finding user by username: ${username}`,
        { username },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Find a user by authentication ID
   * @param authId - The authentication ID
   * @returns The user profile or null if not found
   */
  async findByAuthId(authId: string): Promise<UserProfileReadModel | null> {
    try {
      this.loggingService.debug(
        `Finding user by authId: ${authId}`,
        'findByAuthId',
      );

      const result = await this.drizzle.db
        .select()
        .from(schema.user.profiles)
        .where(eq(schema.user.profiles.authId, authId))
        .limit(1);

      if (result.length === 0) {
        this.loggingService.debug(
          `User with authId ${authId} not found`,
          'findByAuthId',
        );
        return null;
      }

      return this.mapToDto(result[0]);
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding user by authId: ${authId}`,
        {
          source: DrizzleUserReadRepository.name,
          method: 'findByAuthId',
          authId,
        },
      );
      throw new RepositoryError(
        `Error finding user by authId: ${authId}`,
        { authId },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Search users by username or display name
   * @param searchTerm - The search term
   * @param options - Query options
   * @returns Array of matching user profiles
   */
  async searchUsers(
    searchTerm: string,
    options?: QueryOptions,
  ): Promise<UserProfileReadModel[]> {
    try {
      this.loggingService.debug(
        `Searching users with term: ${searchTerm}`,
        'searchUsers',
      );

      // Try to get from cache first
      // Only use cache for simple searches without complex options
      const canUseCache =
        !options || (options && !options.orderBy && !options.orderDirection);

      if (canUseCache) {
        const cachedResults =
          await this.userCacheService.getSearchResults(searchTerm);
        if (cachedResults) {
          this.loggingService.debug(
            `Retrieved search results from cache: ${searchTerm}`,
            'searchUsers',
            {
              searchTerm,
              resultCount: cachedResults.length,
              source: 'cache',
            },
          );

          // Apply pagination if needed
          if (options?.limit || options?.offset) {
            const offset = options.offset || 0;
            const limit = options.limit || cachedResults.length;
            return cachedResults.slice(offset, offset + limit);
          }

          return cachedResults;
        }
      }

      // If not in cache or can't use cache, get from database
      const query = this.drizzle.db
        .select()
        .from(schema.user.profiles)
        .where(
          or(
            ilike(schema.user.profiles.username, `%${searchTerm}%`),
            ilike(schema.user.profiles.displayName, `%${searchTerm}%`),
          ),
        );

      this.applyQueryOptions(query, options);

      const result = await query;
      const profiles = result.map((item) => this.mapToDto(item));

      // Cache the results if appropriate
      if (canUseCache) {
        await this.userCacheService.cacheSearchResults(searchTerm, profiles);
      }

      this.loggingService.debug(
        `Retrieved search results from database: ${searchTerm}`,
        'searchUsers',
        {
          searchTerm,
          resultCount: profiles.length,
          source: 'database',
        },
      );

      return profiles;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error searching users with term: ${searchTerm}`,
        {
          source: DrizzleUserReadRepository.name,
          method: 'searchUsers',
          searchTerm,
          options,
        },
      );
      throw new RepositoryError(
        `Error searching users with term: ${searchTerm}`,
        { searchTerm, options },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Get users by status
   * @param status - The user status
   * @param options - Query options
   * @returns Array of user profiles with the specified status
   */
  async getUsersByStatus(
    status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'DO_NOT_DISTURB',
    options?: QueryOptions,
  ): Promise<UserProfileReadModel[]> {
    try {
      this.loggingService.debug(
        `Getting users with status: ${status}`,
        'getUsersByStatus',
      );

      const query = this.drizzle.db
        .select()
        .from(schema.user.profiles)
        .where(eq(schema.user.profiles.status, status));

      this.applyQueryOptions(query, options);

      const result = await query;
      return result.map((item) => this.mapToDto(item));
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting users with status: ${status}`,
        {
          source: DrizzleUserReadRepository.name,
          method: 'getUsersByStatus',
          status,
          options,
        },
      );
      throw new RepositoryError(
        `Error getting users with status: ${status}`,
        { status, options },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Apply query options to a query
   * @param query - The query to apply options to
   * @param options - The query options
   */
  protected applyQueryOptions(query: any, options?: QueryOptions): void {
    if (!options) return;

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    if (options.orderBy) {
      const direction = options.orderDirection === 'desc' ? desc : asc;
      query.orderBy(direction(schema.user.profiles[options.orderBy]));
    } else {
      // Default ordering by username
      query.orderBy(asc(schema.user.profiles.username));
    }
  }

  /**
   * Map a database record to a DTO
   * @param record - The database record
   * @returns The DTO
   */
  protected mapToDto(record: any): UserProfileReadModel {
    return {
      id: record.id,
      authId: record.authId,
      username: record.username,
      displayName: record.displayName,
      bio: record.bio,
      avatarUrl: record.avatarUrl,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  /**
   * Find a user by ID
   * @param id - The entity ID
   * @returns The entity or null if not found
   */
  async findById(id: string): Promise<UserProfileReadModel | null> {
    try {
      // Try to get from cache first
      const cachedProfile = await this.userCacheService.getUserProfile(id);
      if (cachedProfile) {
        this.loggingService.debug(
          `Retrieved user profile from cache: ${id}`,
          'findById',
          { userId: id, source: 'cache' },
        );
        return cachedProfile;
      }

      // If not in cache, get from database
      const idValue = this.getIdValue(id);

      const result = await this.drizzle.db
        .select()
        .from(this.table as any)
        .where(eq(this.idField, idValue))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const profile = this.mapToDto(result[0]);

      // Cache the profile
      await this.userCacheService.cacheUserProfile(id, profile);

      this.loggingService.debug(
        `Retrieved user profile from database: ${id}`,
        'findById',
        { userId: id, source: 'database' },
      );

      return profile;
    } catch (error) {
      // If there's an error with the cache, fall back to the database
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error in findById with cache: ${id}`,
        {
          source: DrizzleUserReadRepository.name,
          method: 'findById',
          userId: id,
        },
      );

      // Fall back to original implementation
      return super.findById(id);
    }
  }

  /**
   * Get the ID value for database operations
   * @param id - The entity ID
   * @returns The database ID value
   */
  protected getIdValue(id: string): string {
    return id;
  }
}

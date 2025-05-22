import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@app/database/drizzle/drizzle.service';
import { AbstractDrizzleReadRepository } from '@app/database/repositories/drizzle/drizzle-base-read.repository';
import { eq } from 'drizzle-orm';
import * as schema from '@app/database/schemas';
import { UserAuthInfoReadModel } from '../../domain/read-models/user-auth-info.read-model';
import { UserAuthReadRepository } from '../../domain/repositories/user-auth-read.repository.interface';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { UserCacheService } from '../../cache/user-cache.service';

/**
 * Drizzle User Auth Read Repository
 *
 * Implementation of the UserAuthReadRepository interface using Drizzle ORM.
 */
@Injectable()
export class DrizzleUserAuthReadRepository
  extends AbstractDrizzleReadRepository<
    UserAuthInfoReadModel,
    string,
    typeof schema.auth.users
  >
  implements UserAuthReadRepository
{
  constructor(
    drizzle: DrizzleService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly userCacheService: UserCacheService,
  ) {
    super(
      drizzle,
      schema.auth.users,
      schema.auth.users.id,
      [schema.auth.users.email], // Search fields
    );
    this.loggingService.setContext(DrizzleUserAuthReadRepository.name);
  }

  /**
   * Find a user by email
   * @param email - The user email
   * @returns The user auth info or null if not found
   */
  async findByEmail(email: string): Promise<UserAuthInfoReadModel | null> {
    try {
      this.loggingService.debug(
        `Finding user auth info by email: ${email}`,
        'findByEmail',
      );

      // Try to get from cache first
      const cachedUser = await this.userCacheService.getUserByEmail(email);
      if (cachedUser) {
        this.loggingService.debug(
          `Retrieved user auth info from cache by email: ${email}`,
          'findByEmail',
          { email, userId: cachedUser.id, source: 'cache' },
        );
        return cachedUser;
      }

      // If not in cache, get from database
      const result = await this.drizzle.db
        .select()
        .from(schema.auth.users)
        .where(eq(schema.auth.users.email, email))
        .limit(1);

      if (result.length === 0) {
        this.loggingService.debug(
          `User auth info with email ${email} not found`,
          'findByEmail',
        );
        return null;
      }

      const userAuthInfo = this.mapToDto(result[0]);

      // Cache the user
      await this.userCacheService.cacheUserByEmail(email, userAuthInfo);

      this.loggingService.debug(
        `Found user auth info by email in database: ${email}`,
        'findByEmail',
        { email, userId: userAuthInfo.id, source: 'database' },
      );

      return userAuthInfo;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding user auth info by email: ${email}`,
        {
          source: DrizzleUserAuthReadRepository.name,
          method: 'findByEmail',
          email,
        },
      );

      // Fall back to original implementation without caching
      const result = await this.drizzle.db
        .select()
        .from(schema.auth.users)
        .where(eq(schema.auth.users.email, email))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapToDto(result[0]);
    }
  }

  /**
   * Convert an ID to its database value
   * @param id - The entity ID
   * @returns The database ID value
   */
  protected getIdValue(id: string): string {
    return id;
  }

  /**
   * Find a user by ID
   * @param id - The user ID
   * @returns The user auth info or null if not found
   */
  async findById(id: string): Promise<UserAuthInfoReadModel | null> {
    try {
      this.loggingService.debug(
        `Finding user auth info by ID: ${id}`,
        'findById',
      );

      // Try to get from cache first
      const cachedUser = await this.userCacheService.getUser(id);
      if (cachedUser) {
        this.loggingService.debug(
          `Retrieved user auth info from cache: ${id}`,
          'findById',
          { userId: id, source: 'cache' },
        );
        return cachedUser;
      }

      // If not in cache, get from database
      const result = await super.findById(id);

      if (result) {
        // Cache the user
        await this.userCacheService.cacheUser(id, result);

        this.loggingService.debug(
          `Found user auth info by ID in database: ${id}`,
          'findById',
          { userId: id, source: 'database' },
        );
      } else {
        this.loggingService.debug(
          `User auth info with ID ${id} not found`,
          'findById',
        );
      }

      return result;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding user auth info by ID: ${id}`,
        {
          source: DrizzleUserAuthReadRepository.name,
          method: 'findById',
          userId: id,
        },
      );

      // Fall back to original implementation without caching
      return super.findById(id);
    }
  }

  /**
   * Map a database record to a DTO
   * @param data - The database record
   * @returns The DTO
   */
  protected mapToDto(data: Record<string, any>): UserAuthInfoReadModel {
    // Handle dates safely
    const createdAt =
      data.created_at instanceof Date
        ? data.created_at
        : new Date(data.created_at as string);

    const updatedAt =
      data.updated_at instanceof Date
        ? data.updated_at
        : new Date(data.updated_at as string);

    const lastLoginAt = data.last_login_at
      ? data.last_login_at instanceof Date
        ? data.last_login_at
        : new Date(data.last_login_at as string)
      : null;

    const lockedUntil = data.locked_until
      ? data.locked_until instanceof Date
        ? data.locked_until
        : new Date(data.locked_until as string)
      : null;

    return {
      id: data.id as string,
      email: data.email as string,
      password: data.password as string,
      isActive: Boolean(data.is_active),
      isVerified: Boolean(data.is_verified),
      lastLoginAt,
      createdAt,
      updatedAt,
      failedLoginAttempts: parseInt(data.failed_login_attempts || '0', 10),
      lockedUntil,
    };
  }
}

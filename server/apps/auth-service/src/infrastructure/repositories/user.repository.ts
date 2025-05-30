import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@app/database/drizzle/drizzle.service';
import { AbstractDrizzleWriteRepository } from '@app/database/repositories/drizzle/drizzle-base-write.repository';
import { eq } from 'drizzle-orm';
import * as schema from '@app/database/schemas';
import { UserId, Email } from '@app/domain';
import { User } from '../../domain/models/user.entity';
import { Password } from '../../domain/models/value-objects/password.value-object';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { UserCacheService } from '../../cache/user-cache.service';

/**
 * Drizzle User Repository
 *
 * Implementation of the UserRepository interface using Drizzle ORM.
 */
@Injectable()
export class DrizzleUserRepository
  extends AbstractDrizzleWriteRepository<User, UserId, typeof schema.auth.users>
  implements UserRepository
{
  constructor(
    drizzle: DrizzleService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly userCacheService: UserCacheService,
  ) {
    super(drizzle, schema.auth.users, schema.auth.users.id);
    this.loggingService.setContext(DrizzleUserRepository.name);
  }

  /**
   * Find a user by email
   * @param email - The user email
   * @returns The user or null if not found
   */
  async findByEmail(email: Email): Promise<User | null> {
    try {
      this.loggingService.debug(
        `Finding user by email: ${email.toString()}`,
        'findByEmail',
      );

      // Try to get from cache first
      const cachedUser = await this.userCacheService.getUserByEmail(email.toString());
      if (cachedUser) {
        this.loggingService.debug(
          `Retrieved user from cache by email: ${email.toString()}`,
          'findByEmail',
          { email: email.toString(), userId: cachedUser.id, source: 'cache' },
        );

        return this.mapToDomain({
          ...cachedUser,
          // Ensure dates are properly handled
          createdAt: new Date(cachedUser.createdAt),
          updatedAt: new Date(cachedUser.updatedAt),
          lastLoginAt: cachedUser.lastLoginAt ? new Date(cachedUser.lastLoginAt) : null,
          lockedUntil: cachedUser.lockedUntil ? new Date(cachedUser.lockedUntil) : null,
        });
      }

      // If not in cache, get from database
      const result = await this.drizzle.db
        .select()
        .from(schema.auth.users)
        .where(eq(schema.auth.users.email, email.toString()))
        .limit(1);

      if (result.length === 0) {
        this.loggingService.debug(
          `User with email ${email.toString()} not found`,
          'findByEmail',
        );
        return null;
      }

      const user = this.mapToDomain(result[0]);

      // Cache the user
      await this.userCacheService.cacheUserByEmail(email.toString(), {
        id: user.getId().toString(),
        email: user.getEmail().toString(),
        password: user.getPassword().toString(),
        isActive: user.getIsActive(),
        isVerified: user.getIsVerified(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
        lastLoginAt: user.getLastLoginAt(),
        failedLoginAttempts: user.getFailedLoginAttempts(),
        lockedUntil: user.getLockedUntil(),
      });

      this.loggingService.debug(
        `Found user by email in database: ${email.toString()}`,
        'findByEmail',
        { email: email.toString(), userId: user.getId().toString(), source: 'database' },
      );

      return user;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding user by email: ${email.toString()}`,
        {
          source: DrizzleUserRepository.name,
          method: 'findByEmail',
          email: email.toString(),
        },
      );

      // Fall back to original implementation without caching
      const result = await this.drizzle.db
        .select()
        .from(schema.auth.users)
        .where(eq(schema.auth.users.email, email.toString()))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return this.mapToDomain(result[0]);
    }
  }

  /**
   * Find a user by ID
   * @param id - The user ID
   * @returns The user or null if not found
   */
  async findById(id: UserId): Promise<User | null> {
    try {
      this.loggingService.debug(
        `Finding user by ID: ${id.toString()}`,
        'findById',
      );

      // Try to get from cache first
      const cachedUser = await this.userCacheService.getUser(id.toString());
      if (cachedUser) {
        this.loggingService.debug(
          `Retrieved user from cache: ${id.toString()}`,
          'findById',
          { userId: id.toString(), source: 'cache' },
        );

        return this.mapToDomain({
          ...cachedUser,
          // Ensure dates are properly handled
          createdAt: new Date(cachedUser.createdAt),
          updatedAt: new Date(cachedUser.updatedAt),
          lastLoginAt: cachedUser.lastLoginAt
            ? new Date(cachedUser.lastLoginAt)
            : null,
          lockedUntil: cachedUser.lockedUntil
            ? new Date(cachedUser.lockedUntil)
            : null,
        });
      }

      // If not in cache, get from database
      const result = await super.findById(id);

      if (result) {
        // Cache the user
        await this.userCacheService.cacheUser(id.toString(), {
          id: result.getId().toString(),
          email: result.getEmail().toString(),
          password: result.getPassword().toString(),
          isActive: result.getIsActive(),
          isVerified: result.getIsVerified(),
          createdAt: result.getCreatedAt(),
          updatedAt: result.getUpdatedAt(),
          lastLoginAt: result.getLastLoginAt(),
          failedLoginAttempts: result.getFailedLoginAttempts(),
          lockedUntil: result.getLockedUntil(),
        });

        this.loggingService.debug(
          `Found user by ID in database: ${id.toString()}`,
          'findById',
          {
            userId: id.toString(),
            source: 'database',
          },
        );
      } else {
        this.loggingService.debug(
          `User with ID ${id.toString()} not found`,
          'findById',
        );
      }

      return result;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding user by ID: ${id.toString()}`,
        {
          source: DrizzleUserRepository.name,
          method: 'findById',
          userId: id.toString(),
        },
      );

      // Fall back to original implementation without caching
      return super.findById(id);
    }
  }

  /**
   * Convert an ID to its database value
   * @param id - The entity ID
   * @returns The database ID value
   */
  protected getIdValue(id: UserId): string {
    return id.toString();
  }

  /**
   * Get the ID from an entity
   * @param entity - The entity
   * @returns The entity ID
   */
  protected getEntityId(entity: User): UserId {
    return entity.getId();
  }

  /**
   * Map a database record to a domain entity
   * @param data - The database record
   * @returns The domain entity
   */
  protected mapToDomain(data: Record<string, any>): User {
    // Handle dates safely
    const createdAt =
      data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt);

    const updatedAt =
      data.updatedAt instanceof Date
        ? data.updatedAt
        : new Date(data.updatedAt);

    const lastLoginAt = data.lastLoginAt
      ? data.lastLoginAt instanceof Date
        ? data.lastLoginAt
        : new Date(data.lastLoginAt)
      : null;

    const lockedUntil = data.lockedUntil ? new Date(data.lockedUntil) : null;

    return new User({
      id: new UserId(data.id),
      email: new Email(data.email),
      password: new Password(data.password, true),
      isActive: !!data.isActive,
      isVerified: !!data.isVerified,
      createdAt,
      updatedAt,
      lastLoginAt,
      failedLoginAttempts: parseInt(data.failedLoginAttempts || 0),
      lockedUntil,
    });
  }

  /**
   * Save an entity (create or update)
   * @param entity - The entity to save
   */
  async save(entity: User): Promise<void> {
    try {
      this.loggingService.debug(
        `Saving user: ${entity.getId().toString()}`,
        'save',
        { userId: entity.getId().toString() },
      );

      // Save to database
      await super.save(entity);

      // Invalidate cache
      await this.userCacheService.invalidateUser(
        entity.getId().toString(),
        entity.getEmail().toString(),
      );

      this.loggingService.debug(
        `Saved user and invalidated cache: ${entity.getId().toString()}`,
        'save',
        { userId: entity.getId().toString() },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error saving user: ${entity.getId().toString()}`,
        {
          source: DrizzleUserRepository.name,
          method: 'save',
          userId: entity.getId().toString(),
        },
      );

      // Fall back to original implementation
      await super.save(entity);
    }
  }

  /**
   * Map a domain entity to a database record
   * @param entity - The domain entity
   * @returns The database record
   */
  protected mapToPersistence(entity: User): Record<string, any> {
    return {
      id: entity.getId().toString(),
      email: entity.getEmail().toString(),
      password: entity.getPassword().toString(),
      isActive: entity.getIsActive(),
      isVerified: entity.getIsVerified(),
      updatedAt: entity.getUpdatedAt(),
      lastLoginAt: entity.getLastLoginAt(),
      failedLoginAttempts: entity.getFailedLoginAttempts(),
      lockedUntil: entity.getLockedUntil(),
    };
  }
}

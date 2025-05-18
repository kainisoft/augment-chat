import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@app/database/drizzle/drizzle.service';
import { AbstractDrizzleWriteRepository } from '@app/database/repositories/drizzle/drizzle-base-write.repository';
import { eq } from 'drizzle-orm';
import * as schema from '@app/database/schemas';
import { LoggingService } from '@app/logging';
import { ErrorLoggerService } from '@app/logging';
import { RepositoryError } from '@app/common/errors';

import { User } from '../../domain/models/user.entity';
import {
  UserId,
  Username,
  DisplayName,
  Bio,
  AvatarUrl,
  UserStatus,
  UserStatusEnum,
  AuthId,
} from '../../domain/models/value-objects';
import { UserRepository } from '../../domain/repositories/user.repository.interface';

/**
 * Drizzle User Repository
 *
 * Implementation of the UserRepository interface using Drizzle ORM.
 */
@Injectable()
export class DrizzleUserRepository
  extends AbstractDrizzleWriteRepository<
    User,
    UserId,
    typeof schema.user.profiles
  >
  implements UserRepository
{
  constructor(
    drizzle: DrizzleService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    super(drizzle, schema.user.profiles, schema.user.profiles.id);
    this.loggingService.setContext(DrizzleUserRepository.name);
  }

  /**
   * Find a user by username
   * @param username - The username
   * @returns The user or null if not found
   */
  async findByUsername(username: Username): Promise<User | null> {
    try {
      this.loggingService.debug(
        `Finding user by username: ${username.toString()}`,
        'findByUsername',
      );

      const result = await this.drizzle.db
        .select()
        .from(schema.user.profiles)
        .where(eq(schema.user.profiles.username, username.toString()))
        .limit(1);

      if (result.length === 0) {
        this.loggingService.debug(
          `User with username ${username.toString()} not found`,
          'findByUsername',
        );
        return null;
      }

      return this.mapToDomain(result[0]);
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding user by username: ${username.toString()}`,
        {
          source: DrizzleUserRepository.name,
          method: 'findByUsername',
          username: username.toString(),
        },
      );
      throw new RepositoryError(
        `Error finding user by username: ${username.toString()}`,
        { username: username.toString() },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Find a user by authentication ID
   * @param authId - The authentication ID
   * @returns The user or null if not found
   */
  async findByAuthId(authId: AuthId): Promise<User | null> {
    try {
      this.loggingService.debug(
        `Finding user by authId: ${authId.toString()}`,
        'findByAuthId',
      );

      const result = await this.drizzle.db
        .select()
        .from(schema.user.profiles)
        .where(eq(schema.user.profiles.authId, authId.toString()))
        .limit(1);

      if (result.length === 0) {
        this.loggingService.debug(
          `User with authId ${authId.toString()} not found`,
          'findByAuthId',
        );
        return null;
      }

      return this.mapToDomain(result[0]);
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error finding user by authId: ${authId.toString()}`,
        {
          source: DrizzleUserRepository.name,
          method: 'findByAuthId',
          authId: authId.toString(),
        },
      );
      throw new RepositoryError(
        `Error finding user by authId: ${authId.toString()}`,
        { authId: authId.toString() },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Check if a username exists
   * @param username - The username to check
   * @returns True if the username exists, false otherwise
   */
  async usernameExists(username: Username): Promise<boolean> {
    try {
      this.loggingService.debug(
        `Checking if username exists: ${username.toString()}`,
        'usernameExists',
      );

      const count = await this.drizzle.db
        .select({ count: this.drizzle.sql`count(*)` })
        .from(schema.user.profiles)
        .where(eq(schema.user.profiles.username, username.toString()));

      return Number(count[0]?.count || 0) > 0;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error checking if username exists: ${username.toString()}`,
        {
          source: DrizzleUserRepository.name,
          method: 'usernameExists',
          username: username.toString(),
        },
      );
      throw new RepositoryError(
        `Error checking if username exists: ${username.toString()}`,
        { username: username.toString() },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Update user status
   * @param id - The user ID
   * @param status - The new status
   * @returns The updated user
   */
  async updateStatus(id: UserId, status: string): Promise<User> {
    try {
      this.loggingService.debug(
        `Updating user status: ${id.toString()} to ${status}`,
        'updateStatus',
      );

      const result = await this.drizzle.db
        .update(schema.user.profiles)
        .set({
          status: status as any,
          updatedAt: new Date(),
        })
        .where(eq(schema.user.profiles.id, id.toString()))
        .returning();

      if (result.length === 0) {
        throw new RepositoryError(`User with ID ${id.toString()} not found`, {
          userId: id.toString(),
        });
      }

      return this.mapToDomain(result[0]);
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error updating user status: ${id.toString()} to ${status}`,
        {
          source: DrizzleUserRepository.name,
          method: 'updateStatus',
          userId: id.toString(),
          status,
        },
      );
      throw new RepositoryError(
        `Error updating user status: ${id.toString()} to ${status}`,
        { userId: id.toString(), status },
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Map a database record to a domain entity
   * @param record - The database record
   * @returns The domain entity
   */
  protected mapToDomain(record: any): User {
    return new User({
      id: new UserId(record.id),
      authId: new AuthId(record.authId),
      username: new Username(record.username),
      displayName: new DisplayName(record.displayName || record.username),
      bio: record.bio ? new Bio(record.bio) : undefined,
      avatarUrl: record.avatarUrl ? new AvatarUrl(record.avatarUrl) : undefined,
      status: new UserStatus(record.status),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  /**
   * Map a domain entity to a database record
   * @param entity - The domain entity
   * @returns The database record
   */
  protected mapToPersistence(entity: User): any {
    return {
      id: entity.getId().toString(),
      authId: entity.getAuthId().toString(),
      username: entity.getUsername().toString(),
      displayName: entity.getDisplayName().toString(),
      bio: entity.getBio().toString(),
      avatarUrl: entity.getAvatarUrl().toString(),
      status: entity.getStatus().getValue(),
      updatedAt: entity.getUpdatedAt(),
    };
  }

  /**
   * Get the ID value for database operations
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
}

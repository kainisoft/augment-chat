import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@app/database/drizzle/drizzle.service';
import { AbstractDrizzleWriteRepository } from '@app/database/repositories/drizzle/drizzle-base-write.repository';
import { eq } from 'drizzle-orm';
import * as schema from '@app/database/schemas';
import { UserId, Email } from '@app/domain';
import { User } from '../../domain/models/user.entity';
import { Password } from '../../domain/models/value-objects/password.value-object';
import { UserRepository } from '../../domain/repositories/user.repository.interface';

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
  constructor(drizzle: DrizzleService) {
    super(drizzle, schema.auth.users, schema.auth.users.id);
  }

  /**
   * Find a user by email
   * @param email - The user email
   * @returns The user or null if not found
   */
  async findByEmail(email: Email): Promise<User | null> {
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

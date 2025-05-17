import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@app/database/drizzle/drizzle.service';
import { AbstractDrizzleWriteRepository } from '@app/database/repositories/drizzle/drizzle-base-write.repository';
import { eq } from 'drizzle-orm';
import * as schema from '@app/database/schemas';
import { User } from '../../domain/models/user.entity';
import { Email } from '../../domain/models/value-objects/email.value-object';
import { Password } from '../../domain/models/value-objects/password.value-object';
import { UserId } from '../../domain/models/value-objects/user-id.value-object';
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

    // Handle boolean fields with defaults
    // If is_active is explicitly false, use false; otherwise default to true
    const isActive = data.is_active === false ? false : true;

    // If is_verified is explicitly true, use true; otherwise default to false
    const isVerified = data.is_verified === true ? true : false;

    // Handle failed login attempts and locked until
    const failedLoginAttempts = typeof data.failed_login_attempts === 'number'
      ? data.failed_login_attempts
      : 0;
    const lockedUntil = data.locked_until
      ? new Date(data.locked_until as string)
      : null;

    return new User({
      id: new UserId(data.id as string),
      email: new Email(data.email as string),
      password: new Password(data.password as string, true),
      isActive,
      isVerified,
      createdAt,
      updatedAt,
      lastLoginAt,
      failedLoginAttempts,
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
      is_active: entity.getIsActive(),
      is_verified: entity.getIsVerified(),
      updated_at: entity.getUpdatedAt(),
      failed_login_attempts: entity.getFailedLoginAttempts(),
      locked_until: entity.getLockedUntil(),
    };
  }
}

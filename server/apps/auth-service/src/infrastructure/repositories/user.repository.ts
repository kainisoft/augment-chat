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
  extends AbstractDrizzleWriteRepository<User, UserId, typeof schema.users>
  implements UserRepository
{
  constructor(drizzle: DrizzleService) {
    super(drizzle, schema.users, schema.users.id);
  }

  /**
   * Find a user by email
   * @param email - The user email
   * @returns The user or null if not found
   */
  async findByEmail(email: Email): Promise<User | null> {
    const result = await this.drizzle.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toString()))
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
        : new Date(data.createdAt as string);

    const updatedAt =
      data.updatedAt instanceof Date
        ? data.updatedAt
        : new Date(data.updatedAt as string);

    const lastLoginAt = data.lastLoginAt
      ? data.lastLoginAt instanceof Date
        ? data.lastLoginAt
        : new Date(data.lastLoginAt as string)
      : null;

    return new User({
      id: new UserId(data.id as string),
      email: new Email(data.email as string),
      password: new Password(data.passwordHash as string, true),
      isActive: Boolean(data.isActive),
      isVerified: Boolean(data.isVerified),
      createdAt,
      updatedAt,
      lastLoginAt,
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
      passwordHash: entity.getPassword().toString(),
      isActive: entity.getIsActive(),
      isVerified: entity.getIsVerified(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}

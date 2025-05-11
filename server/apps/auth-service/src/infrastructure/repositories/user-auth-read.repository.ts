import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@app/database/drizzle/drizzle.service';
import { AbstractDrizzleReadRepository } from '@app/database/repositories/drizzle/drizzle-base-read.repository';
import { eq } from 'drizzle-orm';
import * as schema from '@app/database/schemas';
import { UserAuthInfoReadModel } from '../../domain/read-models/user-auth-info.read-model';
import { UserAuthReadRepository } from '../../domain/repositories/user-auth-read.repository.interface';

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
  constructor(drizzle: DrizzleService) {
    super(
      drizzle,
      schema.auth.users,
      schema.auth.users.id,
      [schema.auth.users.email], // Search fields
    );
  }

  /**
   * Find a user by email
   * @param email - The user email
   * @returns The user auth info or null if not found
   */
  async findByEmail(email: string): Promise<UserAuthInfoReadModel | null> {
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

  /**
   * Convert an ID to its database value
   * @param id - The entity ID
   * @returns The database ID value
   */
  protected getIdValue(id: string): string {
    return id;
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

    return {
      id: data.id as string,
      email: data.email as string,
      isActive: Boolean(data.is_active),
      isVerified: Boolean(data.is_verified),
      lastLoginAt,
      createdAt,
      updatedAt,
    };
  }
}

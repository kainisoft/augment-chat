import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BaseRepository } from '../common/base.repository';
import { DATABASE_CONNECTION } from '../database/database.token';
import type { DrizzleDatabase } from '../database/database.types';
import * as schema from '../database/schema';

export type User = typeof schema.users.$inferSelect;
type UserInsert = typeof schema.users.$inferInsert;

@Injectable()
export class UsersRepository extends BaseRepository<
  typeof schema.users,
  User,
  UserInsert,
  Partial<User>
> {
  constructor(@Inject(DATABASE_CONNECTION) db: DrizzleDatabase) {
    super(db, schema.users);
  }

  // Custom method specific to users
  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return user;
  }

  // Custom method specific to users
  async updateStatus(
    userId: string,
    status: 'online' | 'offline' | 'away',
  ): Promise<User> {
    const [user] = await this.db
      .update(schema.users)
      .set({
        status,
        lastSeen: status === 'offline' ? new Date() : undefined,
      })
      .where(eq(schema.users.id, userId))
      .returning();

    return user;
  }
}

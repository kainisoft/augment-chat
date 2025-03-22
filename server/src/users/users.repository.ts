import { Injectable, Inject } from '@nestjs/common';
import { eq, InferModel } from 'drizzle-orm';
import type { DrizzleDatabase } from '../database/database.types';
import * as schema from '../database/schema';
import { DATABASE_CONNECTION } from 'src/database/database.token';

export type User = typeof schema.users.$inferSelect;

@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE_CONNECTION) private db: DrizzleDatabase) {}

  async findById(id: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    return user;
  }

  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return user;
  }

  async create(data: {
    email: string;
    username: string;
    password: string;
    avatarUrl?: string;
  }) {
    const [user] = await this.db.insert(schema.users).values(data).returning();

    return user;
  }

  async updateStatus(userId: string, status: 'online' | 'offline' | 'away') {
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

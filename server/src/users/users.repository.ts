import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BaseRepository } from '../common/base.repository';
import { DATABASE_CONNECTION } from '../database/database.token';
import type { DrizzleDatabase } from '../database/database.types';
import { userTable } from '../database/schema';

export type UserSelect = typeof userTable.$inferSelect;
export type UserInsert = typeof userTable.$inferInsert;

@Injectable()
export class UsersRepository extends BaseRepository<typeof userTable, UserSelect, UserInsert> {
  constructor(@Inject(DATABASE_CONNECTION) db: DrizzleDatabase) {
    super(db, userTable);
  }

  async create(data: {
    email: string;
    username: string;
    password: string;
    avatarUrl?: string;
  }): Promise<UserSelect> {
    const [user] = await this.db.insert(userTable).values(data).returning();

    return user;
  }

  async findByEmail(email: string): Promise<UserSelect | null> {
    const [user] = await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);

    return user;
  }

  async updateStatus(userId: string, status: 'online' | 'offline' | 'away') {
    const [user] = await this.db
      .update(userTable)
      .set({
        status,
        lastSeen: status === 'offline' ? new Date() : undefined,
      })
      .where(eq(userTable.id, userId))
      .returning();

    return user;
  }

  async getUsersWithChats(userId: string) {
    return await this.db.query.userTable.findFirst({
      where: eq(userTable.id, userId),
      with: {
        chatMembers: {
          with: {
            chat: {
              with: {
                messages: {
                  limit: 1,
                  orderBy: (messages) => messages.createdAt,
                },
                members: {
                  with: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}

import { BaseRepository } from '@/common/base.repository';
import { DATABASE_CONNECTION } from '@/database/database.token';
import { DrizzleDatabase } from '@/database/database.types';
import { chatMemberTable, chatTable, messageTable } from '@/database/schema';
import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';

export type ChatSelect = typeof chatTable.$inferSelect;
export type ChatInsert = typeof chatTable.$inferInsert;

@Injectable()
export class ChatsRepository extends BaseRepository<typeof chatTable, ChatSelect, ChatInsert> {
  constructor(@Inject(DATABASE_CONNECTION) db: DrizzleDatabase) {
    super(db, chatTable);
  }

  async getUserChats(userId: string) {
    return await this.db.query.chatTable.findMany({
      where: eq(chatMemberTable.userId, userId),
      with: {
        members: {
          with: {
            user: true,
          },
        },
        messages: {
          limit: 1,
          orderBy: desc(messageTable.createdAt),
          with: {
            user: true,
          },
        },
      },
      orderBy: desc(chatTable.lastMessageAt),
    });
  }

  async createChat(data: {
    name?: string;
    isGroup: boolean;
    createdBy: string;
    memberIds: string[];
  }) {
    await this.db.transaction(async (tx) => {
      const [newChat] = await tx
        .insert(chatTable)
        .values({
          name: data.name,
          isGroup: data.isGroup,
          createdBy: data.createdBy,
        })
        .returning();

      await tx.insert(chatMemberTable).values(
        data.memberIds.map((userId) => ({
          chatId: newChat.id,
          userId,
          role: userId === data.createdBy ? 'admin' : 'member',
        })),
      );

      return newChat;
    });

    return this.getUserChats(data.createdBy);
  }

  async getChatMessages(chatId: string, limit = 50, before?: Date) {
    const messages = await this.db
      .select()
      .from(messageTable)
      .where(
        and(
          eq(messageTable.chatId, chatId),
          before ? sql`${messageTable.createdAt} < ${before}` : undefined,
        ),
      )
      .limit(limit)
      .orderBy(desc(messageTable.createdAt));

    return messages;
  }

  async addMessage(data: {
    chatId: string;
    userId: string;
    content: string;
    type?: 'text' | 'image' | 'file';
    metadata?: Record<string, unknown>;
  }) {
    const [message] = await this.db.transaction(async (tx) => {
      const [newMessage] = await tx
        .insert(messageTable)
        .values({
          ...data,
          readBy: [data.userId],
        })
        .returning();

      await tx
        .update(chatTable)
        .set({ lastMessageAt: new Date() })
        .where(eq(chatTable.id, data.chatId));

      return this.db.query.messageTable.findMany({
        where: eq(messageTable.id, newMessage.id),
        with: {
          user: true,
        },
      });
    });

    return message;
  }

  async markMessagesAsRead(chatId: string, userId: string) {
    await this.db.transaction(async (tx) => {
      await tx
        .update(messageTable)
        .set({
          readBy: sql`array_append(${messageTable.readBy}, ${userId})`,
        })
        .where(
          and(eq(messageTable.chatId, chatId), sql`NOT (${userId} = ANY(${messageTable.readBy}))`),
        );

      await tx
        .update(chatMemberTable)
        .set({ lastRead: new Date() })
        .where(and(eq(chatMemberTable.chatId, chatId), eq(chatMemberTable.userId, userId)));
    });
  }

  async getChatMembers(chatId: string) {
    return await this.db.query.chatMemberTable.findMany({
      where: eq(chatMemberTable.chatId, chatId),
      with: {
        user: true,
      },
    });
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { chatMemberTable, chatTable, messageTable } from '@/database/schema';
import { BaseRepository } from '@/common/base.repository';
import { DrizzleDatabase } from '@/database/database.types';
import { DATABASE_CONNECTION } from '@/database/database.token';

export type ChatSelect = typeof chatTable.$inferSelect;
export type ChatInsert = typeof chatTable.$inferInsert;

@Injectable()
export class ChatsRepository extends BaseRepository<
  typeof chatTable,
  ChatSelect,
  ChatInsert
> {
  constructor(@Inject(DATABASE_CONNECTION) db: DrizzleDatabase) {
    super(db, chatTable);
  }

  async createChat(data: {
    name?: string;
    isGroup: boolean;
    createdBy: string;
    memberIds: string[];
  }) {
    const chat = await this.db.transaction(async (tx) => {
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

    return chat;
  }

  async getChatMessages(chatId: string, limit = 50, before?: Date) {
    const messages = await this.db
      .select()
      .from(messageTable)
      .where(
        and(
          eq(messageTable.chatId, chatId),
          before ? desc(messageTable.createdAt) : undefined,
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
        .values(data)
        .returning();

      await tx
        .update(chatTable)
        .set({ lastMessageAt: new Date() })
        .where(eq(chatTable.id, data.chatId));

      return [newMessage];
    });

    return message;
  }

  async markMessagesAsRead(chatId: string, userId: string) {
    await this.db.transaction(async (tx) => {
      await tx
        .update(chatMemberTable)
        .set({ lastRead: new Date() })
        .where(
          and(
            eq(chatMemberTable.chatId, chatId),
            eq(chatMemberTable.userId, userId),
          ),
        );
    });
  }
}

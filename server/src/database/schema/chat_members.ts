import { relations } from 'drizzle-orm';
import { primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { chatTable } from './chats';
import { schema } from './root';
import { userTable } from './users';

export const chatMemberTable = schema.table(
  'chat_member',
  {
    chatId: uuid('chat_id').references(() => chatTable.id),
    userId: uuid('user_id').references(() => userTable.id),
    role: text('role').default('member'),
    joinedAt: timestamp('joined_at').defaultNow(),
    lastRead: timestamp('last_read'),
  },
  (table) => [primaryKey({ columns: [table.chatId, table.userId] })],
);

export const chatMembersRelations = relations(chatMemberTable, ({ one }) => ({
  chat: one(chatTable, {
    fields: [chatMemberTable.chatId],
    references: [chatTable.id],
  }),
  user: one(userTable, {
    fields: [chatMemberTable.userId],
    references: [userTable.id],
  }),
}));

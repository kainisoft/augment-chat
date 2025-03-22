import { relations } from 'drizzle-orm';
import { primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { chats } from './chats';
import { schema } from './root';
import { users } from './users';

export const chatMembers = schema.table(
  'chat_members',
  {
    chatId: uuid('chat_id').references(() => chats.id),
    userId: uuid('user_id').references(() => users.id),
    role: text('role').default('member'),
    joinedAt: timestamp('joined_at').defaultNow(),
    lastRead: timestamp('last_read'),
  },
  (table) => [primaryKey({ columns: [table.chatId, table.userId] })],
);

export const chatMembersRelations = relations(chatMembers, ({ one }) => ({
  chat: one(chats, {
    fields: [chatMembers.chatId],
    references: [chats.id],
  }),
  user: one(users, {
    fields: [chatMembers.userId],
    references: [users.id],
  }),
}));

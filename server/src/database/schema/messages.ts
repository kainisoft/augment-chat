import { relations } from 'drizzle-orm';
import { jsonb, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { chats } from './chats';
import { schema } from './root';
import { users } from './users';

export const messageTypeEnum = schema.enum('message_type', [
  'text',
  'image',
  'file',
]);

export const messages = schema.table('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chat_id').references(() => chats.id),
  userId: uuid('user_id').references(() => users.id),
  type: messageTypeEnum('type').default('text'),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  readBy: uuid('read_by').array(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

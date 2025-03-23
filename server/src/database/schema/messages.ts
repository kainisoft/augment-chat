import { relations } from 'drizzle-orm';
import { jsonb, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { chatTable } from './chats';
import { schema } from './root';
import { userTable } from './users';

export const messageTypeEnum = schema.enum('message_type', [
  'text',
  'image',
  'file',
]);

export const messageTable = schema.table('message', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chat_id').references(() => chatTable.id),
  userId: uuid('user_id').references(() => userTable.id),
  type: messageTypeEnum('type').default('text'),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  readBy: uuid('read_by').array(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const messagesRelations = relations(messageTable, ({ one }) => ({
  chat: one(chatTable, {
    fields: [messageTable.chatId],
    references: [chatTable.id],
  }),
  user: one(userTable, {
    fields: [messageTable.userId],
    references: [userTable.id],
  }),
}));

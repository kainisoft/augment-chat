import { relations } from 'drizzle-orm';
import { boolean, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { chatMemberTable } from './chat_members';
import { messageTable } from './messages';
import { schema } from './root';
import { userTable } from './users';

export const chatTable = schema.table('chat', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  isGroup: boolean('is_group').default(false),
  lastMessageAt: timestamp('last_message_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: uuid('created_by').references(() => userTable.id),
});

export const chatsRelations = relations(chatTable, ({ one, many }) => ({
  createdByUser: one(userTable, {
    fields: [chatTable.createdBy],
    references: [userTable.id],
  }),
  messages: many(messageTable),
  members: many(chatMemberTable),
}));

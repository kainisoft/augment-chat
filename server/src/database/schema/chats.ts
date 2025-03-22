import { relations } from 'drizzle-orm';
import { boolean, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { chatMembers } from './chat_members';
import { messages } from './messages';
import { schema } from './root';
import { users } from './users';

export const chats = schema.table('chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  isGroup: boolean('is_group').default(false),
  lastMessageAt: timestamp('last_message_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
});

export const chatsRelations = relations(chats, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [chats.createdBy],
    references: [users.id],
  }),
  messages: many(messages),
  members: many(chatMembers),
}));

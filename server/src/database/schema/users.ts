import { relations } from 'drizzle-orm';
import { jsonb, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { chatMembers } from './chat_members';
import { messages } from './messages';
import { schema } from './root';

export const userStatusEnum = schema.enum('user_status', [
  'online',
  'offline',
  'away',
]);

export const users = schema.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  status: userStatusEnum('status').default('offline'),
  lastSeen: timestamp('last_seen').defaultNow(),
  avatarUrl: text('avatar_url'),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  chatMembers: many(chatMembers),
}));

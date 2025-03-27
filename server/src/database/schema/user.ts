import { relations } from 'drizzle-orm';
import { jsonb, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { chatMemberTable } from './chat_member';
import { messageTable } from './message';
import { schema } from './root';

export const userStatusEnum = schema.enum('user_status', ['online', 'offline', 'away']);

export const userTable = schema.table('user', {
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

export const usersRelations = relations(userTable, ({ many }) => ({
  messages: many(messageTable),
  chatMembers: many(chatMemberTable),
}));

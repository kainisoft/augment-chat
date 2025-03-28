import { relations, sql } from 'drizzle-orm';
import { index, jsonb, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { chatMemberTable } from './chat_member';
import { messageTable } from './message';
import { schema } from './root';

export const userStatusEnum = schema.enum('user_status', ['online', 'offline', 'away']);

export const userTable = schema.table(
  'user',
  {
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
  },
  (table) => [
    index('idx_user_username_search').using('gin', sql`${table.username} gin_trgm_ops`),
    index('idx_user_email_search').using('gin', sql`${table.email} gin_trgm_ops`),
  ],
);

export const usersRelations = relations(userTable, ({ many }) => ({
  messages: many(messageTable),
  chatMembers: many(chatMemberTable),
}));

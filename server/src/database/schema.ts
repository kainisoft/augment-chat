import {
  pgEnum,
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userStatusEnum = pgEnum('user_status', [
  'online',
  'offline',
  'away',
]);
export const messageTypeEnum = pgEnum('message_type', [
  'text',
  'image',
  'file',
]);

// Users table
export const users = pgTable('users', {
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

// Chats table
export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  isGroup: boolean('is_group').default(false),
  lastMessageAt: timestamp('last_message_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
});

// Messages table
export const messages = pgTable('messages', {
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

// Chat members table
export const chatMembers = pgTable(
  'chat_members',
  {
    chatId: uuid('chat_id').references(() => chats.id),
    userId: uuid('user_id').references(() => users.id),
    role: text('role').default('member'),
    joinedAt: timestamp('joined_at').defaultNow(),
    lastRead: timestamp('last_read'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.userId] }),
  }),
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  chatMembers: many(chatMembers),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [chats.createdBy],
    references: [users.id],
  }),
  messages: many(messages),
  members: many(chatMembers),
}));

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

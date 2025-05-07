import { uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { chatAppSchema } from './schema';

/**
 * Users Table
 *
 * Stores user authentication information.
 */
export const users = chatAppSchema.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
  isActive: boolean('is_active').notNull().default(true),
  isVerified: boolean('is_verified').notNull().default(false),
});

/**
 * Refresh Tokens Table
 *
 * Stores refresh tokens for JWT authentication.
 */
export const refreshTokens = chatAppSchema.table('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  revoked: boolean('revoked').notNull().default(false),
  revokedAt: timestamp('revoked_at'),
});

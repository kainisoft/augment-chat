import { uuid, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { chatAppSchema } from './schema';
import { users } from './auth.schema';

/**
 * User Status Enum
 */
export const userStatusEnum = chatAppSchema.enum('user_status', [
  'ONLINE',
  'OFFLINE',
  'AWAY',
  'DO_NOT_DISTURB',
]);

/**
 * Relationship Type Enum
 */
export const relationshipTypeEnum = chatAppSchema.enum('relationship_type', [
  'FRIEND',
  'BLOCKED',
]);

/**
 * Relationship Status Enum
 */
export const relationshipStatusEnum = chatAppSchema.enum(
  'relationship_status',
  ['PENDING', 'ACCEPTED', 'REJECTED'],
);

/**
 * Profiles Table
 *
 * Stores user profile information.
 */
export const profiles = chatAppSchema.table('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }),
  bio: text('bio'),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  status: userStatusEnum('status').notNull().default('OFFLINE'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Relationships Table
 *
 * Stores relationships between users (friends, blocked, etc.).
 */
export const relationships = chatAppSchema.table('relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  relatedUserId: uuid('related_user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  type: relationshipTypeEnum('type').notNull(),
  status: relationshipStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Settings Table
 *
 * Stores user settings.
 */
export const settings = chatAppSchema.table('settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  key: varchar('key', { length: 50 }).notNull(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

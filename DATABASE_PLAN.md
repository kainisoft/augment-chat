# Database Plan

## Overview
This document outlines the database architecture for the chat application, including schema design, relationships, and implementation details.

## Database Technologies

### PostgreSQL with Drizzle ORM
Used for structured data with relationships:
- User accounts and profiles
- Authentication data
- User relationships
- User settings and preferences

#### Single Schema Approach
We'll use a single PostgreSQL schema named `chat_app` for all tables in the database. This approach offers:
- **Simplicity**: Easier to understand and maintain
- **Query Simplicity**: No need to specify schema names in queries or handle cross-schema references
- **Unified Structure**: All tables organized under one namespace

#### Drizzle ORM Benefits
- **Type Safety**: Full TypeScript support with type inference for database schema
- **SQL-like Syntax**: Intuitive query API that closely resembles SQL
- **Relational Queries**: Powerful relational query builder for nested data fetching
- **Zero Dependencies**: Lightweight with no external dependencies (only ~31kb)
- **Performance**: Optimized for serverless environments with minimal overhead
- **Migrations**: Automatic SQL migration generation
- **NestJS Integration**: Seamless integration with NestJS through custom modules

### MongoDB
Used for unstructured and high-volume data:
- Chat messages
- Conversations
- Notifications
- File attachment metadata

### Redis (Optional)
Used for caching and ephemeral data:
- Session management
- Real-time presence data
- Rate limiting
- Temporary data caching

## PostgreSQL Schema

### Users Table
- `id` UUID PRIMARY KEY
- `email` VARCHAR(255) UNIQUE NOT NULL
- `username` VARCHAR(50) UNIQUE NOT NULL
- `password_hash` VARCHAR(255) NOT NULL
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMP NOT NULL DEFAULT NOW()
- `last_login_at` TIMESTAMP
- `is_active` BOOLEAN NOT NULL DEFAULT TRUE
- `is_verified` BOOLEAN NOT NULL DEFAULT FALSE

### Profiles Table
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `display_name` VARCHAR(100)
- `bio` TEXT
- `avatar_url` VARCHAR(255)
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMP NOT NULL DEFAULT NOW()

### Relationships Table
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `related_user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `type` VARCHAR(20) NOT NULL (friend, blocked, etc.)
- `status` VARCHAR(20) NOT NULL (pending, accepted, rejected)
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMP NOT NULL DEFAULT NOW()
- UNIQUE(user_id, related_user_id)

### Settings Table
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `key` VARCHAR(50) NOT NULL
- `value` JSONB NOT NULL
- `updated_at` TIMESTAMP NOT NULL DEFAULT NOW()
- UNIQUE(user_id, key)

### RefreshTokens Table
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `token` VARCHAR(255) NOT NULL
- `expires_at` TIMESTAMP NOT NULL
- `created_at` TIMESTAMP NOT NULL DEFAULT NOW()
- `revoked` BOOLEAN NOT NULL DEFAULT FALSE
- `revoked_at` TIMESTAMP

## MongoDB Collections

### Messages Collection
```javascript
{
  _id: ObjectId,
  conversation_id: ObjectId,
  sender_id: String, // UUID from PostgreSQL
  content: String,
  attachments: [
    {
      id: ObjectId,
      type: String,
      url: String,
      name: String,
      size: Number
    }
  ],
  created_at: Date,
  updated_at: Date,
  delivered_to: [
    {
      user_id: String, // UUID from PostgreSQL
      timestamp: Date
    }
  ],
  read_by: [
    {
      user_id: String, // UUID from PostgreSQL
      timestamp: Date
    }
  ]
}
```

### Conversations Collection
```javascript
{
  _id: ObjectId,
  type: String, // "private" or "group"
  participants: [String], // UUIDs from PostgreSQL
  name: String, // for group chats
  created_by: String, // UUID from PostgreSQL
  created_at: Date,
  updated_at: Date,
  last_message_at: Date,
  last_message_preview: String,
  is_active: Boolean
}
```

### Notifications Collection
```javascript
{
  _id: ObjectId,
  user_id: String, // UUID from PostgreSQL
  type: String,
  content: Object,
  related_to: {
    type: String, // "message", "friend_request", etc.
    id: String // ID of the related entity
  },
  is_read: Boolean,
  created_at: Date,
  expires_at: Date
}
```

### NotificationPreferences Collection
```javascript
{
  _id: ObjectId,
  user_id: String, // UUID from PostgreSQL
  channels: {
    in_app: Boolean,
    email: Boolean,
    push: Boolean
  },
  types: {
    message: Boolean,
    friend_request: Boolean,
    system: Boolean
    // other notification types
  },
  updated_at: Date
}
```

## Implementation Tasks

### PostgreSQL Setup with Drizzle ORM
- [ ] Create database initialization scripts
- [ ] Set up Drizzle ORM schema definitions
- [ ] Configure Drizzle migrations system
- [ ] Implement type-safe queries with Drizzle
- [ ] Set up NestJS integration with Drizzle ORM
- [ ] Configure connection pooling
- [ ] Set up indexes for performance
- [ ] Implement data validation

### MongoDB Setup
- [ ] Create database initialization scripts
- [ ] Define schema validation rules
- [ ] Implement repository patterns in NestJS
- [ ] Configure connection settings
- [ ] Set up indexes for performance
- [ ] Implement data validation

### Redis Setup (Optional)
- [ ] Configure Redis instance
- [ ] Set up key expiration policies
- [ ] Implement caching strategies
- [ ] Configure persistence options

## Drizzle ORM Implementation

### Schema Definition
Drizzle ORM allows defining database schema in TypeScript, using a single PostgreSQL schema for all tables:

```typescript
// Example schema definition for Users table with a single PostgreSQL schema
import { pgTable, pgSchema, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

// Define a single PostgreSQL schema for all tables
const chatAppSchema = pgSchema('chat_app');

// Tables in the 'chat_app' schema
export const users = chatAppSchema.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
  isActive: boolean('is_active').notNull().default(true),
  isVerified: boolean('is_verified').notNull().default(false),
});

export const profiles = chatAppSchema.table('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  displayName: varchar('display_name', { length: 100 }),
  bio: varchar('bio', { length: 500 }),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### NestJS Integration
Integration with NestJS will be done using a custom module:

```typescript
// Example NestJS module for Drizzle ORM
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL');
        const client = postgres(connectionString);
        return drizzle(client, { schema });
      },
    },
  ],
  exports: ['DATABASE_CONNECTION'],
})
export class DrizzleModule {}
```

### Query Examples
Drizzle provides both SQL-like and relational query APIs:

```typescript
// SQL-like query example
const users = await db
  .select()
  .from(schema.users)
  .where(eq(schema.users.email, 'user@example.com'));

// Relational query example
const usersWithProfiles = await db.query.users.findMany({
  with: {
    profile: true,
    relationships: {
      where: eq(schema.relationships.status, 'accepted'),
    },
  },
});
```

## Database Security
- [ ] Implement row-level security in PostgreSQL
- [ ] Set up database users with least privilege
- [ ] Configure network security for database access
- [ ] Implement data encryption for sensitive fields
- [ ] Set up regular backup procedures

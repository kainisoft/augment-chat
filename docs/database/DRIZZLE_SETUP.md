# Drizzle ORM Setup Guide

This document provides detailed instructions for setting up and using Drizzle ORM with PostgreSQL in our NestJS microservices architecture.

## Installation

### 1. Install Required Packages

```bash
# Install Drizzle ORM core packages
pnpm add drizzle-orm postgres

# Install Drizzle Kit for migrations (dev dependency)
pnpm add -D drizzle-kit

# Install NestJS integration package
pnpm add @knaadh/nestjs-drizzle-postgres
```

### 2. Configure drizzle.config.ts

Create a `drizzle.config.ts` file in the root of the server directory:

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './libs/database/src/schemas/*.ts',
  out: './libs/database/src/migrations',
  driver: 'pg',
  dbCredentials: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'postgres',
  },
} satisfies Config;
```

## Schema Definition

### 1. Create Schema Files

Create schema files in the `server/libs/database/src/schemas` directory, using a single custom PostgreSQL schema:

```typescript
// server/libs/database/src/schemas/schema.ts
import { pgSchema } from 'drizzle-orm/pg-core';

// Define a single PostgreSQL schema for all tables
export const chatAppSchema = pgSchema('chat_app');
```

```typescript
// server/libs/database/src/schemas/auth.schema.ts
import { uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { chatAppSchema } from './schema';

export const users = chatAppSchema.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
  isActive: boolean('is_active').notNull().default(true),
  isVerified: boolean('is_verified').notNull().default(false),
});

export const refreshTokens = chatAppSchema.table('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  revoked: boolean('revoked').notNull().default(false),
  revokedAt: timestamp('revoked_at'),
});
```

```typescript
// server/libs/database/src/schemas/user.schema.ts
import { uuid, varchar, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { chatAppSchema } from './schema';
import { users } from './auth.schema';

export const profiles = chatAppSchema.table('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }),
  bio: text('bio'),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const relationships = chatAppSchema.table('relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  relatedUserId: uuid('related_user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).notNull(), // friend, blocked, etc.
  status: varchar('status', { length: 20 }).notNull(), // pending, accepted, rejected
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    userRelationUnique: unique().on(table.userId, table.relatedUserId),
  };
});

export const settings = chatAppSchema.table('settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  key: varchar('key', { length: 50 }).notNull(),
  value: text('value').notNull().$type<string>(), // JSON stored as text
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    userKeyUnique: unique().on(table.userId, table.key),
  };
});
```

### 2. Create Index File

Create an index file to export all schemas:

```typescript
// server/libs/database/src/schemas/index.ts
export * from './auth.schema';
export * from './user.schema';
// Add other schema exports as needed
```

## NestJS Integration

### 1. Create Drizzle Module

Create a Drizzle module in the database library:

```typescript
// server/libs/database/src/drizzle/drizzle.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';
import * as schema from '../schemas';

@Module({
  imports: [
    DrizzlePostgresModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          tag: 'DRIZZLE_DB',
          postgres: {
            host: configService.get('POSTGRES_HOST', 'localhost'),
            port: configService.get('POSTGRES_PORT', 5432),
            user: configService.get('POSTGRES_USER', 'postgres'),
            password: configService.get('POSTGRES_PASSWORD', 'postgres'),
            database: configService.get('POSTGRES_DB', 'postgres'),
          },
          config: { schema },
        };
      },
    }),
  ],
  exports: [DrizzlePostgresModule],
})
export class DrizzleModule {}
```

### 2. Create Repository Services

Create repository services for each entity:

```typescript
// server/libs/database/src/repositories/user.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../schemas';

@Injectable()
export class UserRepository {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
      with: {
        profile: true,
      },
    });
  }

  async findById(id: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
      with: {
        profile: true,
      },
    });
  }

  // Add other repository methods as needed
}
```

### 3. Export Repository Services

Create an index file to export all repositories:

```typescript
// server/libs/database/src/repositories/index.ts
export * from './user.repository';
// Add other repository exports as needed
```

## Migrations

### 1. Add Migration Scripts

Add migration scripts to the `package.json` file:

```json
{
  "scripts": {
    "drizzle:generate": "drizzle-kit generate:pg",
    "drizzle:push": "drizzle-kit push:pg",
    "drizzle:studio": "drizzle-kit studio"
  }
}
```

### 2. Generate Migrations

Run the following command to generate migrations:

```bash
pnpm drizzle:generate
```

### 3. Create PostgreSQL Schema

Before running migrations, you need to create the PostgreSQL schema. Create a script to set up the schema:

```typescript
// server/libs/database/src/migrations/create-schema.ts
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const createSchema = async () => {
  const connectionString = process.env.DATABASE_URL ||
    `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

  const sql = postgres(connectionString, { max: 1 });

  console.log('Creating PostgreSQL schema...');

  // Create schema if it doesn't exist
  await sql`CREATE SCHEMA IF NOT EXISTS chat_app;`;

  console.log('PostgreSQL schema created successfully');

  await sql.end();
  process.exit(0);
};

createSchema().catch((err) => {
  console.error('Schema creation failed', err);
  process.exit(1);
});
```

Add a script to create the schema:

```json
{
  "scripts": {
    "db:create-schema": "ts-node -r tsconfig-paths/register ./libs/database/src/migrations/create-schema.ts"
  }
}
```

### 4. Apply Migrations

Create a migration script:

```typescript
// server/libs/database/src/migrations/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
  const connectionString = process.env.DATABASE_URL ||
    `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log('Running migrations...');

  await migrate(db, { migrationsFolder: './libs/database/src/migrations' });

  console.log('Migrations completed successfully');

  await sql.end();
  process.exit(0);
};

runMigration().catch((err) => {
  console.error('Migration failed', err);
  process.exit(1);
});
```

Add a script to run migrations:

```json
{
  "scripts": {
    "db:migrate": "ts-node -r tsconfig-paths/register ./libs/database/src/migrations/migrate.ts"
  }
}
```

## Usage Examples

### 1. Basic Queries with Single PostgreSQL Schema

```typescript
// Find a user by email
const user = await db.query.users.findFirst({
  where: eq(schema.users.email, 'user@example.com'),
});

// Insert a new user in the 'chat_app' schema
const newUser = await db
  .insert(schema.users)
  .values({
    email: 'new@example.com',
    passwordHash: 'hashed_password',
  })
  .returning();

// Update a user in the 'chat_app' schema
await db
  .update(schema.users)
  .set({ isVerified: true })
  .where(eq(schema.users.id, userId));

// Delete a user in the 'chat_app' schema
await db
  .delete(schema.users)
  .where(eq(schema.users.id, userId));

// Insert a profile in the 'chat_app' schema
const newProfile = await db
  .insert(schema.profiles)
  .values({
    userId: newUser.id,
    username: 'username',
    displayName: 'Display Name',
  })
  .returning();
```

### 2. Relational Queries in Single PostgreSQL Schema

```typescript
// Get user with profile and relationships within the same PostgreSQL schema
const userWithRelations = await db.query.users.findFirst({
  where: eq(schema.users.id, userId),
  with: {
    // Join with profile table
    profile: true,
    // Join with relationships table
    relationships: {
      where: eq(schema.relationships.status, 'accepted'),
      with: {
        relatedUser: true,
      },
    },
  },
});

// Note: Relational queries are simpler with a single schema
// as all tables are in the same namespace
```

### 3. Transactions in Single PostgreSQL Schema

```typescript
// Execute queries within the same PostgreSQL schema in a transaction
await db.transaction(async (tx) => {
  // Insert into users table
  const [user] = await tx
    .insert(schema.users)
    .values({
      email: 'user@example.com',
      passwordHash: 'hashed_password',
    })
    .returning();

  // Insert into profiles table
  await tx
    .insert(schema.profiles)
    .values({
      userId: user.id,
      username: 'username',
    });

  // Insert into settings table
  await tx
    .insert(schema.settings)
    .values({
      userId: user.id,
      key: 'theme',
      value: JSON.stringify({ mode: 'dark' }),
    });
});

// Transactions are straightforward with a single schema
```

## Single PostgreSQL Schema Best Practices

When working with a single PostgreSQL schema in Drizzle ORM, consider the following best practices:

1. **Schema Naming**: Choose a clear, descriptive name for your PostgreSQL schema
2. **Table Naming**: Use consistent naming conventions for tables to avoid conflicts
3. **Schema Creation**: Always create the schema before running migrations
4. **Schema Permissions**: Set appropriate permissions for the schema
5. **Table Organization**: Use logical prefixes for table names to group related tables
6. **Schema Documentation**: Document the purpose and structure of your schema
7. **Schema Migration**: Include schema creation in your migration process
8. **Schema Versioning**: Consider versioning your schema for major changes
9. **Search Path**: Configure the PostgreSQL search path appropriately
10. **Performance Monitoring**: Monitor query performance within your schema

## General Best Practices

1. **Use Repository Pattern**: Encapsulate database access logic in repository classes
2. **Leverage Type Safety**: Take advantage of Drizzle's TypeScript support
3. **Use Transactions**: Wrap related operations in transactions for data consistency
4. **Generate Migrations**: Always generate migrations for schema changes
5. **Validate Input**: Validate input data before executing database operations
6. **Handle Errors**: Properly handle database errors and provide meaningful messages
7. **Use Relations**: Leverage Drizzle's relational query API for efficient data fetching
8. **Keep Schema Clean**: Organize schema files logically by domain
9. **Document Schema**: Add comments to schema definitions for better understanding
10. **Test Database Code**: Write unit tests for repository methods

## Troubleshooting

### Common Issues

1. **Connection Issues**: Ensure database credentials are correct
2. **Migration Failures**: Check for syntax errors in schema definitions
3. **Type Errors**: Ensure proper typing for database operations
4. **Performance Issues**: Use indexes and optimize queries
5. **Dependency Issues**: Ensure all required packages are installed

### Single PostgreSQL Schema-Specific Issues

1. **Schema Not Found**: Ensure the PostgreSQL schema exists before running migrations
2. **Permission Denied**: Check that the database user has appropriate permissions on the schema
3. **Table Naming Conflicts**: Avoid naming conflicts between tables within the schema
4. **Search Path Issues**: Be aware of PostgreSQL search path settings that might affect schema resolution
5. **Schema Qualification**: Ensure queries properly qualify table names with the schema name when needed

### Debugging

1. Enable debug logging in Drizzle:

```typescript
const db = drizzle(client, {
  schema,
  logger: true,
});
```

2. Use the Drizzle Studio to inspect your database:

```bash
pnpm drizzle:studio
```

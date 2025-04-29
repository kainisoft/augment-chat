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

### Phase 1: Database Architecture and Setup (Completed)
- [x] Design database schema structure
- [x] Choose ORM and database technologies
- [x] Plan MongoDB collections
- [x] Define Redis caching strategy (Optional)

### Phase 2: Domain-Driven Design Implementation (Completed)
- [x] Implement abstract base repository pattern
- [x] Create separate read/write repositories for CQRS
- [x] Design domain entity interfaces
- [x] Set up value objects for domain concepts

### Phase 3: PostgreSQL Setup with Drizzle ORM
- [x] Create database initialization scripts
- [x] Set up Drizzle ORM schema definitions
- [x] Configure Drizzle migrations system
- [x] Implement type-safe queries with Drizzle
- [x] Set up NestJS integration with Drizzle ORM
- [x] Configure connection pooling
- [ ] Set up indexes for performance
- [ ] Implement data validation

### Phase 4: MongoDB Setup
- [ ] Create database initialization scripts
- [ ] Define schema validation rules
- [ ] Implement repository patterns in NestJS
- [ ] Configure connection settings
- [ ] Set up indexes for performance
- [ ] Implement data validation

### Phase 5: Redis Setup (Optional)
- [ ] Configure Redis instance
- [ ] Set up key expiration policies
- [ ] Implement caching strategies
- [ ] Configure persistence options

## Domain-Driven Design Implementation

### Repository Pattern
We've implemented a comprehensive repository pattern following DDD principles with CQRS:

```
BaseRepository (Interface)
├── BaseWriteRepository (Interface)
│   └── AbstractBaseWriteRepository (Abstract Class)
│       └── AbstractDrizzleWriteRepository (Abstract Class)
│           └── ConcreteEntityRepository (Implementation)
│
└── BaseReadRepository (Interface)
    └── AbstractBaseReadRepository (Abstract Class)
        └── AbstractDrizzleReadRepository (Abstract Class)
            └── ConcreteEntityReadRepository (Implementation)
```

### Base Repository Interfaces

```typescript
// Base repository interface
export interface BaseRepository<T, TId> {
  findById(id: TId): Promise<T | null>;
  exists(id: TId): Promise<boolean>;
  count(filter?: any): Promise<number>;
}

// Write repository interface
export interface BaseWriteRepository<T, TId> extends BaseRepository<T, TId> {
  save(entity: T): Promise<void>;
  delete(id: TId): Promise<void>;
  create(entity: T): Promise<T>;
  update(id: TId, entity: Partial<T>): Promise<T>;
}

// Read repository interface
export interface BaseReadRepository<T, TId> extends BaseRepository<T, TId> {
  findAll(options?: QueryOptions): Promise<T[]>;
  findBy(field: string, value: any, options?: QueryOptions): Promise<T[]>;
  search(term: string, options?: QueryOptions): Promise<T[]>;
}
```

### Drizzle ORM Implementation

```typescript
// Example of a concrete repository implementation
@Injectable()
export class DrizzleUserRepository
  extends AbstractDrizzleWriteRepository<User, UserId, typeof schema.profiles>
  implements UserRepository {

  constructor(drizzle: DrizzleService) {
    super(drizzle, schema.profiles, schema.profiles.id);
  }

  // Domain-specific methods
  async findByEmail(email: Email): Promise<User | null> {
    const result = await this.drizzle.db
      .select()
      .from(schema.users)
      .innerJoin(schema.profiles, eq(schema.users.id, schema.profiles.userId))
      .where(eq(schema.users.email, email.toString()))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapToDomain({
      ...result[0].users,
      ...result[0].profiles,
    });
  }

  // Other methods...
}
```

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
Integration with NestJS is done using a custom module:

```typescript
// Drizzle service for NestJS
@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private _db: PostgresJsDatabase<typeof schema>;
  private _client: postgres.Sql<{}>;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const connectionString = this.getConnectionString();
    this._client = postgres(connectionString, {
      max: this.configService.get<number>('DATABASE_POOL_SIZE', 10),
    });
    this._db = drizzle(this._client, { schema });
  }

  async onModuleDestroy() {
    if (this._client) {
      await this._client.end();
    }
  }

  get db(): PostgresJsDatabase<typeof schema> {
    return this._db;
  }
}

// Drizzle module for NestJS
@Module({
  imports: [ConfigModule],
  providers: [DrizzleService],
  exports: [DrizzleService],
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

## Next Steps

### 1. Initialize and Configure the Database
- [ ] Set up PostgreSQL in Docker
- [ ] Run schema creation script
- [ ] Generate and run migrations
- [ ] Verify database structure

### 2. Implement Auth Service
- [ ] Create user registration functionality
- [ ] Implement JWT authentication
- [ ] Add refresh token mechanism
- [ ] Set up email verification

### 3. Implement User Service
- [ ] Create user profile management
- [ ] Add user search functionality
- [ ] Implement user relationships
- [ ] Add user settings

### 4. Implement Chat Service
- [ ] Set up MongoDB for messages
- [ ] Create conversation management
- [ ] Implement real-time messaging
- [ ] Add message delivery status

### 5. Implement Notification Service
- [ ] Create notification system
- [ ] Add notification preferences
- [ ] Implement real-time notifications

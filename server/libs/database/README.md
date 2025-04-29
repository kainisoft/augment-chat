# Database Library

This library provides a database abstraction layer for the chat application, implementing Domain-Driven Design (DDD) principles with CQRS pattern.

## Features

- **Drizzle ORM Integration**: Type-safe database access with Drizzle ORM
- **Repository Pattern**: Abstract base repositories for domain entities
- **CQRS Support**: Separate read and write repositories
- **PostgreSQL Schema**: Single schema approach for all tables
- **Migrations**: Automatic migration generation and execution

## Setup

### 1. Install Dependencies

```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

### 2. Create PostgreSQL Schema

```bash
pnpm run db:create-schema
```

This script creates the `chat_app` schema in PostgreSQL if it doesn't exist.

### 3. Generate Migrations

```bash
pnpm run db:generate
```

This command generates SQL migrations based on your schema definitions.

### 4. Run Migrations

```bash
pnpm run db:migrate
```

This applies the generated migrations to your database.

### 5. All-in-One Setup

```bash
pnpm run db:up
```

This creates the PostgreSQL schema and runs all migrations in one command.

### 6. Explore Database with Drizzle Studio

```bash
pnpm run db:studio
```

This starts Drizzle Studio, a web-based UI for exploring your database.

## Architecture

### Repository Pattern

The library implements the Repository pattern from Domain-Driven Design:

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

### Usage Example

#### Domain Layer

```typescript
// Define repository interface in domain layer
export interface UserRepository extends BaseWriteRepository<User, UserId> {
  findByEmail(email: Email): Promise<User | null>;
  findByUsername(username: Username): Promise<User | null>;
}
```

#### Application Layer

```typescript
// Define read repository interface in application layer
export interface UserReadRepository extends BaseReadRepository<UserDto, string> {
  findByEmail(email: string): Promise<UserDto | null>;
  countSearch(searchTerm: string): Promise<number>;
}
```

#### Infrastructure Layer

```typescript
// Implement repository in infrastructure layer
@Injectable()
export class DrizzleUserRepository
  extends AbstractDrizzleWriteRepository<User, UserId, typeof schema.profiles>
  implements UserRepository {

  constructor(drizzle: DrizzleService) {
    super(drizzle, schema.profiles, schema.profiles.id);
  }

  // Implement domain-specific methods
  async findByEmail(email: Email): Promise<User | null> {
    // Implementation...
  }

  // Other methods...
}
```

## Schema Structure

The database schema is defined in TypeScript using Drizzle ORM:

- `schema.ts`: Defines the PostgreSQL schema
- `auth.schema.ts`: Authentication-related tables
- `user.schema.ts`: User-related tables

## Configuration

The database connection is configured using environment variables:

- `DATABASE_URL`: Full connection string (optional)
- `POSTGRES_HOST`: Database host (default: localhost)
- `POSTGRES_PORT`: Database port (default: 5432)
- `POSTGRES_USER`: Database user (default: postgres)
- `POSTGRES_PASSWORD`: Database password (default: postgres)
- `POSTGRES_DB`: Database name (default: postgres)
- `DATABASE_POOL_SIZE`: Connection pool size (default: 10)
- `DATABASE_IDLE_TIMEOUT`: Connection idle timeout in seconds (default: 30)

## Additional Commands

### Push Schema Changes Directly

```bash
pnpm run db:push
```

This pushes schema changes directly to the database without generating migrations (useful for development).

### Check Schema Drift

```bash
pnpm run db:check
```

This checks for differences between your schema definitions and the database.

### Drop All Tables

```bash
pnpm run db:drop
```

This drops all tables defined in your schema (use with caution).

## Troubleshooting

### Schema Not Found

If you encounter a "schema not found" error, run:

```bash
pnpm run db:create-schema
```

### Migration Errors

If migrations fail, check:

1. Database connection parameters
2. PostgreSQL user permissions
3. Schema existence

### Connection Issues

If you can't connect to the database:

1. Verify the database is running
2. Check connection parameters
3. Ensure network connectivity
4. Verify firewall settings

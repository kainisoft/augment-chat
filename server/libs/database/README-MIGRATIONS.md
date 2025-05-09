# Database Migrations with Drizzle

This document describes how to manage database migrations for the chat application's microservices using Drizzle ORM.

## Overview

Each microservice has its own dedicated database with its own schema:

1. **Auth Service**: Uses `auth_db` with the `auth` schema
2. **User Service**: Uses `user_db` with the `users` schema

We use Drizzle's built-in migration functionality to manage database schemas and migrations, with the `pg` package for PostgreSQL connections.

## Migration Workflow

### 1. Create Database Schema

Before running migrations, you need to create the PostgreSQL schema for each service:

```bash
# Create Auth schema
pnpm db:create-schema:auth

# Create User schema
pnpm db:create-schema:user

# Create all schemas
pnpm db:create-schemas
```

### 2. Generate Migrations

After making changes to your schema definitions, generate migrations:

```bash
# Generate migrations for Auth database
pnpm db:generate:auth

# Generate migrations for User database
pnpm db:generate:user

# Generate migrations for all databases
pnpm db:generate
```

This will create SQL migration files in the `libs/database/migrations/[service]` directory.

### 3. Apply Migrations

Apply the generated migrations to update your database schema:

```bash
# Apply migrations for Auth database
pnpm db:migrate:auth

# Apply migrations for User database
pnpm db:migrate:user

# Apply migrations for all databases
pnpm db:migrate
```

The migration script will:
- Create the schema if it doesn't exist
- Check if tables already exist
- Create the `drizzle_migrations` table for tracking migrations
- Apply migrations if needed

### 4. Push Schema Changes (Alternative to Migrations)

For development, you can push schema changes directly without generating migration files:

```bash
# Push schema changes for Auth database
pnpm db:push:auth

# Push schema changes for User database
pnpm db:push:user

# Push schema changes for all databases
pnpm db:push
```

### 5. Complete Setup

To create schemas and apply migrations in one step:

```bash
pnpm db:up
```

## How It Works

### Environment Variables

We use the `SERVICE` environment variable to determine which database to target:

```bash
SERVICE=auth drizzle-kit generate
```

This approach allows us to use the same scripts for different services.

### Configuration

The `drizzle.config.ts` file reads the `SERVICE` environment variable and applies the appropriate configuration:

```typescript
// Determine which service to target based on environment variable
const SERVICE = process.env.SERVICE || 'auth';

// Configuration map for different services
const serviceConfigs = {
  auth: {
    schema: './libs/database/src/schemas/auth/*.ts',
    out: './libs/database/migrations/auth',
    dbName: process.env.AUTH_DB || 'auth_db',
    schemaFilter: ['auth'],
  },
  user: {
    schema: './libs/database/src/schemas/user/*.ts',
    out: './libs/database/migrations/user',
    dbName: process.env.USER_DB || 'user_db',
    schemaFilter: ['users'],
  },
};
```

### Database Connection

We use the `pg` package with `Pool` for database connections, which provides:

1. **Connection Pooling**: Efficient reuse of database connections
2. **Consistent API**: Same API used throughout the codebase
3. **Parameterized Queries**: Better protection against SQL injection

Example:

```typescript
// Create connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: currentConfig.dbName,
  max: process.env.DATABASE_POOL_SIZE ? parseInt(process.env.DATABASE_POOL_SIZE) : 10,
  idleTimeoutMillis: process.env.DATABASE_IDLE_TIMEOUT ? parseInt(process.env.DATABASE_IDLE_TIMEOUT) * 1000 : 30000,
});

// Initialize Drizzle with the pool
const db = drizzle(pool);
```

### Migration Scripts

Our migration scripts use Drizzle's built-in functionality with the `pg` package:

1. `create-schema.ts`: Creates the PostgreSQL schema for the specified service
2. `migrate.ts`: Applies migrations for the specified service

## Available Commands

| Command | Description |
|---------|-------------|
| `db:create-schema:auth` | Create Auth schema |
| `db:create-schema:user` | Create User schema |
| `db:create-schemas` | Create all schemas |
| `db:generate:auth` | Generate migrations for Auth database |
| `db:generate:user` | Generate migrations for User database |
| `db:generate` | Generate migrations for all databases |
| `db:migrate:auth` | Apply migrations for Auth database |
| `db:migrate:user` | Apply migrations for User database |
| `db:migrate` | Apply migrations for all databases |
| `db:push:auth` | Push schema changes for Auth database |
| `db:push:user` | Push schema changes for User database |
| `db:push` | Push schema changes for all databases |
| `db:drop:auth` | Drop Auth database |
| `db:drop:user` | Drop User database |
| `db:drop` | Drop all databases |
| `db:check:auth` | Check Auth database schema |
| `db:check:user` | Check User database schema |
| `db:check` | Check all database schemas |
| `db:up` | Create schemas and apply migrations |
| `db:studio` | Open Drizzle Studio for Auth database |
| `db:studio:auth` | Open Drizzle Studio for Auth database |
| `db:studio:user` | Open Drizzle Studio for User database |

## Best Practices

1. **Always Generate Migrations**: For production, always generate and apply migrations rather than using `db:push`
2. **Version Control**: Commit migration files to version control
3. **Test Migrations**: Test migrations in a development environment before applying them to production
4. **Backup**: Always backup your database before applying migrations
5. **Review SQL**: Review the generated SQL before applying migrations
6. **Use Connection Pooling**: The `pg` package with `Pool` provides efficient connection management
7. **Handle Existing Tables**: Our migration script handles cases where tables already exist

## Troubleshooting

### Common Issues

1. **Schema Not Found**: Ensure you've created the schema before running migrations
2. **Migration Conflicts**: If you have conflicts, you may need to drop and recreate the database
3. **Connection Issues**: Check your database connection string
4. **Permission Denied**: Ensure your database user has the necessary permissions
5. **Tables Already Exist**: Our migration script handles this case by creating the `drizzle_migrations` table

### Debugging

To see what SQL is being generated, use the `--dry-run` flag:

```bash
SERVICE=auth drizzle-kit generate --dry-run
```

To see more detailed logs, use the `--verbose` flag:

```bash
SERVICE=auth drizzle-kit generate --verbose
```

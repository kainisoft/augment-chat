# Microservices Database Architecture

This document describes the database architecture for the chat application's microservices.

## Overview

Each microservice has its own dedicated database with its own schema:

1. **Auth Service**: Uses `auth_db` with the `auth` schema
2. **User Service**: Uses `user_db` with the `users` schema
3. **Chat Service**: Uses `chat_db` (MongoDB)
4. **Notification Service**: Uses `notification_db` (MongoDB)

This architecture follows microservices best practices by ensuring each service owns its data and can evolve independently.

## PostgreSQL Databases

### Auth Database (`auth_db`)

- **Schema**: `auth`
- **Tables**:
  - `auth.users`: User authentication information
  - `auth.refresh_tokens`: JWT refresh tokens

### User Database (`user_db`)

- **Schema**: `users`
- **Tables**:
  - `users.profiles`: User profile information
  - `users.relationships`: User relationships (friends, blocked, etc.)
  - `users.settings`: User settings

## MongoDB Databases

### Chat Database (`chat_db`)

- **Collections**:
  - `messages`: Chat messages
  - `conversations`: Chat conversations

### Notification Database (`notification_db`)

- **Collections**:
  - `notifications`: User notifications
  - `notification_preferences`: User notification preferences

## Drizzle ORM Integration

Drizzle ORM is configured to work with multiple databases:

1. **Schema Definition**: Each microservice has its own schema definition in the `schemas` directory
2. **Database Connection**: Each microservice connects to its own database
3. **Migrations**: Separate migrations for each database

## Cross-Service Data Access

Since each microservice has its own database, direct SQL joins across services are not possible. Instead, we use:

1. **Event-Driven Architecture**: Services publish events when data changes
2. **API Composition**: Aggregate data from multiple services at the API level
3. **CQRS Pattern**: Maintain read models with denormalized data

## Setup and Migration

### Creating Database Schemas

```bash
# Create Auth schema
pnpm db:create-auth-schema

# Create User schema
pnpm db:create-user-schema

# Create all schemas
pnpm db:create-schemas
```

### Generating Migrations

```bash
# Generate migrations for Auth database
pnpm db:generate-auth

# Generate migrations for User database
pnpm db:generate-user

# Generate migrations for all databases
pnpm db:generate
```

### Running Migrations

```bash
# Run migrations for Auth database
pnpm db:migrate-auth

# Run migrations for User database
pnpm db:migrate-user

# Run migrations for all databases
pnpm db:migrate
```

### Complete Setup

```bash
# Create schemas and run migrations
pnpm db:up
```

## Usage in Microservices

### Auth Service

```typescript
// In auth-service.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule, DatabaseType } from '@app/database';

@Module({
  imports: [
    DatabaseModule.forAuth(),
    // ...
  ],
})
export class AuthServiceModule {}
```

### User Service

```typescript
// In user-service.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule, DatabaseType } from '@app/database';

@Module({
  imports: [
    DatabaseModule.forUser(),
    // ...
  ],
})
export class UserServiceModule {}
```

## Best Practices

1. **Service Independence**: Each service should only access its own database
2. **Event-Driven Communication**: Use Kafka events for cross-service data synchronization
3. **Data Duplication**: It's acceptable to duplicate some data across services for performance
4. **Schema Evolution**: Each service can evolve its schema independently
5. **Transactions**: Transactions should be limited to a single database

## Troubleshooting

### Common Issues

1. **Cross-Database Joins**: Not supported - use API composition or event-driven architecture
2. **Schema Conflicts**: Each service has its own schema, so conflicts are unlikely
3. **Connection Issues**: Check the database connection string for each service
4. **Migration Failures**: Run migrations for each database separately to identify issues

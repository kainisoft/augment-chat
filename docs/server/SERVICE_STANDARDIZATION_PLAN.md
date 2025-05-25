# Microservice Standardization Plan

## Overview

This document outlines the plan for standardizing the module structures of the user-service and auth-service in our NestJS microservices architecture. The goal is to create a consistent, maintainable, and scalable architecture that follows best practices for Domain-Driven Design (DDD) and Command Query Responsibility Segregation (CQRS) patterns.

## Current State Analysis

### User Service
- Modular approach with separate modules for GraphQL, CQRS, Kafka, Cache, and Database
- Clean separation of concerns in the CQRS module
- Dedicated Kafka modules for producing and consuming events
- Repository module for organizing repositories
- GraphQL implementation for API endpoints

### Auth Service
- More monolithic main module with direct imports of repositories and services
- CQRS module includes infrastructure concerns (Redis, JWT)
- Lacks dedicated Kafka modules for event communication
- Uses flat array of repository providers without a dedicated module
- REST API implementation for endpoints

## Standardization Goals

1. **Consistent Module Organization**: Standardize the structure of main service modules
2. **CQRS Implementation**: Create a consistent pattern for CQRS modules
3. **Kafka Implementation**: Standardize event communication between services
4. **Repository Pattern**: Align repository organization across services
5. **Domain Model Implementation**: Extract common domain models to shared libraries
6. **Folder Structure**: Create consistent folder organization
7. **Event Communication**: Standardize event publishing and handling
8. **Infrastructure Modules**: Create reusable infrastructure modules

## Standardization Approach

After analyzing both services, we've identified that the user-service generally follows better architectural patterns and organization principles. Therefore, our standardization approach will primarily focus on:

1. **Using user-service as the baseline**: The user-service structure will serve as the "gold standard" for most architectural patterns.
2. **Modifying auth-service**: Most changes will be applied to the auth-service to align with the patterns established in the user-service.
3. **Identifying user-service improvements**: While user-service has better organization overall, there are still areas where it can be improved.
4. **Extracting common code**: Both services will benefit from extracting duplicated code into shared libraries.

This approach allows us to leverage the existing well-structured code in the user-service while still addressing any inconsistencies or improvements needed in both services.

## Detailed Implementation Plan

### 1. Standardize Module Organization

#### Auth Service Changes

**File**: `server/apps/auth-service/src/auth-service.module.ts`

```typescript
// Current implementation is monolithic
// Need to refactor to a more modular approach similar to user-service
```

**Changes Required**:
- Extract repository providers to a dedicated repository module
- Move service providers to appropriate feature modules
- Create a consistent pattern for module imports

#### Implementation Steps:
1. Create `server/apps/auth-service/src/infrastructure/repositories/repository.module.ts`
2. Move repository providers from main module to repository module
3. Update main module to import the repository module
4. Organize imports in a consistent order matching user-service

### 2. Standardize CQRS Implementation

#### Auth Service Changes

**File**: `server/apps/auth-service/src/auth-cqrs.module.ts`

```typescript
// Current implementation mixes infrastructure concerns with CQRS
// Need to extract Redis and JWT configuration to appropriate modules
```

**Changes Required**:
- Remove Redis configuration from CQRS module
- Extract JWT configuration to a separate module
- Ensure consistent pattern with user-service CQRS module

#### Implementation Steps:
1. Create `server/apps/auth-service/src/infrastructure/jwt/jwt.module.ts`
2. Move JWT configuration from CQRS module to JWT module
3. Update CQRS module to import the JWT module
4. Remove Redis configuration from CQRS module (use the existing Redis module)

### 3. Implement Consistent Kafka Pattern in Auth Service

#### New Files to Create:
- `server/apps/auth-service/src/kafka/kafka.module.ts`
- `server/apps/auth-service/src/kafka/kafka-producer.module.ts`
- `server/apps/auth-service/src/kafka/kafka-producer.service.ts`
- `server/apps/auth-service/src/kafka/kafka-consumer.service.ts`
- `server/apps/auth-service/src/kafka/handlers/user/index.ts`

#### Implementation Details:

**KafkaProducerModule**:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LoggingModule } from '@app/logging';

import { KafkaProducerService } from './kafka-producer.service';

@Module({
  imports: [
    LoggingModule,
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'auth-service-producer',
              brokers: configService
                .get<string>('KAFKA_BROKERS', 'kafka:29092')
                .split(','),
            },
            producer: {
              allowAutoTopicCreation: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaProducerModule {}
```

**KafkaModule**:
```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggingModule } from '@app/logging';
import { KafkaConsumerService } from './kafka-consumer.service';
import { UserEventHandlers } from './handlers/user';
import { KafkaProducerModule } from './kafka-producer.module';

@Module({
  imports: [LoggingModule, CqrsModule, KafkaProducerModule],
  providers: [KafkaConsumerService, ...UserEventHandlers],
  exports: [],
})
export class KafkaModule {}
```

**Event Publishing in Event Handlers**:
```typescript
// Example: UserRegisteredHandler
@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler implements IEventHandler<UserRegisteredEvent> {
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
  ) {
    this.loggingService.setContext(UserRegisteredHandler.name);
  }

  async handle(event: UserRegisteredEvent): Promise<void> {
    try {
      // Publish event to Kafka
      await this.kafkaProducerService.send(
        'auth-events',
        {
          type: 'UserRegistered',
          userId: event.userId,
          email: event.email,
          timestamp: event.timestamp,
        },
        event.userId,
      );

      this.loggingService.debug(
        `Published UserRegisteredEvent to Kafka: ${event.userId}`,
        'handle',
        { userId: event.userId },
      );
    } catch (error) {
      // Error handling
    }
  }
}
```

#### Implementation Steps:
1. Create Kafka modules in auth-service mirroring the structure in user-service
2. Implement KafkaProducerService for publishing events
3. Implement KafkaConsumerService for consuming events
4. Update event handlers to publish events to Kafka
5. Create handlers for consuming events from other services
6. Update auth-service.module.ts to import the KafkaModule
7. Ensure consistent event formats between services

### 4. Standardize Repository Organization

#### Auth Service Changes

**File**: `server/apps/auth-service/src/infrastructure/repositories/index.ts`

Current implementation:
```typescript
import { Provider } from '@nestjs/common';
import { DrizzleUserRepository } from './user.repository';
import { DrizzleUserAuthReadRepository } from './user-auth-read.repository';
import { TokenValidationReadRepositoryImpl } from './token-validation-read.repository';

export const RepositoryProviders: Provider[] = [
  // Write repositories
  {
    provide: 'UserRepository',
    useClass: DrizzleUserRepository,
  },

  // Read repositories
  {
    provide: 'UserAuthReadRepository',
    useClass: DrizzleUserAuthReadRepository,
  },
  {
    provide: 'TokenValidationReadRepository',
    useClass: TokenValidationReadRepositoryImpl,
  },
];
```

**New File**: `server/apps/auth-service/src/infrastructure/repositories/repository.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { LoggingModule } from '@app/logging';
import { RepositoryProviders } from './index';
import { CacheModule } from '../../cache/cache.module';

@Module({
  imports: [DatabaseModule.forAuth(), LoggingModule, CacheModule],
  providers: [...RepositoryProviders],
  exports: [...RepositoryProviders],
})
export class RepositoryModule {}
```

**Changes Required**:
- Create a repository module in auth-service
- Ensure consistent naming and organization of repositories
- Standardize dependency injection for repositories
- Create a cache module if it doesn't exist

#### Implementation Steps:
1. Create `server/apps/auth-service/src/cache/cache.module.ts` if it doesn't exist
2. Create `server/apps/auth-service/src/infrastructure/repositories/repository.module.ts`
3. Update auth-service.module.ts to import RepositoryModule instead of individual providers
4. Ensure consistent naming conventions for repositories (e.g., DrizzleUserRepository)
5. Update repository implementations to follow the same pattern as user-service

#### Example Repository Implementation:

```typescript
// Example of standardized repository implementation
@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly loggingService: LoggingService,
  ) {
    this.loggingService.setContext(DrizzleUserRepository.name);
  }

  async save(user: User): Promise<void> {
    try {
      // Implementation
    } catch (error) {
      // Error handling
    }
  }

  // Other methods
}
```

### 5. Extract Common Domain Models to Shared Libraries

#### Common Value Objects to Extract

Both services currently have duplicate implementations of several value objects:

1. **UserId**:
   - `server/apps/auth-service/src/domain/models/value-objects/user-id.value-object.ts`
   - `server/apps/user-service/src/domain/models/value-objects/user-id.value-object.ts`

2. **Email**:
   - `server/apps/auth-service/src/domain/models/value-objects/email.value-object.ts`
   - `server/apps/user-service/src/domain/models/value-objects/email.value-object.ts`

#### New Files to Create:
- `server/libs/domain/src/index.ts`
- `server/libs/domain/src/models/value-objects/user-id.value-object.ts`
- `server/libs/domain/src/models/value-objects/email.value-object.ts`
- `server/libs/domain/src/models/value-objects/index.ts`

#### Example Implementation:

**UserId Value Object**:
```typescript
// server/libs/domain/src/models/value-objects/user-id.value-object.ts
import { randomUUID } from 'crypto';

/**
 * UserId Value Object
 *
 * Represents a unique identifier for a user in the system.
 */
export class UserId {
  private readonly value: string;

  /**
   * Create a new UserId value object
   * @param id - The user ID string (optional, generates a new UUID if not provided)
   */
  constructor(id?: string) {
    this.value = id || randomUUID();
  }

  /**
   * Check if this user ID equals another user ID
   * @param id - The user ID to compare with
   * @returns True if the user IDs are equal, false otherwise
   */
  equals(id: UserId): boolean {
    return this.value === id.value;
  }

  /**
   * Get the string representation of the user ID
   * @returns The user ID as a string
   */
  toString(): string {
    return this.value;
  }
}
```

**Value Objects Index**:
```typescript
// server/libs/domain/src/models/value-objects/index.ts
export * from './user-id.value-object';
export * from './email.value-object';
// Export other value objects
```

#### Implementation Steps:
1. Create a new library using NestJS CLI: `nest g library domain`
2. Identify common value objects and domain models across services
3. Extract them to the shared domain library with consistent implementations
4. Update both services to import value objects from the shared library
5. Remove duplicate implementations from individual services
6. Update imports in all files that use these value objects
7. Run tests to ensure functionality is preserved

### 6. Standardize Folder Structure

#### Auth Service Changes

**Current Structure**:
```
server/apps/auth-service/src/
├── application/
├── auth/
├── domain/
├── health/
├── infrastructure/
├── permission/
├── rate-limit/
├── security-logging/
├── session/
├── token/
└── utils/
```

**Target Structure** (to match user-service):
```
server/apps/auth-service/src/
├── application/
├── cache/
├── domain/
├── graphql/ (if needed)
├── health/
├── infrastructure/
├── kafka/
├── presentation/
└── utils/
```

#### Implementation Steps:
1. Reorganize folders to follow a consistent pattern
2. Move files to appropriate folders
3. Update imports to reflect new folder structure
4. Ensure consistent naming conventions

### 7. Implement Consistent Event Communication

#### Create Shared Event Interfaces

To standardize event communication between services, we should create shared interfaces for events:

**New Files**:
- `server/libs/events/src/index.ts`
- `server/libs/events/src/interfaces/event.interface.ts`
- `server/libs/events/src/interfaces/kafka-message.interface.ts`
- `server/libs/events/src/auth/index.ts`
- `server/libs/events/src/user/index.ts`

**Example Implementation**:

```typescript
// server/libs/events/src/interfaces/event.interface.ts
export interface BaseEvent {
  type: string;
  timestamp: number;
}

export interface DomainEvent extends BaseEvent {
  aggregateId: string;
}
```

```typescript
// server/libs/events/src/interfaces/kafka-message.interface.ts
import { BaseEvent } from './event.interface';

export interface KafkaMessage<T extends BaseEvent> {
  key?: string;
  value: T;
  topic: string;
  partition?: number;
  headers?: Record<string, string>;
}
```

```typescript
// server/libs/events/src/auth/user-registered.event.ts
import { DomainEvent } from '../interfaces/event.interface';

export interface UserRegisteredEvent extends DomainEvent {
  type: 'UserRegistered';
  userId: string;
  email: string;
}
```

#### Auth Service Changes

**Current Implementation**:
- Uses NestJS EventBus for internal events
- Lacks mechanism to propagate events to other services

**Changes Required**:
- Update event handlers to publish events to Kafka
- Create consistent patterns for event serialization
- Implement clear separation between domain and integration events
- Use shared event interfaces

#### User Service Changes

**Current Implementation**:
- Has Kafka producer but event formats are not standardized
- Lacks clear typing for Kafka messages

**Changes Required**:
- Update event handlers to use shared event interfaces
- Standardize Kafka message formats
- Ensure consistent error handling

#### Implementation Steps for Both Services:
1. Create shared event interfaces library
2. Update auth-service to implement Kafka producer service
3. Update both services to use shared event interfaces
4. Implement consistent error handling for Kafka operations
5. Create clear documentation for event communication patterns

### 8. Create Shared Infrastructure Modules

#### New Files to Create:
- Additional shared modules as needed

#### Implementation Steps:
1. Identify common infrastructure code
2. Extract to shared libraries
3. Update both services to use shared modules
4. Create reusable modules for common infrastructure concerns

## User Service Improvements

While the user-service has a better overall structure, there are still areas that need improvement to achieve full standardization. This section outlines a comprehensive plan for implementing these improvements.

### Detailed User Service Improvement Plan

#### Phase 1: Event Standardization

**Objective**: Standardize event handling in the user-service to match the auth-service implementation.

**Files to Update**:
- Domain Events:
  - `server/apps/user-service/src/domain/events/user-created.event.ts`
  - `server/apps/user-service/src/domain/events/user-deleted.event.ts`
  - `server/apps/user-service/src/domain/events/user-profile-updated.event.ts`
  - `server/apps/user-service/src/domain/events/user-status-changed.event.ts`
- Event Handlers:
  - `server/apps/user-service/src/application/events/handlers/user-created.handler.ts`
  - `server/apps/user-service/src/application/events/handlers/user-deleted.handler.ts`
  - `server/apps/user-service/src/application/events/handlers/user-profile-updated.handler.ts`
  - `server/apps/user-service/src/application/events/handlers/user-status-changed.handler.ts`
- Kafka Producer:
  - `server/apps/user-service/src/kafka/kafka-producer.service.ts`

**Implementation Steps**:
1. Update domain events to implement shared interfaces from `@app/events`:
   - Add `type`, `aggregateId`, and `timestamp` properties
   - Update constructors to handle timestamp conversion
   - Ensure consistent event structure
2. Update event handlers to use standardized event format:
   - Remove payload wrappers when publishing to Kafka
   - Ensure consistent error handling
   - Improve logging
3. Update Kafka producer service:
   - Add type parameters for better type safety
   - Improve error handling
   - Add better documentation

#### Phase 2: Cache Improvements

**Objective**: Improve cache implementation with better documentation and standardized patterns.

**Files to Update**:
- `server/apps/user-service/src/cache/user-cache.service.ts`
- `server/apps/user-service/src/cache/cache.module.ts`
- Repository implementations that use caching

**Implementation Steps**:
1. Document cache strategies:
   - Add comprehensive JSDoc comments to cache methods
   - Document TTL strategies
   - Document cache key generation
2. Standardize cache invalidation:
   - Create consistent patterns for cache invalidation
   - Ensure all repositories follow the same pattern
   - Add better error handling
3. Extract common cache patterns:
   - Identify common cache operations
   - Create utility methods for common operations
   - Consider moving to a shared library

#### Phase 3: GraphQL Enhancements

**Objective**: Enhance GraphQL implementation with better documentation and error handling.

**Files to Update**:
- `server/apps/user-service/src/graphql/graphql.module.ts`
- `server/apps/user-service/src/graphql/resolvers/*.resolver.ts`
- `server/apps/user-service/src/graphql/README.md`

**Implementation Steps**:
1. Improve GraphQL documentation:
   - Add comprehensive JSDoc comments to resolvers
   - Update README with best practices
   - Document resolver patterns
2. Standardize error handling:
   - Create consistent error handling for resolvers
   - Improve error logging
   - Add better error messages for clients
3. Extract common utilities:
   - Identify common GraphQL operations
   - Create utility methods for common operations
   - Consider moving to a shared library

#### Phase 4: Repository Improvements

**Objective**: Improve repository implementations with better type safety and error handling.

**Files to Update**:
- `server/apps/user-service/src/infrastructure/repositories/*.repository.ts`
- `server/apps/user-service/src/infrastructure/repositories/repository.module.ts`

**Implementation Steps**:
1. Enhance type safety:
   - Add better type annotations to repository methods
   - Use generics consistently
   - Document repository patterns
2. Standardize error handling:
   - Create consistent error handling for repositories
   - Improve error logging
   - Add better error messages
3. Improve cache integration:
   - Standardize how repositories interact with cache
   - Ensure consistent cache invalidation
   - Document cache integration patterns

#### Phase 5: CQRS Module Improvements

**Objective**: Enhance CQRS module with better documentation and error handling.

**Files to Update**:
- `server/apps/user-service/src/user-cqrs.module.ts`
- `server/apps/user-service/src/application/commands/handlers/*.handler.ts`
- `server/apps/user-service/src/application/queries/handlers/*.handler.ts`

**Implementation Steps**:
1. Add better documentation:
   - Add comprehensive JSDoc comments to the module
   - Document command and query patterns
   - Document event handling patterns
2. Standardize error handling:
   - Create consistent error handling for command handlers
   - Create consistent error handling for query handlers
   - Improve error logging
3. Improve module organization:
   - Consider separating event handlers that publish to Kafka
   - Ensure consistent imports
   - Document module organization patterns

## Implementation Sequence

1. ✅ Extract common domain models to shared libraries
   - ✅ UserId value object
   - ✅ Email value object
   - ⏳ Password value object
   - ⏳ Username value object
   - ⏳ Other common value objects
2. ✅ Standardize folder structure in auth-service
3. ✅ Implement Kafka modules in auth-service
4. ✅ Create repository module in auth-service
5. ✅ Refactor CQRS module in auth-service
6. ✅ Update event handlers for consistent event communication
7. ⏳ Implement user-service improvements
   - ✅ Phase 1: Event Standardization
     - ✅ Update domain events to implement shared interfaces
     - ✅ Update event handlers to use standardized event format
     - ✅ Update Kafka producer service with type parameters
   - ✅ Phase 2: Cache Improvements
     - ✅ Document cache strategies
     - ✅ Standardize cache invalidation
     - ✅ Extract common cache patterns
   - ✅ Phase 3: GraphQL Enhancements
     - ✅ Improve GraphQL documentation
     - ✅ Standardize error handling
     - ✅ Extract common utilities
   - ✅ Phase 4: Repository Improvements
     - ✅ Enhance type safety
     - ✅ Standardize error handling
     - ✅ Improve cache integration
   - ✅ Phase 5: CQRS Module Improvements
     - ✅ Add better documentation
     - ✅ Standardize error handling
     - ✅ Improve module organization
8. ✅ Standardize main module organization
9. ⏳ Create additional shared infrastructure modules as needed

## Testing Strategy

After each major change:
1. Run unit tests for affected components
2. Run integration tests to ensure services can communicate
3. Verify that all existing functionality works as expected
4. Check for any regressions in performance or reliability

## Documentation Updates

After implementation:
1. Update architecture documentation to reflect standardized structure
2. Create guidelines for future development
3. Document best practices for module organization
4. Update diagrams to show standardized architecture

## Benefits of Standardization

Implementing this standardization plan will provide several key benefits:

1. **Improved Developer Experience**: Consistent patterns make it easier for developers to work across different services.
2. **Reduced Cognitive Load**: Developers don't need to learn different patterns for each service.
3. **Better Code Reuse**: Shared libraries and common patterns reduce duplication.
4. **Easier Maintenance**: Standardized code is easier to maintain and update.
5. **Simplified Onboarding**: New team members can understand the codebase more quickly.
6. **Enhanced Scalability**: Consistent patterns make it easier to scale the application.
7. **Better Testing**: Standardized code is easier to test with consistent approaches.
8. **Balanced Improvements**: By addressing issues in both services rather than just one, we create a truly standardized architecture.
9. **Future-Proof Design**: Extracting shared interfaces and libraries makes it easier to add new services in the future.

## Guidelines for Future Development

To maintain consistency in future development:

1. **Follow Established Patterns**: Use the standardized patterns for new services and features.
2. **Extract Common Code**: Identify and extract common code to shared libraries.
3. **Use Shared Libraries**: Leverage existing shared libraries instead of creating new implementations.
4. **Document Deviations**: If a deviation from the standard pattern is necessary, document the reason.
5. **Review for Consistency**: Include checks for architectural consistency in code reviews.
6. **Update Standards**: Evolve standards as needed, but ensure changes are applied consistently.

## Related Documents

- [Server Plan](SERVER_PLAN.md)
- [CQRS Implementation Plan](CQRS_IMPLEMENTATION_PLAN.md)
- [User Service Plan](USER_SERVICE_PLAN.md)
- [Auth Service Plan](AUTH_SERVICE_PLAN.md)

## Document Information
- **Author**: Chat Application Team
- **Created**: 2023-09-10
- **Last Updated**: 2023-06-05
- **Version**: 1.5.0

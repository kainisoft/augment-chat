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
7. ✅ Implement user-service improvements
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
9. ✅ Create additional shared infrastructure modules as needed
10. ⏳ **Phase 6: Environment Variable Management Standardization**
    - ✅ Step 1: File Structure Standardization
      - ✅ Create new directory structure for environment files
      - ✅ Rename existing environment files to follow naming convention
      - ✅ Update Docker Compose to use new file paths
      - ✅ Test that all services start correctly with new file structure
    - ✅ Step 2: Environment File Creation
      - ✅ Create comprehensive environment files for user-service
      - ✅ Create comprehensive environment files for chat-service
      - ✅ Create comprehensive environment files for notification-service
      - ✅ Update existing environment files to follow standard structure
      - ✅ Create shared environment files for common variables
    - ✅ Step 3: Validation Enhancement
      - ✅ Add service-specific validation rules to EnvironmentValidationService
      - ✅ Update ConfigurationService to use enhanced validation
      - ✅ Test validation rules with all services
      - ✅ Create validation error handling and reporting
    - ✅ Step 4: Docker Integration
      - ✅ Update all services in Docker Compose to use env_file
      - ✅ Remove inline environment variables from Docker Compose
      - ✅ Test Docker Compose with new environment file integration
      - ✅ Verify all services start and communicate correctly
    - ✅ Step 5: Documentation Creation
      - ✅ Create master environment variables documentation
      - ✅ Create service-specific environment documentation
      - ✅ Document validation rules and troubleshooting guides
      - ✅ Create environment configuration examples
    - ⏳ Step 6: Production Configuration
      - [ ] Create production environment files for all services
      - [ ] Implement environment variable substitution patterns
      - [ ] Create production-specific Docker Compose configuration
      - [ ] Test production environment configuration

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

## Phase 6: Environment Variable Management Standardization

### Overview

This phase standardizes environment variable management across all microservices to ensure consistency, maintainability, and security. The standardization leverages the existing `@app/config` library infrastructure while establishing consistent patterns for Docker environment configuration.

### Current State Analysis

**Inconsistencies Identified:**
- **Mixed Configuration Approaches**: Some services use `env_file` (auth-service, api-gateway, logging-service) while others use inline `environment` variables (user-service, chat-service, notification-service)
- **Inconsistent File Naming**: `auth-config.env`, `api-gateway.env`, `logging-config.env` lack standardized naming convention
- **Variable Configuration Depth**: Auth-service has comprehensive environment configuration while other services have minimal variables
- **Docker Compose Integration**: Inconsistent integration between environment files and Docker Compose service definitions

**Existing Infrastructure Strengths:**
- ✅ Robust `@app/config` library with validation and type safety
- ✅ `ConfigurationService` with standardized configuration patterns
- ✅ `EnvironmentValidationService` for validation rules
- ✅ `ConfigurationFactory` for service-specific configuration creation
- ✅ Service-specific configuration patterns in bootstrap service

### Standardization Goals

1. **Consistent File Naming**: Standardize environment file naming across all services
2. **Unified Directory Structure**: Organize Docker environment configs consistently
3. **Comprehensive Environment Coverage**: Ensure all services have complete environment configuration
4. **Validation and Type Safety**: Leverage existing validation infrastructure
5. **Documentation Standards**: Document required vs optional variables for each service
6. **Docker Compose Integration**: Standardize how environment files integrate with Docker Compose
7. **Security Best Practices**: Implement consistent security patterns for sensitive variables
8. **Development vs Production**: Clear separation of environment-specific configurations

### Implementation Plan

#### Step 1: Standardize Environment File Naming and Structure

**Objective**: Create consistent naming convention and directory structure for all environment files.

**New File Naming Convention**:
```
docker/config/{service-name}/{service-name}.env
```

**Files to Create/Rename**:
- ✅ `docker/config/auth/auth-config.env` → `docker/config/auth-service/auth-service.env`
- ✅ `docker/config/api-gateway/api-gateway.env` → `docker/config/api-gateway/api-gateway.env` (already correct)
- ✅ `docker/config/logging/logging-config.env` → `docker/config/logging-service/logging-service.env`
- ⏳ `docker/config/user-service/user-service.env` (new)
- ⏳ `docker/config/chat-service/chat-service.env` (new)
- ⏳ `docker/config/notification-service/notification-service.env` (new)

**Directory Structure**:
```
docker/config/
├── api-gateway/
│   ├── api-gateway.env
│   └── api-gateway.production.env
├── auth-service/
│   ├── auth-service.env
│   └── auth-service.production.env
├── user-service/
│   ├── user-service.env
│   └── user-service.production.env
├── chat-service/
│   ├── chat-service.env
│   └── chat-service.production.env
├── notification-service/
│   ├── notification-service.env
│   └── notification-service.production.env
├── logging-service/
│   ├── logging-service.env
│   └── logging-service.production.env
└── shared/
    ├── common.env
    └── infrastructure.env
```

**Implementation Tasks**:
- ✅ Create new directory structure for all services
- ✅ Rename existing environment files to follow naming convention
- [ ] Create comprehensive environment files for services currently using inline variables
- [ ] Create production-specific environment files for all services
- [ ] Create shared environment files for common variables
- ✅ Update Docker Compose to use new file paths

#### Step 2: Create Comprehensive Environment Files

**Objective**: Ensure all services have complete environment configuration following the auth-service model.

**Standard Environment File Structure**:
```env
# Service Configuration
NODE_ENV=development
PORT={service-port}
HOST=0.0.0.0
APP_VERSION=1.0.0

# Database Configuration
DATABASE_URL_{SERVICE}=postgresql://postgres:postgres@postgres:5432/{service}_db
DATABASE_POOL_SIZE=10
DATABASE_IDLE_TIMEOUT=30
DATABASE_SSL=false

# Redis Configuration (for services that use Redis)
REDIS_NODE_1=redis-node-1
REDIS_NODE_1_PORT=6379
REDIS_NODE_2=redis-node-2
REDIS_NODE_2_PORT=6380
REDIS_NODE_3=redis-node-3
REDIS_NODE_3_PORT=6381
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_KEY_PREFIX={service}:

# Kafka Configuration
KAFKA_BROKERS=kafka:29092
KAFKA_LOGS_TOPIC=logs
KAFKA_CLIENT_ID={service}
KAFKA_GROUP_ID={service}-group

# Logging Configuration
LOG_LEVEL=info
LOG_CONSOLE=true
LOG_KAFKA_ENABLED=true

# CORS Configuration
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000,http://localhost:4000
CORS_CREDENTIALS=true

# Service-Specific Configuration
# (Additional variables specific to each service)
```

**Service-Specific Environment Files**:

**User Service** (`docker/config/user-service/user-service.env`):
```env
# User Service Configuration

# Service Configuration
NODE_ENV=development
PORT=4002
HOST=0.0.0.0
APP_VERSION=1.0.0

# Database Configuration
DATABASE_URL_USER=postgresql://postgres:postgres@postgres:5432/user_db
DATABASE_POOL_SIZE=10
DATABASE_IDLE_TIMEOUT=30
DATABASE_SSL=false

# Redis Configuration
REDIS_NODE_1=redis-node-1
REDIS_NODE_1_PORT=6379
REDIS_NODE_2=redis-node-2
REDIS_NODE_2_PORT=6380
REDIS_NODE_3=redis-node-3
REDIS_NODE_3_PORT=6381
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_KEY_PREFIX=user:

# Cache Configuration
CACHE_TTL=300
CACHE_PREFIX=user:cache
CACHE_LOGS=true

# Kafka Configuration
KAFKA_BROKERS=kafka:29092
KAFKA_LOGS_TOPIC=logs
KAFKA_CLIENT_ID=user-service
KAFKA_GROUP_ID=user-service-group

# Logging Configuration
LOG_LEVEL=info
LOG_CONSOLE=true
LOG_KAFKA_ENABLED=true

# GraphQL Configuration
GRAPHQL_PLAYGROUND=true
GRAPHQL_DEBUG=true
GRAPHQL_INTROSPECTION=true
GRAPHQL_SCHEMA_FILE_ENABLED=false

# CORS Configuration
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000,http://localhost:4000,http://localhost:4001
CORS_CREDENTIALS=true

# Performance Configuration
QUERY_COMPLEXITY_LIMIT=1000
QUERY_DEPTH_LIMIT=10
```

**Chat Service** (`docker/config/chat-service/chat-service.env`):
```env
# Chat Service Configuration

# Service Configuration
NODE_ENV=development
PORT=4003
HOST=0.0.0.0
APP_VERSION=1.0.0

# MongoDB Configuration
MONGODB_URI=mongodb://mongo:mongo@mongo:27017/chat_db?authSource=admin
MONGODB_CONNECTION_POOL_SIZE=10
MONGODB_CONNECTION_TIMEOUT=30000

# Kafka Configuration
KAFKA_BROKERS=kafka:29092
KAFKA_LOGS_TOPIC=logs
KAFKA_CLIENT_ID=chat-service
KAFKA_GROUP_ID=chat-service-group

# Logging Configuration
LOG_LEVEL=info
LOG_CONSOLE=true
LOG_KAFKA_ENABLED=true

# GraphQL Configuration
GRAPHQL_PLAYGROUND=true
GRAPHQL_DEBUG=true
GRAPHQL_INTROSPECTION=true
GRAPHQL_SUBSCRIPTIONS_ENABLED=true

# WebSocket Configuration
WS_PORT=4003
WS_PATH=/graphql
WS_CORS_ORIGIN=http://localhost:3000

# CORS Configuration
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000,http://localhost:4000,http://localhost:4001
CORS_CREDENTIALS=true

# Message Configuration
MAX_MESSAGE_LENGTH=10000
MESSAGE_HISTORY_LIMIT=100
TYPING_INDICATOR_TIMEOUT=3000
```

**Notification Service** (`docker/config/notification-service/notification-service.env`):
```env
# Notification Service Configuration

# Service Configuration
NODE_ENV=development
PORT=4004
HOST=0.0.0.0
APP_VERSION=1.0.0

# MongoDB Configuration
MONGODB_URI=mongodb://mongo:mongo@mongo:27017/notification_db?authSource=admin
MONGODB_CONNECTION_POOL_SIZE=10
MONGODB_CONNECTION_TIMEOUT=30000

# Kafka Configuration
KAFKA_BROKERS=kafka:29092
KAFKA_LOGS_TOPIC=logs
KAFKA_CLIENT_ID=notification-service
KAFKA_GROUP_ID=notification-service-group

# Logging Configuration
LOG_LEVEL=info
LOG_CONSOLE=true
LOG_KAFKA_ENABLED=true

# CORS Configuration
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000,http://localhost:4000,http://localhost:4001
CORS_CREDENTIALS=true

# Notification Configuration
EMAIL_ENABLED=false
SMS_ENABLED=false
PUSH_ENABLED=true
NOTIFICATION_BATCH_SIZE=100
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_RETRY_DELAY=5000

# Rate Limiting
NOTIFICATION_RATE_LIMIT_PER_USER=100
NOTIFICATION_RATE_LIMIT_WINDOW=3600
```

**Implementation Tasks**:
- ✅ Create comprehensive environment files for user-service
- ✅ Create comprehensive environment files for chat-service
- ✅ Create comprehensive environment files for notification-service
- ✅ Update existing auth-service environment file to follow standard structure
- ✅ Update existing api-gateway environment file to follow standard structure
- ✅ Update existing logging-service environment file to follow standard structure
- ✅ Create shared environment files for common infrastructure variables

#### Step 3: Enhance Environment Validation

**Objective**: Extend the existing `@app/config` library to support service-specific validation rules.

**Files to Update**:
- `server/libs/config/src/environment-validation.service.ts`
- `server/libs/config/src/configuration.service.ts`
- `server/libs/config/src/configuration.factory.ts`

**New Service-Specific Validation Rules**:

**User Service Validation Rules**:
```typescript
getUserServiceRules(): ValidationRule[] {
  return [
    ...this.getCommonRules(),
    {
      key: 'DATABASE_URL_USER',
      required: true,
      type: 'url',
      pattern: /^postgresql:\/\/.+/,
      description: 'User service PostgreSQL database connection URL',
    },
    {
      key: 'GRAPHQL_PLAYGROUND',
      required: false,
      type: 'boolean',
      description: 'Enable GraphQL Playground',
    },
    {
      key: 'QUERY_COMPLEXITY_LIMIT',
      required: false,
      type: 'number',
      min: 100,
      max: 10000,
      description: 'GraphQL query complexity limit',
    },
    {
      key: 'CACHE_TTL',
      required: false,
      type: 'number',
      min: 60,
      max: 3600,
      description: 'Cache TTL in seconds',
    },
  ];
}
```

**Chat Service Validation Rules**:
```typescript
getChatServiceRules(): ValidationRule[] {
  return [
    ...this.getCommonRules(),
    {
      key: 'MONGODB_URI',
      required: true,
      type: 'url',
      pattern: /^mongodb:\/\/.+/,
      description: 'Chat service MongoDB connection URI',
    },
    {
      key: 'MAX_MESSAGE_LENGTH',
      required: false,
      type: 'number',
      min: 1000,
      max: 50000,
      description: 'Maximum message length in characters',
    },
    {
      key: 'WS_PORT',
      required: false,
      type: 'number',
      min: 1000,
      max: 65535,
      description: 'WebSocket server port',
    },
  ];
}
```

**Implementation Tasks**:
- ✅ Add service-specific validation rules to EnvironmentValidationService
- ✅ Create validation rule factories for each service
- ✅ Update ConfigurationService to use service-specific validation
- ✅ Add validation for MongoDB connection strings
- ✅ Add validation for WebSocket configuration
- ✅ Add validation for GraphQL-specific variables
- ✅ Create comprehensive validation documentation

#### Step 4: Update Docker Compose Integration

**Objective**: Standardize how environment files are integrated with Docker Compose services.

**Docker Compose Changes**:

**Standard Service Configuration Pattern**:
```yaml
service-name:
  build:
    context: ./server
    dockerfile: ../docker/Dockerfiles/{service-name}.Dockerfile
    args:
      - BUILDKIT_INLINE_CACHE=1
  command: pnpm run start:debug 0.0.0.0:9229 {service-name}
  ports:
    - "{service-port}:{service-port}"
    - "{debug-port}:9229"
  env_file:
    - ./docker/config/{service-name}/{service-name}.env
  volumes:
    - ./server/apps/{service-name}:/app/apps/{service-name}:delegated
    - ./server/libs:/app/libs:delegated
    - ./server/nest-cli.json:/app/nest-cli.json:delegated
    - ./server/tsconfig.json:/app/tsconfig.json:delegated
    - {service-name}-node-modules:/app/node_modules
  networks:
    - chat-network
  profiles: [ "{service-profile}" ]
  healthcheck:
    test: [ "CMD", "wget", "--spider", "http://localhost:{service-port}/health" ]
    interval: 10s
    timeout: 5s
    retries: 3
    start_period: 10s
```

**Implementation Tasks**:
- ✅ Update user-service to use env_file instead of inline environment variables
- ✅ Update chat-service to use env_file instead of inline environment variables
- ✅ Update notification-service to use env_file instead of inline environment variables
- ✅ Update auth-service to use new environment file path
- ✅ Update logging-service to use new environment file path
- ✅ Remove inline environment variables from all services
- ✅ Ensure consistent service configuration patterns
- ✅ Update health check endpoints to be consistent

#### Step 5: Create Environment Documentation

**Objective**: Create comprehensive documentation for environment variables across all services.

**Documentation Files to Create**:
- `docs/server/ENVIRONMENT_VARIABLES.md`
- `docs/server/environment/AUTH_SERVICE_ENV.md`
- `docs/server/environment/USER_SERVICE_ENV.md`
- `docs/server/environment/CHAT_SERVICE_ENV.md`
- `docs/server/environment/NOTIFICATION_SERVICE_ENV.md`
- `docs/server/environment/API_GATEWAY_ENV.md`
- `docs/server/environment/LOGGING_SERVICE_ENV.md`

**Environment Variables Documentation Structure**:
```markdown
# {Service Name} Environment Variables

## Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| NODE_ENV | string | Application environment | development |
| PORT | number | Service port | 4002 |

## Optional Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| LOG_LEVEL | string | info | Logging level |

## Service-Specific Variables

### Database Configuration
- Detailed database configuration variables

### Cache Configuration
- Detailed cache configuration variables

## Environment File Examples

### Development
```env
# Example development configuration
```

### Production
```env
# Example production configuration
```
```

**Implementation Tasks**:
- ✅ Create master environment variables documentation
- ✅ Create service-specific environment documentation
- ✅ Document required vs optional variables for each service
- ✅ Create environment file examples for development and production
- ✅ Document environment variable validation rules
- ✅ Create troubleshooting guide for environment configuration
- ✅ Document security best practices for environment variables

#### Step 6: Implement Production Environment Configuration

**Objective**: Create production-ready environment configurations with security best practices.

**Production Environment Files**:
- `docker/config/{service-name}/{service-name}.production.env`

**Production Configuration Patterns**:
```env
# Production Service Configuration
NODE_ENV=production
PORT={service-port}
HOST=0.0.0.0

# Database Configuration (using environment-specific URLs)
DATABASE_URL_{SERVICE}=${DATABASE_URL_{SERVICE}}
DATABASE_POOL_SIZE=20
DATABASE_IDLE_TIMEOUT=60
DATABASE_SSL=true

# Security Configuration
JWT_SECRET=${JWT_SECRET}
SESSION_ENCRYPTION_KEY=${SESSION_ENCRYPTION_KEY}

# Logging Configuration (reduced verbosity)
LOG_LEVEL=warn
LOG_CONSOLE=false
LOG_KAFKA_ENABLED=true

# Performance Configuration
CACHE_TTL=600
QUERY_COMPLEXITY_LIMIT=500
```

**Implementation Tasks**:
- [ ] Create production environment files for all services
- [ ] Implement environment variable substitution for sensitive values
- [ ] Configure production-specific logging levels
- [ ] Set production-appropriate cache TTL values
- [ ] Configure production database connection settings
- [ ] Implement security-focused configuration patterns
- [ ] Create environment-specific Docker Compose files

### Implementation Sequence

#### Phase 6, Step 1: File Structure Standardization
- [ ] Create new directory structure for environment files
- [ ] Rename existing environment files to follow naming convention
- [ ] Update Docker Compose to use new file paths
- [ ] Test that all services start correctly with new file structure

#### Phase 6, Step 2: Environment File Creation
- [ ] Create comprehensive environment files for user-service
- [ ] Create comprehensive environment files for chat-service
- [ ] Create comprehensive environment files for notification-service
- [ ] Update existing environment files to follow standard structure
- [ ] Create shared environment files for common variables

#### Phase 6, Step 3: Validation Enhancement
- [ ] Add service-specific validation rules to EnvironmentValidationService
- [ ] Update ConfigurationService to use enhanced validation
- [ ] Test validation rules with all services
- [ ] Create validation error handling and reporting

#### Phase 6, Step 4: Docker Integration
- ✅ Update all services in Docker Compose to use env_file
- ✅ Remove inline environment variables from Docker Compose
- ✅ Test Docker Compose with new environment file integration
- ✅ Verify all services start and communicate correctly

#### Phase 6, Step 5: Documentation Creation
- ✅ Create master environment variables documentation
- ✅ Create service-specific environment documentation
- ✅ Document validation rules and troubleshooting guides
- ✅ Create environment configuration examples

#### Phase 6, Step 6: Production Configuration
- [ ] Create production environment files for all services
- [ ] Implement environment variable substitution patterns
- [ ] Create production-specific Docker Compose configuration
- [ ] Test production environment configuration

### Testing Strategy

**Environment Configuration Testing**:
1. **Validation Testing**: Verify that all validation rules work correctly
2. **Service Startup Testing**: Ensure all services start with new environment files
3. **Integration Testing**: Verify services can communicate with new configuration
4. **Production Simulation**: Test production environment files in staging
5. **Rollback Testing**: Verify ability to rollback to previous configuration

### Benefits of Environment Variable Standardization

1. **Consistency**: All services follow the same environment configuration patterns
2. **Maintainability**: Centralized environment management reduces configuration drift
3. **Security**: Standardized security practices for sensitive variables
4. **Documentation**: Clear documentation of all environment variables
5. **Validation**: Type-safe environment variable validation across all services
6. **Development Experience**: Easier onboarding and development with consistent patterns
7. **Production Readiness**: Clear separation between development and production configurations
8. **Troubleshooting**: Standardized configuration makes debugging easier

## Related Documents

- [Server Plan](SERVER_PLAN.md)
- [CQRS Implementation Plan](CQRS_IMPLEMENTATION_PLAN.md)
- [User Service Plan](USER_SERVICE_PLAN.md)
- [Auth Service Plan](AUTH_SERVICE_PLAN.md)

## Document Information
- **Author**: Chat Application Team
- **Created**: 2023-09-10
- **Last Updated**: 2024-01-15
- **Version**: 1.6.0

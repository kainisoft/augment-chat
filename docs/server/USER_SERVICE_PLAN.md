# User Service Plan

## Overview
The User Service manages user profiles, relationships, settings, and search functionality. It follows Domain-Driven Design (DDD) principles and implements the Command Query Responsibility Segregation (CQRS) pattern.

## Technology Stack
- NestJS with Fastify
- GraphQL with Apollo Server
- PostgreSQL for user data with Drizzle ORM
- Kafka for inter-service communication
- Redis for caching and session management
- CQRS pattern for command and query separation

## Development Tasks

### Phase 1: Basic Setup
- [x] Initialize service with NestJS CLI
- [x] Configure Fastify adapter
- [x] Set up GraphQL with Apollo Server
- [x] Configure GraphQL Code Generator for type safety
- [x] Set up database connection using Database library
- [x] Create user domain models following DDD principles
- [x] Implement repository interfaces and implementations

### Phase 2: Core Features
- [x] Implement user profile management
  - [x] Create user profile CRUD operations
  - [x] Implement profile validation
  - [ ] Add profile image handling
  - [x] Create profile completion status tracking
- [x] Create user relationships (friends/contacts)
  - [x] Implement relationship request system
  - [x] Add relationship status management
  - [x] Create relationship notifications
  - [x] Implement relationship privacy settings
- [x] Develop user settings functionality
  - [x] Create settings categories
  - [x] Implement settings validation
  - [x] Add default settings generation
  - [x] Create settings synchronization
- [x] Add user search capability
  - [x] Implement basic search by username/display name
  - [x] Add search result pagination
  - [x] Create search result filtering
  - [ ] Implement search history
- [x] Implement basic user preferences
  - [x] Add notification preferences
  - [x] Implement privacy preferences
  - [x] Create display preferences
  - [x] Add language and locale settings

### Phase 3: Advanced Features
- [x] Add user blocking functionality
- [ ] Implement user activity tracking
- [x] Create advanced search with filters
- [ ] Add user verification badges
- [ ] Implement user analytics

## CQRS Implementation

### Commands
- `CreateUserCommand` - Create a new user profile
- `UpdateUserProfileCommand` - Update user profile information
- `ChangeUserStatusCommand` - Change user online status
- `AddUserContactCommand` - Add a contact/friend
- `RemoveUserContactCommand` - Remove a contact/friend
- `UpdateUserSettingsCommand` - Update user settings
- `DeleteUserCommand` - Delete a user account

### Queries
- `GetUserProfileQuery` - Get user profile information
- `SearchUsersQuery` - Search for users
- `GetUserContactsQuery` - Get user contacts/friends
- `GetUserByIdQuery` - Get user by ID
- `GetUserByEmailQuery` - Get user by email
- `GetUserSettingsQuery` - Get user settings
- `GetUserPreferencesQuery` - Get user preferences

### Events
- `UserCreatedEvent` - User profile created
- `UserProfileUpdatedEvent` - User profile updated
- `UserStatusChangedEvent` - User status changed
- `UserContactAddedEvent` - Contact/friend added
- `UserContactRemovedEvent` - Contact/friend removed
- `UserSettingsUpdatedEvent` - User settings updated
- `UserDeletedEvent` - User account deleted

## Database Schema

### Users Table
- `id` (UUID): Primary key
- `authId` (UUID): Reference to Authentication service user
- `username` (String): Unique username
- `displayName` (String): User's display name
- `bio` (String): User biography
- `avatarUrl` (String): Profile picture URL
- `createdAt` (DateTime): Account creation timestamp
- `updatedAt` (DateTime): Last update timestamp

### Relationships Table
- `id` (UUID): Primary key
- `userId` (UUID): Foreign key to Users table (requester)
- `targetId` (UUID): Foreign key to Users table (target)
- `type` (Enum): Relationship type (friend, blocked, etc.)
- `status` (Enum): Status (pending, accepted, rejected)
- `createdAt` (DateTime): Relationship creation timestamp
- `updatedAt` (DateTime): Last update timestamp

### Settings Table
- `id` (UUID): Primary key
- `userId` (UUID): Foreign key to Users table
- `key` (String): Setting key
- `value` (JSON): Setting value
- `updatedAt` (DateTime): Last update timestamp

## GraphQL API

### Schema Design
The User Service exposes a GraphQL API with the following main types:

```graphql
type User {
  id: ID!
  username: String!
  displayName: String!
  bio: String
  avatarUrl: String
  status: UserStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
  relationships: [Relationship!]
  settings: [UserSetting!]
}

type Relationship {
  id: ID!
  user: User!
  target: User!
  type: RelationshipType!
  status: RelationshipStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type UserSetting {
  id: ID!
  user: User!
  key: String!
  value: JSON!
  updatedAt: DateTime!
}

enum UserStatus {
  ONLINE
  OFFLINE
  AWAY
  DO_NOT_DISTURB
}

enum RelationshipType {
  FRIEND
  BLOCKED
  MUTED
}

enum RelationshipStatus {
  PENDING
  ACCEPTED
  REJECTED
}
```

### Queries
- `user(id: ID!): User` - Get user profile by ID
- `me: User` - Get current user's profile
- `users(filter: UserFilterInput, pagination: PaginationInput): UserConnection!` - Search for users
- `userRelationships(userId: ID!, type: RelationshipType): [Relationship!]!` - Get user relationships
- `userSettings(userId: ID!): [UserSetting!]!` - Get user settings

### Mutations
- `updateUserProfile(input: UpdateUserProfileInput!): User!` - Update user profile
- `deleteUser(id: ID!): Boolean!` - Delete user account
- `createRelationship(input: CreateRelationshipInput!): Relationship!` - Create relationship request
- `updateRelationship(id: ID!, input: UpdateRelationshipInput!): Relationship!` - Update relationship
- `deleteRelationship(id: ID!): Boolean!` - Delete relationship
- `updateUserSetting(key: String!, value: JSON!): UserSetting!` - Update user setting

### Subscriptions
- `userStatusChanged(userId: ID!): UserStatus!` - Subscribe to user status changes
- `relationshipUpdated(userId: ID!): Relationship!` - Subscribe to relationship updates

### Health Checks
- `GET /health` - Service health check endpoint (REST endpoint for Kubernetes health checks)

## Integration with Auth Service

The User Service integrates with the Authentication Service in the following ways:

1. **User Creation**: When a user registers through the Auth Service, a corresponding user profile is created in the User Service.

2. **Authentication**: The User Service uses the IAM library for authentication and authorization, which is also used by the Auth Service.

3. **User Deletion**: When a user account is deleted, the Auth Service communicates with the User Service to delete the corresponding user profile.

4. **Event Communication**: The services communicate via Kafka events:
   - `UserRegisteredEvent` from Auth Service triggers user profile creation
   - `UserDeletedEvent` from User Service triggers auth record deletion
   - `UserEmailChangedEvent` from Auth Service triggers profile update

5. **Session Management**: Both services use the Redis library for session management and caching.

## Prerequisites

Before implementing the User Service, the following prerequisites need to be addressed:

1. **Database Schema Creation**: Ensure the User Service database schema is properly defined in the Database library.

2. **CQRS Framework Setup**: Set up the CQRS module for the User Service, similar to the Auth Service implementation.

3. **Domain Model Definition**: Define the domain models following DDD principles.

4. **Repository Interfaces**: Define the repository interfaces for both read and write operations.

5. **Integration with IAM Library**: Ensure proper integration with the IAM library for authentication and authorization.

6. **GraphQL Dependencies**: Install and configure the following packages:
   - `@nestjs/graphql` - NestJS GraphQL module
   - `@nestjs/apollo` - NestJS Apollo integration
   - `apollo-server-fastify` - Apollo Server for Fastify
   - `graphql` - GraphQL core library
   - `graphql-subscriptions` - For GraphQL subscriptions
   - `dataloader` - For efficient data loading
   - `@graphql-codegen/cli` - For generating TypeScript types from schema

7. **GraphQL Schema Design**: Design the GraphQL schema following best practices:
   - Use clear, consistent naming conventions
   - Implement proper pagination (cursor-based)
   - Design efficient nested resolvers
   - Plan subscription architecture

## Detailed Implementation Plan

### 1. Set up Database Connection
- [x] Configure the Database module for the User Service
- [x] Define the user schema tables in Drizzle
- [x] Set up migrations for the User Service database
- [x] Create database health checks

### 2. Create Domain Models
- [x] Implement User entity with proper encapsulation
- [x] Create value objects for user properties (Username, DisplayName, etc.)
- [x] Define domain events for user-related actions
- [x] Implement domain services for complex business logic

### 3. Implement Repositories
- [x] Create write repository for user operations
- [x] Implement read repositories for queries
- [x] Set up CQRS pattern with command and query handlers
- [x] Add caching for frequently accessed data

### 4. Develop GraphQL API
- [x] Define GraphQL schema using SDL (Schema Definition Language)
- [x] Implement resolvers for user profile queries and mutations
- [x] Create resolvers for relationship operations
- [x] Add resolvers for user settings and preferences
- [x] Implement GraphQL subscriptions for real-time updates
- [x] Set up DataLoader for efficient query resolution
- [x] Add proper error handling and validation
- [x] Implement pagination for list queries

### 5. Add Business Logic
- [x] Implement user profile validation
- [x] Add relationship management logic
- [x] Create settings management functionality
- [x] Implement search algorithms
- [x] Add user status management

### 6. Integrate with Auth Service
- [x] Set up Kafka event listeners for Auth Service events
- [x] Implement user creation on successful registration
- [x] Handle user deletion and updates
- [x] Create event publishers for User Service events

### 7. Add Security and Validation
- [x] Implement input validation using class-validator for GraphQL inputs
- [x] Add authorization checks using IAM library and GraphQL directives
- [x] Set up proper GraphQL error handling and formatting
- [x] Implement query complexity analysis to prevent abuse
- [x] Add depth limiting for nested queries
- [x] Configure rate limiting for GraphQL operations
- [x] Implement field-level authorization
- [ ] Set up persisted queries for production

### 8. Testing
- [x] Write unit tests for domain models and services
- [x] Create integration tests for repositories
- [x] Implement GraphQL resolver tests
- [x] Add E2E tests for GraphQL queries and mutations
- [x] Create subscription testing framework
- [x] Test DataLoader performance and caching
- [x] Implement GraphQL schema validation tests
- [ ] Add performance tests for complex queries
- [ ] Create security tests for GraphQL vulnerabilities

## Implementation Progress

### Completed
- Basic service setup with NestJS CLI
- Fastify adapter configuration
- Database connection setup using @app/database
- Domain model definition with shared value objects from @app/domain
- Repository implementation with standardized patterns
- CQRS pattern implementation following 'gold standard' approach
- User profile GraphQL API with comprehensive resolvers
- Relationship management GraphQL API
- Redis caching implementation using @app/redis
- Integration with Auth Service via Kafka using @app/kafka
- Advanced GraphQL features (subscriptions, DataLoader)
- User settings and preferences management
- Security and validation using @app/validation and @app/security
- Comprehensive testing using @app/testing utilities
- Performance optimization and monitoring

### Shared Module Integration
The User Service has been fully migrated to use shared infrastructure modules:
- **@app/validation**: All GraphQL input validation uses shared decorators
- **@app/dtos**: Error responses use shared DTO patterns
- **@app/security**: Rate limiting and security utilities integrated
- **@app/testing**: All tests use shared mock factories and test builders
- **@app/domain**: Uses shared value objects (UserId, Email, Username, etc.)
- **@app/events**: Event communication uses standardized interfaces
- **@app/kafka**: Kafka integration follows standardized patterns
- **@app/redis**: Caching uses shared Redis utilities
- **@app/logging**: Comprehensive logging with shared service
- **@app/metrics**: Performance monitoring integrated

### Remaining Tasks
- Set up persisted queries for production
- Add performance tests for complex queries
- Create security tests for GraphQL vulnerabilities
- Profile image handling implementation

## Related Documents

### Core Planning Documents
- [Server Plan](SERVER_PLAN.md) - Main server implementation plan
- [Service Standardization Plan](SERVICE_STANDARDIZATION_PLAN.md) - Standardization implementation
- [Service Standardization Progress](SERVICE_STANDARDIZATION_PROGRESS.md) - Progress tracking
- [Shared Infrastructure Modules](SHARED_INFRASTRUCTURE_MODULES.md) - Shared modules documentation

### Architecture and Implementation Guides
- [CQRS Implementation Plan](CQRS_IMPLEMENTATION_PLAN.md) - CQRS implementation details
- [DDD Implementation Guide](DDD_IMPLEMENTATION_GUIDE.md) - Domain-Driven Design implementation guide
- [Main Module Organization](MAIN_MODULE_ORGANIZATION.md) - Module organization patterns
- [Testing Standards Guide](TESTING_STANDARDS_GUIDE.md) - Testing patterns and utilities
- [Validation Standards Guide](VALIDATION_STANDARDS_GUIDE.md) - Validation patterns
- [Security Standards Guide](SECURITY_STANDARDS_GUIDE.md) - Security implementation

### Infrastructure Documentation
- [Database Plan](../database/DATABASE_PLAN.md) - Database implementation details
- [Kafka Setup](../kafka/KAFKA_SETUP.md) - Kafka configuration and usage
- [Redis Implementation Plan](../redis/REDIS_IMPLEMENTATION_PLAN.md) - Redis setup and patterns

### Service Integration
- [Auth Service Plan](AUTH_SERVICE_PLAN.md) - Authentication service implementation
- [Auth Service Kafka Integration](AUTH_SERVICE_KAFKA_INTEGRATION.md) - Kafka event communication

### Performance and Monitoring
- [Performance Best Practices](performance/PERFORMANCE_BEST_PRACTICES.md) - Performance optimization
- [Performance Monitoring Procedures](performance/PERFORMANCE_MONITORING_PROCEDURES.md) - Monitoring setup

## Document Information
- **Author**: Chat Application Team
- **Created**: 2023-06-01
- **Last Updated**: 2024-01-15
- **Version**: 2.0.0
- **Change Log**:
  - 2.0.0: Updated to reflect completed implementation and shared module integration
  - 1.5.0: Added Auth Service integration via Kafka
  - 1.4.0: Added relationship management GraphQL API and Redis caching
  - 1.3.0: Updated to use GraphQL instead of REST API
  - 1.2.0: Added detailed implementation plan and prerequisites
  - 1.1.0: Added CQRS implementation details
  - 1.0.0: Initial version

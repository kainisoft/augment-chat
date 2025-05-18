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
- [ ] Implement user profile management
  - [ ] Create user profile CRUD operations
  - [ ] Implement profile validation
  - [ ] Add profile image handling
  - [ ] Create profile completion status tracking
- [ ] Create user relationships (friends/contacts)
  - [ ] Implement relationship request system
  - [ ] Add relationship status management
  - [ ] Create relationship notifications
  - [ ] Implement relationship privacy settings
- [ ] Develop user settings functionality
  - [ ] Create settings categories
  - [ ] Implement settings validation
  - [ ] Add default settings generation
  - [ ] Create settings synchronization
- [ ] Add user search capability
  - [ ] Implement basic search by username/display name
  - [ ] Add search result pagination
  - [ ] Create search result filtering
  - [ ] Implement search history
- [ ] Implement basic user preferences
  - [ ] Add notification preferences
  - [ ] Implement privacy preferences
  - [ ] Create display preferences
  - [ ] Add language and locale settings

### Phase 3: Advanced Features
- [ ] Add user blocking functionality
- [ ] Implement user activity tracking
- [ ] Create advanced search with filters
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
- [ ] Define GraphQL schema using SDL (Schema Definition Language)
- [ ] Implement resolvers for user profile queries and mutations
- [ ] Create resolvers for relationship operations
- [ ] Add resolvers for user settings and preferences
- [ ] Implement GraphQL subscriptions for real-time updates
- [ ] Set up DataLoader for efficient query resolution
- [ ] Add proper error handling and validation
- [ ] Implement pagination for list queries

### 5. Add Business Logic
- [ ] Implement user profile validation
- [ ] Add relationship management logic
- [ ] Create settings management functionality
- [ ] Implement search algorithms
- [ ] Add user status management

### 6. Integrate with Auth Service
- [ ] Set up Kafka event listeners for Auth Service events
- [ ] Implement user creation on successful registration
- [ ] Handle user deletion and updates
- [ ] Create event publishers for User Service events

### 7. Add Security and Validation
- [ ] Implement input validation using class-validator for GraphQL inputs
- [ ] Add authorization checks using IAM library and GraphQL directives
- [ ] Set up proper GraphQL error handling and formatting
- [ ] Implement query complexity analysis to prevent abuse
- [ ] Add depth limiting for nested queries
- [ ] Configure rate limiting for GraphQL operations
- [ ] Implement field-level authorization
- [ ] Set up persisted queries for production

### 8. Testing
- [ ] Write unit tests for domain models and services
- [ ] Create integration tests for repositories
- [ ] Implement GraphQL resolver tests
- [ ] Add E2E tests for GraphQL queries and mutations
- [ ] Create subscription testing framework
- [ ] Test DataLoader performance and caching
- [ ] Implement GraphQL schema validation tests
- [ ] Add performance tests for complex queries
- [ ] Create security tests for GraphQL vulnerabilities

## Implementation Progress

### Completed
- Basic service setup with NestJS CLI
- Fastify adapter configuration
- Database connection setup
- Domain model definition
- Repository implementation
- CQRS pattern implementation

### In Progress
- GraphQL API development

### Upcoming
- Business logic implementation
- Integration with Auth Service
- Security and validation

## Related Documents

- [Server Plan](SERVER_PLAN.md) - Main server implementation plan
- [CQRS Implementation Plan](CQRS_IMPLEMENTATION_PLAN.md) - CQRS implementation details
- [DDD Implementation Guide](DDD_IMPLEMENTATION_GUIDE.md) - Domain-Driven Design implementation guide
- [Database Plan](../database/DATABASE_PLAN.md) - Database implementation details
- [Auth Service Plan](AUTH_SERVICE_PLAN.md) - Authentication service implementation

## Document Information
- **Author**: Chat Application Team
- **Created**: 2023-06-01
- **Last Updated**: 2023-07-16
- **Version**: 1.3.0
- **Change Log**:
  - 1.3.0: Updated to use GraphQL instead of REST API
  - 1.2.0: Added detailed implementation plan and prerequisites
  - 1.1.0: Added CQRS implementation details
  - 1.0.0: Initial version

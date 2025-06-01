# User Service

## Overview

The User Service is responsible for user profile management, user relationships, and user-related operations in the microservice architecture. It provides comprehensive user data management, search capabilities, and social features like friend relationships.

## Features

- **User Profile Management**: Create, read, update user profiles
- **User Search**: Advanced user search with pagination
- **User Relationships**: Friend requests, contacts, blocking functionality
- **GraphQL API**: Type-safe GraphQL endpoints with code generation
- **CQRS Implementation**: Command Query Responsibility Segregation pattern
- **Event-Driven Architecture**: Kafka-based event publishing and handling
- **Caching**: Redis-based caching for improved performance

## Architecture

The service follows Domain-Driven Design (DDD) and CQRS patterns as the 'gold standard':

- **GraphQL Resolvers**: Handle GraphQL queries and mutations
- **Command Handlers**: Process write operations (CQRS)
- **Query Handlers**: Handle read operations (CQRS)
- **Event Handlers**: Process domain events
- **Repositories**: Data access layer with command/query separation
- **Domain Objects**: User, UserProfile, UserRelationship entities
- **DTOs**: GraphQL input/output types

## API Endpoints

### GraphQL Endpoint
- `POST /graphql` - GraphQL endpoint for all operations

### GraphQL Operations

#### Queries
```graphql
# Get user profile
query GetUserProfile($id: ID!) {
  user(id: $id) {
    id
    email
    profile {
      displayName
      bio
      avatar
    }
  }
}

# Search users
query SearchUsers($query: String!, $pagination: PaginationInput) {
  searchUsers(query: $query, pagination: $pagination) {
    data {
      id
      email
      profile {
        displayName
      }
    }
    pagination {
      page
      limit
      total
    }
  }
}
```

#### Mutations
```graphql
# Update user profile
mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
  updateUserProfile(input: $input) {
    id
    profile {
      displayName
      bio
    }
  }
}

# Add friend
mutation AddFriend($targetUserId: ID!) {
  addFriend(targetUserId: $targetUserId) {
    id
    status
    createdAt
  }
}
```

### Health Monitoring
- `GET /health` - Comprehensive health check
- `GET /health/liveness` - Liveness probe
- `GET /health/readiness` - Readiness probe

## Dependencies

### Shared Modules
- `@app/dtos` - Shared data transfer objects (GraphQL pagination, error responses)
- `@app/validation` - Shared validation decorators
- `@app/security` - Security utilities and guards
- `@app/iam` - Identity and Access Management for authentication and authorization
- `@app/logging` - Centralized logging service
- `@app/testing` - Shared testing utilities

#### DTO Standardization
The User Service uses standardized DTOs from `@app/dtos` for consistent pagination and response patterns:

- **GraphQL Pagination**: `SearchUsersInput` extends `GraphQLSearchPaginationInput`
- **List Responses**: `UserConnection` extends `GraphQLListResponse<UserType>`
- **Search Responses**: `UserSearchResult` extends `GraphQLSearchResponse<UserType>`
- **Error Handling**: Consistent error response format across all operations

### External Dependencies
- **PostgreSQL**: User data storage via Drizzle ORM
- **Redis**: Caching and session management
- **Kafka**: Event publishing and consumption
- **GraphQL**: API layer with Apollo Server

## Development

### Running the Service

```bash
# Development mode
npm run start:dev user-service

# Production mode
npm run start:prod user-service

# Debug mode
npm run start:debug user-service
```

### GraphQL Development

```bash
# Generate GraphQL types
npm run graphql:generate

# Start GraphQL playground
# Navigate to http://localhost:4002/graphql
```

### Testing

The service uses the shared `@app/testing` module and serves as the 'gold standard' for testing patterns.

#### Unit Tests

```bash
# Run all user-service tests
npm test -- --testPathPattern=user-service

# Run specific test file
npm test -- user-service.controller.spec.ts

# Run tests with coverage
npm test -- --coverage --testPathPattern=user-service
```

#### E2E Tests

```bash
# Run E2E tests
npm run test:e2e user-service
```

#### Testing Patterns (Gold Standard)

**Controller Tests:**
```typescript
import { ControllerTestBuilder } from '@app/testing';
import { UserServiceController } from './user-service.controller';

describe('UserServiceController', () => {
  let testSetup: any;

  beforeEach(async () => {
    const controllerTestBuilder = new ControllerTestBuilder(/* ... */);
    testSetup = await controllerTestBuilder.createUserControllerTestSetup(
      UserServiceController,
    );
  });

  it('should return hello message', () => {
    const result = testSetup.controller.getHello();
    expect(result).toBe('Hello World!');
  });
});
```

**Service Tests:**
```typescript
import { ServiceTestBuilder } from '@app/testing';
import { UserServiceService } from './user-service.service';

describe('UserServiceService', () => {
  let testSetup: any;

  beforeEach(async () => {
    const serviceTestBuilder = new ServiceTestBuilder(/* ... */);
    testSetup = await serviceTestBuilder.createUserServiceTestSetup(UserServiceService);
  });

  it('should process user operations', async () => {
    const result = await testSetup.service.processUser(testSetup.testUsers[0]);
    expect(result).toBeDefined();
  });
});
```

**GraphQL Resolver Tests:**
```typescript
import { Test } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { MockFactoryService } from '@app/testing';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let mockFactory: MockFactoryService;

  beforeEach(async () => {
    mockFactory = new MockFactoryService();

    const module = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: 'UserQueryRepository',
          useValue: mockFactory.createMockRepository(),
        },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should resolve user by id', async () => {
    const user = mockFactory.createMockUser();
    const result = await resolver.user(user.id);
    expect(result).toBeDefined();
  });
});
```

### Code Quality

- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type safety and compile-time checks
- **GraphQL Code Generator**: Type-safe GraphQL operations
- **Jest**: Unit and integration testing

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/user_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=user-service

# GraphQL
GRAPHQL_PLAYGROUND=true
GRAPHQL_INTROSPECTION=true

# Service
PORT=4002
NODE_ENV=development
```

## CQRS Implementation

### Command Side (Write Operations)

```typescript
// Command Handler Example
@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler {
  async execute(command: UpdateUserProfileCommand) {
    // Business logic for updating user profile
    const user = await this.userRepository.findById(command.userId);
    user.updateProfile(command.profileData);
    await this.userRepository.save(user);

    // Publish domain event
    await this.eventBus.publish(new UserProfileUpdatedEvent(user));
  }
}
```

### Query Side (Read Operations)

```typescript
// Query Handler Example
@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler {
  async execute(query: GetUserProfileQuery) {
    return this.userQueryRepository.findUserWithProfile(query.userId);
  }
}
```

### Event Handling

```typescript
// Event Handler Example
@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler {
  async handle(event: UserCreatedEvent) {
    // Handle user creation event
    await this.cacheService.invalidateUserCache(event.userId);
    await this.notificationService.sendWelcomeEmail(event.user);
  }
}
```

## Deployment

### Docker

```bash
# Build image
docker build -t user-service .

# Run container
docker run -p 4002:4002 user-service
```

### Docker Compose

```bash
# Start all services
docker-compose up user-service

# Start with dependencies
docker-compose up user-service postgres redis kafka
```

## Monitoring

### Health Checks

- **System Health**: Service status and dependencies
- **Database Health**: PostgreSQL connection and performance
- **Redis Health**: Cache connectivity and performance
- **Kafka Health**: Event system connectivity

### Logging

Structured logging following the gold standard:

- **GraphQL Logging**: Query and mutation execution
- **CQRS Logging**: Command and query processing
- **Event Logging**: Domain event publishing and handling
- **Performance Logging**: Response times and cache hit rates

## Caching Strategy

### Cache Layers

1. **User Profile Cache**: Frequently accessed user data
2. **Search Result Cache**: Popular search queries
3. **Relationship Cache**: User connections and friend lists
4. **Query Result Cache**: GraphQL query results

### Cache Invalidation

- **Event-Driven**: Automatic invalidation on data changes
- **TTL-Based**: Time-based expiration for stale data
- **Manual**: Explicit cache clearing for critical updates

## Security

### Centralized IAM Integration

The User Service uses the centralized `@app/iam` module for all authentication and authorization:

- **JWT Authentication**: Centralized JWT token validation using `JwtAuthGuard`
- **Role-Based Access Control**: Fine-grained permissions using `@Roles()` decorator
- **Public Endpoints**: Selective public access using `@Public()` decorator
- **GraphQL Security**: Integrated authentication for GraphQL resolvers

### Authentication

- **JWT Validation**: Centralized token verification via `@app/iam`
- **GraphQL Context**: Automatic user context injection for resolvers
- **Rate Limiting**: Query complexity and request rate limits using `@app/security`

### Authorization

- **Field-Level Security**: GraphQL field access control via IAM guards
- **Resource Ownership**: Users can only access their own data
- **Relationship Permissions**: Friend-based access controls
- **Role-Based Access**: Admin, user, and moderator role distinctions

### IAM Integration Examples

```typescript
// GraphQL resolver with IAM protection
@Resolver(() => UserType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserResolver {
  @Query(() => UserType)
  @Roles('user', 'admin')
  async me(@Context() context: any) {
    // User automatically injected by IAM
    return this.userService.findById(context.user.id);
  }

  @Mutation(() => UserType)
  @Roles('user')
  async updateProfile(
    @Args('input') input: UpdateProfileInput,
    @Context() context: any,
  ) {
    // Only authenticated users can update their own profile
    return this.userService.updateProfile(context.user.id, input);
  }

  @Query(() => [UserType])
  @Public() // Public endpoint for user search
  async searchUsers(@Args('query') query: string) {
    return this.userService.searchPublicProfiles(query);
  }

  @Mutation(() => Boolean)
  @Roles('admin')
  async deleteUser(@Args('userId') userId: string) {
    // Only admins can delete users
    return this.userService.deleteUser(userId);
  }
}

// Relationship resolver with permission checks
@Resolver(() => UserRelationshipType)
@UseGuards(JwtAuthGuard)
export class RelationshipResolver {
  @Mutation(() => UserRelationshipType)
  @Roles('user')
  async addFriend(
    @Args('targetUserId') targetUserId: string,
    @Context() context: any,
  ) {
    // Users can only manage their own relationships
    return this.relationshipService.addFriend(context.user.id, targetUserId);
  }

  @Query(() => [UserRelationshipType])
  @Roles('user')
  async myRelationships(@Context() context: any) {
    // Users can only view their own relationships
    return this.relationshipService.getUserRelationships(context.user.id);
  }
}
```

## Troubleshooting

### Common Issues

1. **GraphQL Errors**: Check schema validation and resolver implementation
2. **Cache Issues**: Verify Redis connectivity and cache invalidation
3. **Event Processing**: Check Kafka connectivity and event handlers
4. **Database Performance**: Monitor query performance and indexing

### Debug Mode

```bash
# Enable debug logging
NODE_ENV=development npm run start:debug user-service

# GraphQL debugging
GRAPHQL_DEBUG=true npm run start:dev user-service
```

## Contributing

This service serves as the 'gold standard' for:

1. **CQRS Implementation**: Command/query separation patterns
2. **Event-Driven Architecture**: Domain event handling
3. **GraphQL Best Practices**: Resolver and schema design
4. **Testing Patterns**: Comprehensive test coverage
5. **Caching Strategies**: Multi-layer caching implementation

When contributing:

1. Follow the established CQRS patterns
2. Maintain the gold standard testing approach
3. Update GraphQL schema and generate types
4. Ensure event handling consistency
5. Document new features and patterns

## Related Documentation

### Core Planning Documents
- [User Service Plan](../../docs/server/USER_SERVICE_PLAN.md)
- [Service Standardization Plan](../../docs/server/SERVICE_STANDARDIZATION_PLAN.md)
- [Shared Infrastructure Modules](../../docs/server/SHARED_INFRASTRUCTURE_MODULES.md)

### Architecture and Implementation Guides
- [CQRS Implementation Guide](../../docs/server/CQRS_IMPLEMENTATION_PLAN.md)
- [DDD Implementation Guide](../../docs/server/DDD_IMPLEMENTATION_GUIDE.md)
- [GraphQL Best Practices](../../docs/server/GRAPHQL_GUIDELINES.md)

### Standards and Guidelines
- [Testing Standards Guide](../../docs/server/TESTING_STANDARDS_GUIDE.md)
- [Validation Standards Guide](../../docs/server/VALIDATION_STANDARDS_GUIDE.md)
- [Security Standards Guide](../../docs/server/SECURITY_STANDARDS_GUIDE.md)

### Performance and Monitoring
- [Performance Documentation Index](../../docs/server/performance/README.md)
- [Performance Best Practices](../../docs/server/performance/PERFORMANCE_BEST_PRACTICES.md)

### Shared Module Documentation
- [IAM Library](../../libs/iam/README.md) - Identity and Access Management
- [Testing Library](../../libs/testing/README.md)
- [Validation Library](../../libs/validation/README.md)
- [Security Library](../../libs/security/README.md)

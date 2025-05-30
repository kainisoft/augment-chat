# User Service Application Layer

This directory contains the application layer implementation for the User Service, following the Command Query Responsibility Segregation (CQRS) pattern and Domain-Driven Design (DDD) principles.

## Architecture Overview

The application layer serves as the orchestration layer between the presentation layer (GraphQL resolvers, REST controllers) and the domain layer. It implements the CQRS pattern to provide clear separation between read and write operations.

```
application/
├── commands/           # Write operations (state modifications)
├── queries/           # Read operations (data retrieval)
├── events/            # Event handlers (side effects)
└── common/            # Shared utilities and patterns
```

## CQRS Implementation

### Commands (Write Operations)

Commands represent operations that modify the system state. They follow these principles:

- **Single Responsibility**: Each command has one specific purpose
- **Immutable**: Command objects are immutable once created
- **Validation**: Business rule validation before execution
- **Event Publishing**: Publish domain events upon successful execution
- **Transactional**: Ensure data consistency through transactions

#### Command Pattern

```typescript
// Command Definition
export class CreateUserCommand {
  constructor(
    public readonly authId: string,
    public readonly username: string,
    public readonly displayName?: string,
  ) {}
}

// Command Handler
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  async execute(command: CreateUserCommand): Promise<void> {
    // 1. Validate business rules
    // 2. Create domain entity
    // 3. Persist to database
    // 4. Publish domain events
    // 5. Invalidate cache
  }
}
```

### Queries (Read Operations)

Queries represent operations that retrieve data without modifying state. They follow these principles:

- **Side-Effect Free**: No state modifications
- **Idempotent**: Same input always produces same output
- **Optimized**: Use read-optimized repositories and caching
- **Paginated**: Support pagination for large datasets
- **Cached**: Leverage Redis caching for performance

#### Query Pattern

```typescript
// Query Definition
export class GetUserProfileQuery {
  constructor(public readonly userId: string) {}
}

// Query Handler
@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler 
  implements IQueryHandler<GetUserProfileQuery, UserProfileReadModel> {
  async execute(query: GetUserProfileQuery): Promise<UserProfileReadModel> {
    // 1. Check cache first
    // 2. Query read repository if not cached
    // 3. Cache result for future requests
    // 4. Return read model
  }
}
```

### Events (Domain and Integration Events)

Events represent things that have happened in the domain. They follow these principles:

- **Immutable**: Events cannot be changed once created
- **Past Tense**: Named in past tense (UserCreated, not CreateUser)
- **Rich Information**: Contain all necessary data for handlers
- **Versioned**: Support schema evolution
- **Reliable**: Ensure delivery through proper error handling

#### Event Pattern

```typescript
// Domain Event
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly authId: string,
    public readonly username: string,
    public readonly timestamp: number = Date.now(),
  ) {}
}

// Event Handler
@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  async handle(event: UserCreatedEvent): Promise<void> {
    // 1. Publish to Kafka for other services
    // 2. Update analytics
    // 3. Send notifications
    // 4. Update search indexes
  }
}
```

## Error Handling Strategy

The application layer implements a comprehensive error handling strategy using the `CqrsErrorHandler` utility:

### Error Categories

1. **Domain Errors**: Business rule violations (400-level responses)
2. **Technical Errors**: Infrastructure failures (500-level responses)
3. **Validation Errors**: Input validation failures (400-level responses)

### Error Handling Patterns

```typescript
// Command Handler with Error Handling
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly errorHandler: CqrsErrorHandler) {}

  async execute(command: CreateUserCommand): Promise<void> {
    return this.errorHandler.handleCommand(
      'CreateUserHandler',
      'execute',
      { authId: command.authId, username: command.username },
      async () => {
        // Command logic here
        // Errors are automatically caught and transformed
      }
    );
  }
}
```

## Caching Strategy

The application layer implements intelligent caching to improve performance:

### Cache Patterns

- **Cache-Aside**: Check cache first, fallback to database
- **Write-Through**: Update cache when data changes
- **Cache Invalidation**: Remove stale data on updates
- **TTL with Jitter**: Prevent cache stampedes

### Cache Integration

```typescript
// Query Handler with Caching
async execute(query: GetUserProfileQuery): Promise<UserProfileReadModel> {
  // 1. Try cache first
  const cached = await this.cacheService.getUserProfile(query.userId);
  if (cached) return cached;

  // 2. Query database
  const profile = await this.repository.findById(query.userId);
  
  // 3. Cache result
  if (profile) {
    await this.cacheService.cacheUserProfile(query.userId, profile);
  }
  
  return profile;
}
```

## Testing Guidelines

### Unit Testing

- Test business logic in isolation
- Mock external dependencies
- Verify error handling scenarios
- Test edge cases and boundary conditions

### Integration Testing

- Test database operations
- Verify event publishing
- Test cache integration
- Validate error transformation

### Example Test Structure

```typescript
describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let mockRepository: jest.Mocked<UserRepository>;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    // Setup mocks and handler
  });

  it('should create user successfully', async () => {
    // Test successful creation
  });

  it('should throw error when username exists', async () => {
    // Test business rule validation
  });

  it('should publish UserCreatedEvent', async () => {
    // Test event publishing
  });
});
```

## Performance Considerations

### Optimization Strategies

1. **Repository Separation**: Use read/write repositories for optimal performance
2. **Caching**: Implement Redis caching with intelligent invalidation
3. **Async Processing**: Use event handlers for non-critical operations
4. **Database Optimization**: Proper indexing and query optimization
5. **Connection Pooling**: Efficient database connection management

### Monitoring and Observability

- Structured logging with correlation IDs
- Performance metrics for handlers
- Error rate monitoring
- Cache hit/miss ratios
- Database query performance

## Best Practices

1. **Keep Handlers Focused**: Single responsibility principle
2. **Use Value Objects**: Ensure data integrity and validation
3. **Implement Idempotency**: Especially for event handlers
4. **Handle Failures Gracefully**: Don't let side effects fail main operations
5. **Version Events**: Support schema evolution
6. **Monitor Performance**: Track handler execution times
7. **Test Thoroughly**: Unit and integration tests for all scenarios
8. **Document Patterns**: Maintain clear documentation for team consistency

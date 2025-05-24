# GraphQL Library

## Overview

The GraphQL Library provides standardized utilities, decorators, error handling, and types for GraphQL resolvers across our microservices architecture. It ensures consistent patterns, better error handling, and improved developer experience when working with GraphQL.

## Features

- **Standardized Resolvers**: Base utilities for consistent resolver patterns
- **Error Handling**: Comprehensive error types and formatting
- **Decorators**: Enhanced decorators for queries, mutations, and field resolvers
- **Common Types**: Reusable GraphQL types for pagination, filtering, and sorting
- **Validation**: Built-in validation utilities for input validation
- **Logging Integration**: Structured logging for all GraphQL operations

## Installation

The GraphQL Library is included in the shared libraries. To use it, import from `@app/graphql`:

```typescript
import { BaseResolverUtils, StandardQuery, NotFoundError } from '@app/graphql';
```

## Usage

### Base Resolver Utilities

Use `BaseResolverUtils` as a base class for your resolvers to get standardized patterns:

```typescript
import { Resolver } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BaseResolverUtils, StandardQuery, NotFoundError } from '@app/graphql';
import { LoggingService, ErrorLoggerService } from '@app/logging';

@Resolver(() => User)
export class UserResolver extends BaseResolverUtils {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    loggingService: LoggingService,
    errorLogger: ErrorLoggerService,
  ) {
    super(loggingService, errorLogger);
    this.loggingService.setContext(UserResolver.name);
  }

  @StandardQuery(() => User, {
    description: 'Get a user by ID',
    nullable: true,
  })
  async user(@Args('id') id: string): Promise<User | null> {
    return this.executeQuery(
      this.queryBus,
      new GetUserByIdQuery(id),
      'getUserById',
      { userId: id },
    );
  }
}
```

### Enhanced Decorators

Use standardized decorators for consistent GraphQL operations:

```typescript
// Standard Query
@StandardQuery(() => [User], {
  description: 'Search for users',
  guards: [AuthGuard],
})
async searchUsers(@Args('term') term: string): Promise<User[]> {
  // Implementation
}

// Standard Mutation
@StandardMutation(() => User, {
  description: 'Create a new user',
  guards: [AuthGuard],
})
async createUser(@Args('input') input: CreateUserInput): Promise<User> {
  // Implementation
}

// CRUD Decorators
@CRUDDecorators.GetById(User, 'User')
async user(@Args('id') id: string): Promise<User | null> {
  // Implementation
}

@CRUDDecorators.Create(User, 'User')
async createUser(@Args('input') input: CreateUserInput): Promise<User> {
  // Implementation
}
```

### Error Handling

Use standardized GraphQL errors for consistent error responses:

```typescript
import { NotFoundError, ValidationError, ForbiddenError } from '@app/graphql';

@Resolver(() => User)
export class UserResolver {
  async user(@Args('id') id: string): Promise<User> {
    const user = await this.userService.findById(id);
    
    if (!user) {
      throw new NotFoundError('User', id);
    }
    
    return user;
  }

  async updateUser(@Args('input') input: UpdateUserInput): Promise<User> {
    // Validation
    if (!input.email || !input.email.includes('@')) {
      throw new ValidationError('Invalid email format', 'email', input.email);
    }
    
    // Authorization
    if (!this.canUpdateUser(input.id)) {
      throw new ForbiddenError('You cannot update this user');
    }
    
    // Implementation
  }
}
```

### Pagination

Use standardized pagination types and utilities:

```typescript
import { PaginationInput, createConnectionType, createPaginationResult } from '@app/graphql';

// Create a connection type
const UserConnection = createConnectionType(User, 'User');

@Resolver(() => User)
export class UserResolver {
  @Query(() => UserConnection)
  async users(@Args('pagination') pagination: PaginationInput): Promise<typeof UserConnection> {
    const { items, totalCount } = await this.userService.findMany(pagination);
    
    return createPaginationResult(items, totalCount, pagination);
  }
}
```

### Input Validation

Use built-in validation utilities:

```typescript
import { CommonValidationRules } from '@app/graphql';

@Resolver(() => User)
export class UserResolver extends BaseResolverUtils {
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    // Validate input
    this.validateInput(input, [
      CommonValidationRules.required('email'),
      CommonValidationRules.notEmpty('email'),
      CommonValidationRules.minLength('password', 8),
    ], 'createUser');
    
    // Implementation
  }
}
```

## Best Practices

### 1. Use Base Resolver Utilities

Always extend `BaseResolverUtils` for your resolvers to get standardized error handling and logging:

```typescript
@Resolver(() => User)
export class UserResolver extends BaseResolverUtils {
  constructor(
    // ... other dependencies
    loggingService: LoggingService,
    errorLogger: ErrorLoggerService,
  ) {
    super(loggingService, errorLogger);
  }
}
```

### 2. Use Standardized Decorators

Use the provided decorators instead of raw GraphQL decorators:

```typescript
// ✅ Good
@StandardQuery(() => User, { description: 'Get user by ID' })

// ❌ Avoid
@Query(() => User)
```

### 3. Handle Errors Consistently

Use the provided error classes for consistent error handling:

```typescript
// ✅ Good
throw new NotFoundError('User', id);

// ❌ Avoid
throw new Error('User not found');
```

### 4. Document Your Resolvers

Always provide descriptions for your GraphQL operations:

```typescript
@StandardQuery(() => User, {
  description: 'Get a user by their unique identifier',
  nullable: true,
})
```

### 5. Use Validation

Validate inputs using the provided validation utilities:

```typescript
this.validateInput(input, [
  CommonValidationRules.required('email'),
  CommonValidationRules.notEmpty('name'),
], 'createUser');
```

### 6. Implement Pagination Correctly

Use the standardized pagination types and utilities:

```typescript
@Query(() => UserConnection)
async users(@Args('pagination') pagination: PaginationInput) {
  // Implementation using createPaginationResult
}
```

### 7. Log Operations

Use the built-in logging from `BaseResolverUtils`:

```typescript
return this.executeQuery(
  this.queryBus,
  new GetUserQuery(id),
  'getUser',
  { userId: id }, // Context for logging
);
```

## Error Codes

The library provides standardized error codes:

- `UNAUTHENTICATED`: User is not authenticated
- `FORBIDDEN`: User is not authorized
- `BAD_USER_INPUT`: Invalid input format
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict
- `BUSINESS_LOGIC_ERROR`: Business rule violation
- `RATE_LIMITED`: Rate limit exceeded
- `INTERNAL_SERVER_ERROR`: Unexpected server error

## Common Types

The library provides common GraphQL types:

- `PageInfo`: Pagination information
- `PaginationInput`: Pagination arguments
- `SortInput`: Sorting arguments
- `FilterInput`: Filtering arguments
- `SuccessResponse`: Standard success response
- `IdInput`: ID-based input
- `DateRangeInput`: Date range filtering

## Related Documentation

- [User Service GraphQL](../../apps/user-service/src/graphql/README.md)
- [Error Handling Guide](../common/src/errors/README.md)
- [Logging Guide](../logging/README.md)

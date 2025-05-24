# User Service GraphQL API

## Overview

The User Service GraphQL API provides a comprehensive interface for managing users and their relationships. It follows GraphQL best practices and implements standardized patterns for error handling, logging, and validation.

## Features

- **User Management**: Create, update, delete, and query user profiles
- **User Relationships**: Manage relationships between users (friends, contacts, blocked users)
- **Search Functionality**: Search users by username or display name
- **Field Resolvers**: Automatic resolution of nested user data
- **Comprehensive Error Handling**: Standardized error responses with detailed context
- **Structured Logging**: All operations are logged with contextual information
- **Type Safety**: Full TypeScript support with generated types

## Directory Structure

- `graphql.module.ts` - Main GraphQL module configuration
- `resolvers/` - GraphQL resolvers for different entities
- `types/` - GraphQL type definitions and input types
- `generated/` - Generated GraphQL schema and TypeScript types

## Code Generation

We use GraphQL Code Generator to generate TypeScript types from our GraphQL schema. This ensures type safety between our GraphQL schema and TypeScript code.

### Generated Files

- `generated/schema.gql` - The GraphQL schema generated from NestJS decorators
- `generated/graphql.ts` - TypeScript types for resolvers and schema
- `generated/operations.ts` - TypeScript types for GraphQL operations

### How to Generate Types

Run the following command from the root directory:

```bash
pnpm graphql:generate
```

This will generate TypeScript types based on the GraphQL schema.

To watch for changes and regenerate types automatically:

```bash
pnpm graphql:watch
```

## Schema Overview

### Core Types

#### UserType
Represents a user in the system.

```graphql
type UserType {
  id: ID!
  authId: String!
  username: String!
  displayName: String!
  bio: String
  avatarUrl: String
  status: UserStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

#### UserRelationship
Represents a relationship between two users.

```graphql
type UserRelationship {
  id: ID!
  user: UserType!
  target: UserType!
  type: RelationshipType!
  status: RelationshipStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Connection Types

#### UserSearchResult
Paginated search results for users.

```graphql
type UserSearchResult {
  users: [UserType!]!
  totalCount: Int!
}
```

#### RelationshipConnection
Paginated connection for relationship queries.

```graphql
type RelationshipConnection {
  nodes: [UserRelationship!]!
  totalCount: Int!
  hasMore: Boolean!
}
```

## Resolvers

### UserResolver
Handles user-related operations:
- `user(id: ID!)` - Get user by ID
- `userByUsername(username: String!)` - Get user by username
- `searchUsers(input: SearchUsersInput!)` - Search users
- `createUser(input: CreateUserInput!)` - Create new user
- `updateUserProfile(input: UpdateUserProfileInput!)` - Update user profile
- `updateUserStatus(input: UpdateUserStatusInput!)` - Update user status

### RelationshipResolver
Handles relationship operations:
- `relationship(id: ID!)` - Get relationship by ID
- `userRelationships(input: GetUserRelationshipsInput!)` - Get user relationships
- `userFriends(userId: ID!, limit: Int, offset: Int)` - Get user friends
- `createRelationship(userId: ID!, input: CreateRelationshipInput!)` - Create relationship
- `updateRelationship(id: ID!, input: UpdateRelationshipInput!)` - Update relationship
- `deleteRelationship(id: ID!)` - Delete relationship

## Error Handling

The API uses standardized GraphQL errors with detailed context:

### Common Error Types
- `NOT_FOUND`: Resource not found
- `BAD_USER_INPUT`: Invalid input data
- `VALIDATION_ERROR`: Input validation failed
- `BUSINESS_LOGIC_ERROR`: Business rule violation
- `INTERNAL_SERVER_ERROR`: Unexpected server error

### Error Response Format
```json
{
  "errors": [
    {
      "message": "User with ID 123 not found",
      "locations": [{"line": 2, "column": 3}],
      "path": ["user"],
      "extensions": {
        "code": "NOT_FOUND",
        "resource": "User",
        "identifier": "123"
      }
    }
  ]
}
```

## Best Practices

### 1. Use Field Selection
Always specify the fields you need to optimize performance:

```graphql
# ✅ Good - specific fields
query {
  user(id: "123") {
    id
    username
    displayName
  }
}

# ❌ Avoid - requesting unnecessary fields
query {
  user(id: "123") {
    id
    username
    displayName
    bio
    avatarUrl
    # ... many fields when you only need a few
  }
}
```

### 2. Handle Errors Gracefully
Always handle potential errors in your client code:

```typescript
try {
  const result = await client.query({
    query: GET_USER,
    variables: { id: userId }
  });
} catch (error) {
  if (error.graphQLErrors) {
    error.graphQLErrors.forEach(({ message, extensions }) => {
      if (extensions.code === 'NOT_FOUND') {
        // Handle not found error
      }
    });
  }
}
```

### 3. Use Pagination for Lists
For list queries, always use pagination to avoid performance issues:

```graphql
query SearchUsers($input: SearchUsersInput!) {
  searchUsers(input: $input) {
    users {
      id
      username
      displayName
    }
    totalCount
  }
}
```

### 4. Leverage Field Resolvers
Use field resolvers for nested data that might not always be needed:

```graphql
query GetRelationship($id: ID!) {
  relationship(id: $id) {
    id
    type
    status
    # These fields use resolvers and are only fetched when requested
    user {
      id
      username
    }
    target {
      id
      username
    }
  }
}
```

## Using Generated Types

### In Resolvers

```typescript
import { Resolver, Query, Args } from '@nestjs/graphql';
import { UserType } from '../types/user.types';

@Resolver(() => UserType)
export class UserResolver {
  @Query(() => UserType, { nullable: true })
  async user(@Args('id') id: string): Promise<UserType | null> {
    // Implementation with full type safety
  }
}
```

### In Services

```typescript
import { Injectable } from '@nestjs/common';
import { UserType } from '../graphql/types/user.types';

@Injectable()
export class UserService {
  async getUserById(id: string): Promise<UserType | null> {
    // Implementation
  }
}
```

## Development Guidelines

1. **Always run code generation** after making changes to GraphQL schema
2. **Use the generated types** in your resolvers and services
3. **Keep the GraphQL schema and TypeScript types in sync**
4. **Use the `@Resolver()` decorator** with the correct type
5. **Implement comprehensive error handling** in all resolvers
6. **Add detailed JSDoc comments** to all resolver methods
7. **Use structured logging** for all operations
8. **Validate inputs** before processing
9. **Follow consistent naming conventions** for queries and mutations
10. **Test all GraphQL operations** thoroughly

## Related Documentation

- [GraphQL Library](../../../../libs/graphql/README.md)
- [User Service Architecture](../README.md)
- [Error Handling Guide](../../../../libs/common/src/errors/README.md)
- [Logging Guide](../../../../libs/logging/README.md)

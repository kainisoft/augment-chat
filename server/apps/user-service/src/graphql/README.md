# GraphQL Implementation

This directory contains the GraphQL implementation for the User Service.

## Structure

- `graphql.module.ts` - Main GraphQL module configuration
- `resolvers/` - GraphQL resolvers
- `generated/` - Generated GraphQL schema and TypeScript types
- `types.ts` - TypeScript types for GraphQL context and models

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

## Using Generated Types

### In Resolvers

```typescript
import { Resolver, Query, Args } from '@nestjs/graphql';
import { Resolvers, QueryUserArgs, User } from '../generated/graphql';

@Resolver('User')
export class UserResolver implements Resolvers {
  @Query()
  async user(@Args() args: QueryUserArgs): Promise<User> {
    // Implementation
  }
}
```

### In Services

```typescript
import { Injectable } from '@nestjs/common';
import { User } from '../graphql/generated/graphql';

@Injectable()
export class UserService {
  async getUserById(id: string): Promise<User> {
    // Implementation
  }
}
```

## Best Practices

1. Always run code generation after making changes to GraphQL schema
2. Use the generated types in your resolvers and services
3. Keep the GraphQL schema and TypeScript types in sync
4. Use the `@Resolver()` decorator with the correct type
5. Implement the generated resolver interfaces for type safety

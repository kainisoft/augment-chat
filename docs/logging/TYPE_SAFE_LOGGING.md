# Type-Safe Logging Implementation

## Overview

This document describes the type-safe logging implementation for the Chat Application. The type-safe logging approach enhances the existing logging system by providing strong typing for log metadata, which improves developer experience, reduces errors, and makes logs more consistent and structured.

## Table of Contents

- [Overview](#overview)
- [Benefits of Type-Safe Logging](#benefits-of-type-safe-logging)
- [Type Definitions](#type-definitions)
- [Using Type-Safe Logging](#using-type-safe-logging)
- [Helper Utilities](#helper-utilities)
- [Examples](#examples)
- [Integration with Existing Code](#integration-with-existing-code)
- [Best Practices](#best-practices)
- [Related Documents](#related-documents)

## Benefits of Type-Safe Logging

The type-safe logging implementation provides several benefits:

1. **Better IDE Support**: Developers get autocomplete and type checking for log metadata
2. **Reduced Errors**: Type checking catches errors at compile time rather than runtime
3. **Self-Documenting Code**: The types clearly indicate what data should be included in logs
4. **Consistency**: Enforces consistent log structure across the application
5. **Easier Debugging**: Well-structured logs make debugging easier
6. **Improved Log Analysis**: Consistent log structure makes it easier to analyze logs

## Type Definitions

### Log Metadata Types

The type-safe logging implementation defines specialized metadata interfaces for different types of logs:

```typescript
// Base metadata interface
interface BaseLogMetadata {
  requestId?: string;
  correlationId?: string;
  duration?: number;
  [key: string]: any;
}

// HTTP-specific metadata
interface HttpLogMetadata extends BaseLogMetadata {
  method: string;
  url: string;
  statusCode?: number;
  ip?: string;
  userAgent?: string;
}

// Auth-specific metadata
interface AuthLogMetadata extends BaseLogMetadata {
  userId?: string;
  username?: string;
  action: string;
  success?: boolean;
}

// User-specific metadata
interface UserLogMetadata extends BaseLogMetadata {
  userId: string;
  action: string;
  fields?: string[];
}

// Chat-specific metadata
interface ChatLogMetadata extends BaseLogMetadata {
  userId?: string;
  roomId?: string;
  messageId?: string;
  action: string;
}

// Notification-specific metadata
interface NotificationLogMetadata extends BaseLogMetadata {
  userId?: string;
  notificationType: string;
  notificationId?: string;
  channel?: string;
  success?: boolean;
}

// Database-specific metadata
interface DatabaseLogMetadata extends BaseLogMetadata {
  operation: string;
  table?: string;
  collection?: string;
  duration: number;
  recordCount?: number;
}

// Error-specific metadata
interface ErrorLogMetadata extends BaseLogMetadata {
  errorName?: string;
  errorCode?: string | number;
  stack?: string;
}

// Union type of all metadata types
type LogMetadata =
  | BaseLogMetadata
  | HttpLogMetadata
  | AuthLogMetadata
  | UserLogMetadata
  | ChatLogMetadata
  | NotificationLogMetadata
  | DatabaseLogMetadata
  | ErrorLogMetadata;
```

### Generic Log Message Interface

The `LogMessage` interface uses generics to provide type safety for metadata:

```typescript
interface LogMessage<T extends LogMetadata = BaseLogMetadata> {
  // Basic log information
  level: LogLevel;
  message: string;
  timestamp?: string;

  // Context information
  service: string;
  context?: string;

  // Additional metadata
  requestId?: string;
  userId?: string;
  traceId?: string;

  // Error specific fields
  stack?: string;
  code?: string | number;

  // Typed metadata
  metadata?: T;
}
```

### Type Guards

Type guards are provided to check the type of metadata at runtime:

```typescript
function isHttpLogMetadata(metadata: LogMetadata): metadata is HttpLogMetadata {
  return 'method' in metadata && 'url' in metadata;
}

function isAuthLogMetadata(metadata: LogMetadata): metadata is AuthLogMetadata {
  return 'action' in metadata && 'username' in metadata;
}

function isUserLogMetadata(metadata: LogMetadata): metadata is UserLogMetadata {
  return 'userId' in metadata && 'action' in metadata && 'fields' in metadata;
}

// Additional type guards for other metadata types...
```

## Using Type-Safe Logging

### LoggingService with Generic Type Parameters

The `LoggingService` has been updated to use generic type parameters for metadata:

```typescript
// Example usage with type-safe metadata
import { LoggingService, HttpLogMetadata } from '@app/logging';

@Injectable()
export class UserController {
  constructor(private readonly loggingService: LoggingService) {}

  @Get('profile')
  getProfile(@Req() request: Request) {
    // Create type-safe HTTP metadata
    const metadata: HttpLogMetadata = {
      method: 'GET',
      url: '/profile',
      statusCode: 200,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      duration: 45,
    };

    // Log with type-safe metadata
    this.loggingService.log<HttpLogMetadata>(
      'User profile request',
      'UserController',
      metadata
    );

    // Rest of the method...
  }
}
```

## Helper Utilities

The `LogHelpers` class provides utility methods for creating typed metadata and common logging patterns:

```typescript
// Example usage of helper utilities
import { LoggingService, LogHelpers } from '@app/logging';

@Injectable()
export class AuthService {
  constructor(private readonly loggingService: LoggingService) {}

  async login(username: string, password: string) {
    try {
      // Authentication logic...
      const success = true;
      const userId = 'user-123';

      // Log authentication event using helper
      LogHelpers.logAuthEvent(
        this.loggingService,
        'login',
        success,
        {
          userId,
          username,
          context: 'AuthService'
        }
      );

      return { success, userId };
    } catch (error) {
      // Log authentication failure
      LogHelpers.logAuthEvent(
        this.loggingService,
        'login',
        false,
        {
          username,
          context: 'AuthService',
          error
        }
      );

      throw error;
    }
  }
}
```

## Examples

### HTTP Request Logging

```typescript
// Using the helper method
LogHelpers.logHttpRequest(
  this.loggingService,
  'GET',
  '/api/users',
  {
    statusCode: 200,
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    duration: 45,
    context: 'HttpExample'
  }
);

// Or using the typed metadata directly
const httpMetadata: HttpLogMetadata = {
  method: 'POST',
  url: '/api/auth/login',
  statusCode: 401,
  ip: '127.0.0.1',
  userAgent: 'Mozilla/5.0',
  duration: 120,
};

this.loggingService.error(
  'Authentication failed',
  undefined,
  'HttpExample',
  httpMetadata
);
```

### Database Operation Logging

```typescript
// Using the helper method
const dbMetadata = LogHelpers.createDatabaseLogMetadata(
  'query',
  150,
  {
    table: 'users',
    recordCount: 25
  }
);

this.loggingService.debug(
  'Database query executed',
  'DatabaseExample',
  dbMetadata
);
```

### Error Logging

```typescript
try {
  // Some operation that might fail
  throw new Error('Something went wrong');
} catch (error) {
  // Using the helper method
  const errorMetadata = LogHelpers.createErrorLogMetadata(
    error as Error,
    {
      errorCode: 'ERR_INTERNAL'
    }
  );

  this.loggingService.error(
    'An error occurred',
    (error as Error).stack,
    'ErrorExample',
    errorMetadata
  );
}
```

## Integration with Existing Code

The type-safe logging implementation is backward compatible with the existing logging system. You can gradually migrate your code to use the new type-safe approach:

1. **Step 1**: Update imports to include the new types and helpers
2. **Step 2**: Replace `Record<string, any>` metadata with typed metadata
3. **Step 3**: Use helper methods for common logging patterns
4. **Step 4**: Add type guards where needed for runtime type checking

## Best Practices

1. **Use Specific Metadata Types**: Choose the most specific metadata type for your logs
2. **Leverage Helper Methods**: Use the `LogHelpers` class for common logging patterns
3. **Include Context**: Always provide a context for your logs
4. **Add Request IDs**: Include request IDs for tracking requests across services
5. **Be Consistent**: Use consistent naming and structure for your logs
6. **Avoid Sensitive Data**: Never log sensitive data like passwords or tokens
7. **Include Relevant Information**: Log all information needed for debugging, but avoid excessive logging

## Related Documents

- [Logging Architecture](LOGGING_ARCHITECTURE.md)
- [Logging Technical Design](LOGGING_TECHNICAL_DESIGN.md)
- [Logging Implementation Plan](LOGGING_IMPLEMENTATION_PLAN.md)
- [Project Overview](../project/PROJECT_OVERVIEW.md)

## Document Information
- **Author**: Chat Application Team
- **Created**: 2023-08-01
- **Last Updated**: 2023-08-01
- **Version**: 1.0.0

# Error Logging Best Practices

This document outlines the best practices for error logging in the chat application.

## Using the ErrorLoggerService

The `ErrorLoggerService` is a common method for recording logs across the application. It provides structured error logging with severity levels, correlation IDs, and automatic error conversion.

### Benefits

- **Structured Logging**: Consistent format for all error logs
- **Severity Levels**: Debug, Info, Warning, Error, Critical
- **Automatic Error Conversion**: Converts standard errors to AppError
- **Context Information**: Source, method, correlation ID, etc.
- **Type Safety**: Better type safety than direct logging

### How to Use

1. **Inject the ErrorLoggerService**:

```typescript
import { ErrorLoggerService } from '@app/logging';

@Injectable()
export class YourService {
  constructor(
    private readonly errorLogger: ErrorLoggerService,
  ) {}
}
```

2. **Log Errors with Context**:

```typescript
try {
  // Your code that might throw an error
} catch (error: any) {
  this.errorLogger.error(error, 'Operation failed', {
    source: YourService.name,
    method: 'methodName',
    userId: user.id,
    // Add any other context information
  });

  // Re-throw or handle the error
  throw new CustomError('Friendly error message');
}
```

3. **Use Different Severity Levels**:

```typescript
// For debug information
this.errorLogger.debug(error, 'Debug message', context);

// For informational errors
this.errorLogger.info(error, 'Info message', context);

// For warnings
this.errorLogger.warning(error, 'Warning message', context);

// For errors (most common)
this.errorLogger.error(error, 'Error message', context);

// For critical errors
this.errorLogger.critical(error, 'Critical error message', context);
```

### Error Context

The `ErrorContext` interface provides a structured way to include additional information with error logs:

```typescript
interface ErrorContext {
  // The service or component where the error occurred
  source?: string;

  // The method or function where the error occurred
  method?: string;

  // The correlation ID for tracking errors across services
  correlationId?: string;

  // The request ID for tracking errors within a request
  requestId?: string;

  // The user ID if the error is associated with a user
  userId?: string;

  // Additional context information
  [key: string]: any;
}
```

### Helper Function

For convenience, you can use the `logError` helper function:

```typescript
import { logError } from 'path/to/logging.utils';

try {
  // Your code
} catch (error) {
  logError(
    errorLogger,
    error,
    'Operation failed',
    {
      source: YourService.name,
      method: 'methodName',
    },
    ErrorSeverity.ERROR // Optional, defaults to ERROR
  );

  throw new CustomError('Friendly error message');
}
```

## Migration from Direct Logging

If you're currently using direct logging with `LoggingService` and `createErrorMetadata`, you should migrate to `ErrorLoggerService`:

### Before:

```typescript
try {
  // Your code
} catch (error: any) {
  this.loggingService.error(
    `Operation failed: ${error.message || 'Unknown error'}`,
    error.stack || '',
    'methodName',
    createErrorMetadata(error, { userId: user.id }),
  );

  throw new CustomError('Friendly error message');
}
```

### After:

```typescript
try {
  // Your code
} catch (error: any) {
  this.errorLogger.error(error, 'Operation failed', {
    source: YourService.name,
    method: 'methodName',
    userId: user.id,
  });

  throw new CustomError('Friendly error message');
}
```

## Best Practices

1. **Always Include Context**: At minimum, include the source (class name) and method
2. **Use Appropriate Severity**: Choose the right severity level for the error
3. **Include User Information**: If the error is related to a user, include the user ID
4. **Include Correlation ID**: For distributed tracing across services
5. **Don't Log Sensitive Data**: Be careful not to log sensitive information
6. **Handle or Re-throw**: After logging, either handle the error or re-throw it
7. **Use Domain-Specific Errors**: Throw domain-specific errors rather than generic ones

## Implementation Details

The `ErrorLoggerService` is implemented in the logging library and is automatically registered in the `LoggingModule`. It uses the `LoggingService` internally but provides a more structured approach to error logging.

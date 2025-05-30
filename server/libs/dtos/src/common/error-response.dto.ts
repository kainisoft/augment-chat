import { ApiProperty } from '@nestjs/swagger';

/**
 * Error Response DTO
 *
 * Standardized error response format used across all microservices.
 * Provides consistent error structure for API consumers.
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Validation failed',
  })
  message: string;

  @ApiProperty({
    description: 'Error type/code',
    example: 'VALIDATION_ERROR',
  })
  error: string;

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path that caused the error',
    example: '/api/auth/login',
  })
  path: string;

  @ApiProperty({
    description: 'Correlation ID for tracking the request',
    example: 'req_123456789',
    required: false,
  })
  correlationId?: string;

  @ApiProperty({
    description: 'Additional error details',
    example: ['Email is required', 'Password must be at least 8 characters'],
    required: false,
    isArray: true,
    type: String,
  })
  details?: string[];
}

/**
 * Validation Error Response DTO
 *
 * Specialized error response for validation failures.
 * Extends the base error response with validation-specific fields.
 */
export class ValidationErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Field-specific validation errors',
    example: {
      email: ['Email is required', 'Email must be valid'],
      password: ['Password must be at least 8 characters'],
    },
    required: false,
  })
  fieldErrors?: Record<string, string[]>;
}

/**
 * Authentication Error Response DTO
 *
 * Specialized error response for authentication failures.
 * Extends the base error response with auth-specific fields.
 */
export class AuthErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Authentication error type',
    example: 'INVALID_CREDENTIALS',
    enum: [
      'INVALID_CREDENTIALS',
      'TOKEN_EXPIRED',
      'TOKEN_INVALID',
      'ACCOUNT_LOCKED',
      'ACCOUNT_INACTIVE',
      'INSUFFICIENT_PERMISSIONS',
    ],
  })
  authErrorType: string;

  @ApiProperty({
    description: 'Number of remaining login attempts (if applicable)',
    example: 2,
    required: false,
  })
  remainingAttempts?: number;

  @ApiProperty({
    description: 'Account lockout duration in seconds (if applicable)',
    example: 300,
    required: false,
  })
  lockoutDuration?: number;
}

/**
 * Rate Limit Error Response DTO
 *
 * Specialized error response for rate limiting.
 * Extends the base error response with rate limit-specific fields.
 */
export class RateLimitErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Rate limit type',
    example: 'LOGIN_ATTEMPTS',
  })
  rateLimitType: string;

  @ApiProperty({
    description: 'Time until rate limit resets (in seconds)',
    example: 300,
  })
  retryAfter: number;

  @ApiProperty({
    description: 'Maximum number of requests allowed',
    example: 5,
  })
  limit: number;

  @ApiProperty({
    description: 'Number of requests remaining',
    example: 0,
  })
  remaining: number;
}

/**
 * Not Found Error Response DTO
 *
 * Specialized error response for resource not found errors.
 * Extends the base error response with resource-specific fields.
 */
export class NotFoundErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Type of resource that was not found',
    example: 'USER',
  })
  resourceType: string;

  @ApiProperty({
    description: 'Identifier of the resource that was not found',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  resourceId: string;
}

/**
 * Conflict Error Response DTO
 *
 * Specialized error response for resource conflicts.
 * Extends the base error response with conflict-specific fields.
 */
export class ConflictErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Type of conflict',
    example: 'DUPLICATE_EMAIL',
    enum: ['DUPLICATE_EMAIL', 'DUPLICATE_USERNAME', 'RESOURCE_CONFLICT'],
  })
  conflictType: string;

  @ApiProperty({
    description: 'Field that caused the conflict',
    example: 'email',
  })
  conflictField: string;

  @ApiProperty({
    description: 'Value that caused the conflict',
    example: 'user@example.com',
  })
  conflictValue: string;
}

/**
 * Error Response Factory
 *
 * Utility class for creating standardized error responses.
 */
export class ErrorResponseFactory {
  /**
   * Create a basic error response
   */
  static createBasicError(
    statusCode: number,
    message: string,
    error: string,
    path: string,
    correlationId?: string,
    details?: string[],
  ): ErrorResponseDto {
    return {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path,
      correlationId,
      details,
    };
  }

  /**
   * Create a validation error response
   */
  static createValidationError(
    message: string,
    path: string,
    fieldErrors?: Record<string, string[]>,
    correlationId?: string,
  ): ValidationErrorResponseDto {
    return {
      statusCode: 400,
      message,
      error: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString(),
      path,
      correlationId,
      fieldErrors,
    };
  }

  /**
   * Create an authentication error response
   */
  static createAuthError(
    message: string,
    authErrorType: string,
    path: string,
    correlationId?: string,
    remainingAttempts?: number,
    lockoutDuration?: number,
  ): AuthErrorResponseDto {
    return {
      statusCode: 401,
      message,
      error: 'AUTHENTICATION_ERROR',
      authErrorType,
      timestamp: new Date().toISOString(),
      path,
      correlationId,
      remainingAttempts,
      lockoutDuration,
    };
  }

  /**
   * Create a rate limit error response
   */
  static createRateLimitError(
    message: string,
    rateLimitType: string,
    retryAfter: number,
    limit: number,
    remaining: number,
    path: string,
    correlationId?: string,
  ): RateLimitErrorResponseDto {
    return {
      statusCode: 429,
      message,
      error: 'RATE_LIMIT_EXCEEDED',
      rateLimitType,
      retryAfter,
      limit,
      remaining,
      timestamp: new Date().toISOString(),
      path,
      correlationId,
    };
  }
}

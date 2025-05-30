import { GraphQLError } from 'graphql';
import { ApolloServerErrorCode } from '@apollo/server/errors';

/**
 * GraphQL Error Codes
 * 
 * Standardized error codes for GraphQL operations
 */
export enum GraphQLErrorCode {
  // Authentication and Authorization
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  FORBIDDEN = 'FORBIDDEN',
  
  // Validation
  BAD_USER_INPUT = 'BAD_USER_INPUT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Not Found
  NOT_FOUND = 'NOT_FOUND',
  
  // Business Logic
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  CONFLICT = 'CONFLICT',
  
  // Internal
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  
  // Rate Limiting
  RATE_LIMITED = 'RATE_LIMITED',
}

/**
 * Base GraphQL Error
 * 
 * Base class for all custom GraphQL errors with standardized structure
 */
export abstract class BaseGraphQLError extends GraphQLError {
  constructor(
    message: string,
    code: GraphQLErrorCode,
    extensions?: Record<string, any>,
  ) {
    super(message, {
      extensions: {
        code,
        ...extensions,
      },
    });
  }
}

/**
 * Authentication Error
 * 
 * Thrown when a user is not authenticated
 */
export class UnauthenticatedError extends BaseGraphQLError {
  constructor(message = 'You must be authenticated to perform this action') {
    super(message, GraphQLErrorCode.UNAUTHENTICATED);
  }
}

/**
 * Authorization Error
 * 
 * Thrown when a user is not authorized to perform an action
 */
export class ForbiddenError extends BaseGraphQLError {
  constructor(message = 'You are not authorized to perform this action') {
    super(message, GraphQLErrorCode.FORBIDDEN);
  }
}

/**
 * Validation Error
 * 
 * Thrown when input validation fails
 */
export class ValidationError extends BaseGraphQLError {
  constructor(
    message: string,
    field?: string,
    value?: any,
  ) {
    super(message, GraphQLErrorCode.VALIDATION_ERROR, {
      field,
      value,
    });
  }
}

/**
 * Bad User Input Error
 * 
 * Thrown when user input is malformed or invalid
 */
export class BadUserInputError extends BaseGraphQLError {
  constructor(
    message: string,
    field?: string,
  ) {
    super(message, GraphQLErrorCode.BAD_USER_INPUT, {
      field,
    });
  }
}

/**
 * Not Found Error
 * 
 * Thrown when a requested resource is not found
 */
export class NotFoundError extends BaseGraphQLError {
  constructor(
    resource: string,
    identifier?: string,
  ) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    
    super(message, GraphQLErrorCode.NOT_FOUND, {
      resource,
      identifier,
    });
  }
}

/**
 * Conflict Error
 * 
 * Thrown when there's a conflict with the current state
 */
export class ConflictError extends BaseGraphQLError {
  constructor(
    message: string,
    conflictingField?: string,
  ) {
    super(message, GraphQLErrorCode.CONFLICT, {
      conflictingField,
    });
  }
}

/**
 * Business Logic Error
 * 
 * Thrown when business rules are violated
 */
export class BusinessLogicError extends BaseGraphQLError {
  constructor(
    message: string,
    rule?: string,
  ) {
    super(message, GraphQLErrorCode.BUSINESS_LOGIC_ERROR, {
      rule,
    });
  }
}

/**
 * Rate Limited Error
 * 
 * Thrown when rate limits are exceeded
 */
export class RateLimitedError extends BaseGraphQLError {
  constructor(
    message = 'Rate limit exceeded. Please try again later.',
    retryAfter?: number,
  ) {
    super(message, GraphQLErrorCode.RATE_LIMITED, {
      retryAfter,
    });
  }
}

/**
 * Internal Server Error
 * 
 * Thrown for unexpected server errors
 */
export class InternalServerError extends BaseGraphQLError {
  constructor(
    message = 'An internal server error occurred',
    originalError?: Error,
  ) {
    super(message, GraphQLErrorCode.INTERNAL_SERVER_ERROR, {
      originalError: originalError?.message,
    });
  }
}

/**
 * Error Formatter Utility
 * 
 * Formats errors for GraphQL responses with consistent structure
 */
export class GraphQLErrorFormatter {
  /**
   * Format a GraphQL error for client response
   * 
   * @param error - The error to format
   * @param includeStackTrace - Whether to include stack trace (development only)
   * @returns Formatted error
   */
  static formatError(error: GraphQLError, includeStackTrace = false): any {
    const formattedError: any = {
      message: error.message,
      locations: error.locations,
      path: error.path,
      extensions: {
        code: error.extensions?.code || GraphQLErrorCode.INTERNAL_SERVER_ERROR,
        ...error.extensions,
      },
    };

    // Include stack trace only in development
    if (includeStackTrace && error.stack) {
      formattedError.extensions.stackTrace = error.stack;
    }

    // Don't expose internal details in production
    if (process.env.NODE_ENV === 'production') {
      // Remove sensitive information
      delete formattedError.extensions.originalError;
      
      // Replace internal server errors with generic message
      if (formattedError.extensions.code === GraphQLErrorCode.INTERNAL_SERVER_ERROR) {
        formattedError.message = 'An internal server error occurred';
      }
    }

    return formattedError;
  }

  /**
   * Convert common NestJS exceptions to GraphQL errors
   * 
   * @param error - The error to convert
   * @returns GraphQL error
   */
  static fromNestJSException(error: any): BaseGraphQLError {
    if (error.status) {
      switch (error.status) {
        case 400:
          return new BadUserInputError(error.message);
        case 401:
          return new UnauthenticatedError(error.message);
        case 403:
          return new ForbiddenError(error.message);
        case 404:
          return new NotFoundError('Resource', error.message);
        case 409:
          return new ConflictError(error.message);
        case 422:
          return new ValidationError(error.message);
        case 429:
          return new RateLimitedError(error.message);
        default:
          return new InternalServerError(error.message, error);
      }
    }

    return new InternalServerError('An unexpected error occurred', error);
  }
}

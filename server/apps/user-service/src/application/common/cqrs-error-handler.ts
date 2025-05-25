import { ErrorLoggerService } from '@app/logging';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  DomainError,
  ValidationError,
  ValueObjectError,
} from '@app/common/errors';
import {
  UserNotFoundError,
  UsernameAlreadyExistsError,
} from '../../domain/errors/user.error';

/**
 * CQRS Error Handler
 *
 * Provides standardized error handling for CQRS command and query handlers.
 * This utility ensures consistent error transformation, logging, and response
 * formatting across all handlers in the User Service.
 *
 * ## Error Handling Strategy
 *
 * The error handler follows a hierarchical approach:
 * 1. **Domain Errors**: Business logic violations (400-level responses)
 * 2. **Technical Errors**: Infrastructure failures (500-level responses)
 * 3. **Validation Errors**: Input validation failures (400-level responses)
 *
 * ## Usage Example
 *
 * ```typescript
 * @CommandHandler(CreateUserCommand)
 * export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
 *   constructor(
 *     private readonly errorHandler: CqrsErrorHandler,
 *     // ... other dependencies
 *   ) {}
 *
 *   async execute(command: CreateUserCommand): Promise<void> {
 *     return this.errorHandler.handleCommand(
 *       'CreateUserHandler',
 *       'execute',
 *       { userId: command.userId },
 *       async () => {
 *         // Command logic here
 *       }
 *     );
 *   }
 * }
 * ```
 */
export class CqrsErrorHandler {
  constructor(private readonly errorLogger: ErrorLoggerService) {}

  /**
   * Handle errors in command handlers
   *
   * Provides standardized error handling for command operations.
   * Commands typically modify state and may have side effects.
   *
   * @param handlerName - Name of the command handler
   * @param methodName - Name of the method being executed
   * @param context - Additional context for logging
   * @param operation - The command operation to execute
   * @returns The result of the operation
   */
  async handleCommand<T>(
    handlerName: string,
    methodName: string,
    context: Record<string, any>,
    operation: () => Promise<T>,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logError(error, handlerName, methodName, context, 'command');
      throw this.transformError(error);
    }
  }

  /**
   * Handle errors in query handlers
   *
   * Provides standardized error handling for query operations.
   * Queries are read-only and should not have side effects.
   *
   * @param handlerName - Name of the query handler
   * @param methodName - Name of the method being executed
   * @param context - Additional context for logging
   * @param operation - The query operation to execute
   * @returns The result of the operation
   */
  async handleQuery<T>(
    handlerName: string,
    methodName: string,
    context: Record<string, any>,
    operation: () => Promise<T>,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logError(error, handlerName, methodName, context, 'query');
      throw this.transformError(error);
    }
  }

  /**
   * Handle errors in event handlers
   *
   * Provides standardized error handling for event operations.
   * Event handlers should be resilient and not fail the entire operation.
   *
   * @param handlerName - Name of the event handler
   * @param methodName - Name of the method being executed
   * @param context - Additional context for logging
   * @param operation - The event operation to execute
   * @param suppressErrors - Whether to suppress errors (default: true)
   * @returns The result of the operation or null if suppressed
   */
  async handleEvent<T>(
    handlerName: string,
    methodName: string,
    context: Record<string, any>,
    operation: () => Promise<T>,
    suppressErrors: boolean = true,
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.logError(error, handlerName, methodName, context, 'event');

      if (suppressErrors) {
        // For event handlers, we typically don't want to fail the entire operation
        // if an event handler fails (e.g., Kafka publishing failure)
        return null;
      }

      throw this.transformError(error);
    }
  }

  /**
   * Transform domain errors to HTTP exceptions
   *
   * Maps domain-specific errors to appropriate HTTP status codes
   * while preserving error messages and context.
   *
   * @param error - The error to transform
   * @returns The transformed HTTP exception
   */
  private transformError(error: unknown): Error {
    // Handle domain-specific errors
    if (error instanceof UserNotFoundError) {
      return new NotFoundException(error.message);
    }

    if (error instanceof UsernameAlreadyExistsError) {
      return new ConflictException(error.message);
    }

    // Handle common domain errors
    if (error instanceof ValidationError || error instanceof ValueObjectError) {
      return new BadRequestException(error.message);
    }

    if (error instanceof DomainError) {
      return new BadRequestException(error.message);
    }

    // Handle NestJS HTTP exceptions (pass through)
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      'message' in error
    ) {
      return error as unknown as Error;
    }

    // Handle unknown errors
    return new InternalServerErrorException(
      'An unexpected error occurred while processing the request',
    );
  }

  /**
   * Log error with standardized format
   *
   * Provides consistent error logging across all CQRS handlers
   * with appropriate context and severity levels.
   *
   * @param error - The error to log
   * @param handlerName - Name of the handler
   * @param methodName - Name of the method
   * @param context - Additional context
   * @param operationType - Type of operation (command, query, event)
   */
  private logError(
    error: any,
    handlerName: string,
    methodName: string,
    context: Record<string, any>,
    operationType: 'command' | 'query' | 'event',
  ): void {
    const errorContext = {
      source: handlerName,
      method: methodName,
      operationType,
      ...context,
    };

    // Use structured error logging
    this.errorLogger.error(
      error instanceof Error ? error : new Error(String(error)),
      `${operationType} handler error in ${handlerName}.${methodName}`,
      errorContext,
    );
  }
}

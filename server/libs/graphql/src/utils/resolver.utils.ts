import { LoggingService, ErrorLoggerService } from '@app/logging';

/**
 * Base Resolver Utilities
 * 
 * Provides common utilities and patterns for GraphQL resolvers.
 * This class ensures consistent error handling, logging, and operation patterns
 * across all GraphQL resolvers.
 */
export abstract class BaseResolverUtils {
  protected constructor(
    protected readonly loggingService: LoggingService,
    protected readonly errorLogger: ErrorLoggerService,
  ) {}

  /**
   * Execute a resolver operation with standardized error handling and logging
   * 
   * @param operation - The operation to execute
   * @param operationName - Name of the operation for logging
   * @param context - Additional context for logging
   * @returns The result of the operation
   */
  protected async executeResolverOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    context: Record<string, any> = {},
  ): Promise<T> {
    try {
      this.loggingService.debug(
        `Executing ${operationName}`,
        operationName,
        context,
      );

      const result = await operation();

      this.loggingService.debug(
        `Successfully executed ${operationName}`,
        operationName,
        { ...context, success: true },
      );

      return result;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error executing ${operationName}`,
        {
          source: this.constructor.name,
          method: operationName,
          ...context,
        },
      );
      throw error;
    }
  }

  /**
   * Execute a query operation with standardized patterns
   * 
   * @param queryBus - The CQRS query bus
   * @param query - The query to execute
   * @param operationName - Name of the operation for logging
   * @param context - Additional context for logging
   * @returns The result of the query
   */
  protected async executeQuery<T>(
    queryBus: any,
    query: any,
    operationName: string,
    context: Record<string, any> = {},
  ): Promise<T> {
    return this.executeResolverOperation(
      () => queryBus.execute(query),
      operationName,
      context,
    );
  }

  /**
   * Execute a command operation with standardized patterns
   * 
   * @param commandBus - The CQRS command bus
   * @param command - The command to execute
   * @param operationName - Name of the operation for logging
   * @param context - Additional context for logging
   * @returns The result of the command
   */
  protected async executeCommand<T>(
    commandBus: any,
    command: any,
    operationName: string,
    context: Record<string, any> = {},
  ): Promise<T> {
    return this.executeResolverOperation(
      () => commandBus.execute(command),
      operationName,
      context,
    );
  }

  /**
   * Execute a command and then fetch the updated entity
   * 
   * This is a common pattern in GraphQL mutations where you need to return
   * the updated entity after executing a command.
   * 
   * @param commandBus - The CQRS command bus
   * @param queryBus - The CQRS query bus
   * @param command - The command to execute
   * @param fetchQuery - The query to fetch the updated entity
   * @param operationName - Name of the operation for logging
   * @param context - Additional context for logging
   * @returns The updated entity
   */
  protected async executeCommandAndFetch<T>(
    commandBus: any,
    queryBus: any,
    command: any,
    fetchQuery: any,
    operationName: string,
    context: Record<string, any> = {},
  ): Promise<T> {
    return this.executeResolverOperation(
      async () => {
        // Execute the command
        const commandResult = await commandBus.execute(command);
        
        // If command returns an ID, use it; otherwise use the fetch query as-is
        const queryToExecute = typeof commandResult === 'string' 
          ? fetchQuery(commandResult)
          : fetchQuery;
        
        // Fetch the updated entity
        return await queryBus.execute(queryToExecute);
      },
      operationName,
      context,
    );
  }

  /**
   * Validate input parameters
   * 
   * @param input - The input to validate
   * @param validationRules - Validation rules to apply
   * @param operationName - Name of the operation for logging
   */
  protected validateInput(
    input: any,
    validationRules: ValidationRule[],
    operationName: string,
  ): void {
    for (const rule of validationRules) {
      if (!rule.validate(input)) {
        this.loggingService.warn(
          `Validation failed for ${operationName}: ${rule.message}`,
          operationName,
          { input, rule: rule.name },
        );
        throw new Error(rule.message);
      }
    }
  }

  /**
   * Create pagination result
   * 
   * @param items - The items to paginate
   * @param totalCount - Total count of items
   * @param limit - Items per page
   * @param offset - Offset for pagination
   * @returns Pagination result
   */
  protected createPaginationResult<T>(
    items: T[],
    totalCount: number,
    limit?: number,
    offset?: number,
  ): PaginationResult<T> {
    return {
      nodes: items,
      totalCount,
      hasMore: limit ? items.length === limit : false,
      pageInfo: {
        hasNextPage: limit ? items.length === limit : false,
        hasPreviousPage: offset ? offset > 0 : false,
        startCursor: items.length > 0 ? '0' : null,
        endCursor: items.length > 0 ? String(items.length - 1) : null,
      },
    };
  }
}

/**
 * Validation Rule Interface
 */
export interface ValidationRule {
  name: string;
  message: string;
  validate: (input: any) => boolean;
}

/**
 * Pagination Result Interface
 */
export interface PaginationResult<T> {
  nodes: T[];
  totalCount: number;
  hasMore: boolean;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
}

/**
 * Common validation rules
 */
export const CommonValidationRules = {
  /**
   * Validate that a string is not empty
   */
  notEmpty: (fieldName: string): ValidationRule => ({
    name: 'notEmpty',
    message: `${fieldName} cannot be empty`,
    validate: (input: any) => {
      const value = input[fieldName];
      return typeof value === 'string' && value.trim().length > 0;
    },
  }),

  /**
   * Validate that a value is not null or undefined
   */
  required: (fieldName: string): ValidationRule => ({
    name: 'required',
    message: `${fieldName} is required`,
    validate: (input: any) => {
      const value = input[fieldName];
      return value !== null && value !== undefined;
    },
  }),

  /**
   * Validate that two values are not equal
   */
  notEqual: (field1: string, field2: string): ValidationRule => ({
    name: 'notEqual',
    message: `${field1} cannot be equal to ${field2}`,
    validate: (input: any) => {
      return input[field1] !== input[field2];
    },
  }),

  /**
   * Validate string length
   */
  minLength: (fieldName: string, minLength: number): ValidationRule => ({
    name: 'minLength',
    message: `${fieldName} must be at least ${minLength} characters long`,
    validate: (input: any) => {
      const value = input[fieldName];
      return typeof value === 'string' && value.length >= minLength;
    },
  }),

  /**
   * Validate string maximum length
   */
  maxLength: (fieldName: string, maxLength: number): ValidationRule => ({
    name: 'maxLength',
    message: `${fieldName} must be no more than ${maxLength} characters long`,
    validate: (input: any) => {
      const value = input[fieldName];
      return typeof value === 'string' && value.length <= maxLength;
    },
  }),
};

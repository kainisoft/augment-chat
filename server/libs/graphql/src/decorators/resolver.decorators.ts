import { applyDecorators, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Query, Mutation, ResolveField } from '@nestjs/graphql';

/**
 * GraphQL Operation Options
 */
export interface GraphQLOperationOptions {
  /**
   * Name of the GraphQL operation
   */
  name?: string;
  
  /**
   * Description of the operation
   */
  description?: string;
  
  /**
   * Whether the operation can return null
   */
  nullable?: boolean;
  
  /**
   * Deprecation reason if the operation is deprecated
   */
  deprecationReason?: string;
  
  /**
   * Guards to apply to the operation
   */
  guards?: any[];
  
  /**
   * Interceptors to apply to the operation
   */
  interceptors?: any[];
  
  /**
   * Whether to enable caching for this operation
   */
  cache?: boolean;
  
  /**
   * Cache TTL in seconds
   */
  cacheTTL?: number;
}

/**
 * Enhanced Query Decorator
 * 
 * Provides a standardized way to create GraphQL queries with common options
 */
export function StandardQuery(
  returnType: any,
  options: GraphQLOperationOptions = {},
) {
  const decorators = [
    Query(() => returnType, {
      name: options.name,
      description: options.description,
      nullable: options.nullable,
      deprecationReason: options.deprecationReason,
    }),
  ];

  if (options.guards && options.guards.length > 0) {
    decorators.push(UseGuards(...options.guards));
  }

  if (options.interceptors && options.interceptors.length > 0) {
    decorators.push(UseInterceptors(...options.interceptors));
  }

  return applyDecorators(...decorators);
}

/**
 * Enhanced Mutation Decorator
 * 
 * Provides a standardized way to create GraphQL mutations with common options
 */
export function StandardMutation(
  returnType: any,
  options: GraphQLOperationOptions = {},
) {
  const decorators = [
    Mutation(() => returnType, {
      name: options.name,
      description: options.description,
      nullable: options.nullable,
      deprecationReason: options.deprecationReason,
    }),
  ];

  if (options.guards && options.guards.length > 0) {
    decorators.push(UseGuards(...options.guards));
  }

  if (options.interceptors && options.interceptors.length > 0) {
    decorators.push(UseInterceptors(...options.interceptors));
  }

  return applyDecorators(...decorators);
}

/**
 * Enhanced ResolveField Decorator
 * 
 * Provides a standardized way to create GraphQL field resolvers with common options
 */
export function StandardResolveField(
  fieldName: string,
  returnType: any,
  options: Omit<GraphQLOperationOptions, 'name'> = {},
) {
  const decorators = [
    ResolveField(fieldName, () => returnType, {
      description: options.description,
      nullable: options.nullable,
      deprecationReason: options.deprecationReason,
    }),
  ];

  if (options.guards && options.guards.length > 0) {
    decorators.push(UseGuards(...options.guards));
  }

  if (options.interceptors && options.interceptors.length > 0) {
    decorators.push(UseInterceptors(...options.interceptors));
  }

  return applyDecorators(...decorators);
}

/**
 * Validated Args Decorator
 * 
 * Provides argument validation with better error messages
 */
export function ValidatedArgs(
  name?: string,
  validationOptions?: any,
) {
  return Args(name, validationOptions);
}

/**
 * Paginated Query Decorator
 * 
 * Standardized decorator for paginated queries
 */
export function PaginatedQuery(
  returnType: any,
  options: GraphQLOperationOptions = {},
) {
  return StandardQuery(returnType, {
    ...options,
    description: options.description || 'Get paginated results',
  });
}

/**
 * CRUD Query Decorators
 * 
 * Standardized decorators for common CRUD operations
 */
export const CRUDDecorators = {
  /**
   * Get by ID query
   */
  GetById: (returnType: any, resourceName: string) =>
    StandardQuery(returnType, {
      name: `${resourceName.toLowerCase()}`,
      description: `Get a ${resourceName.toLowerCase()} by ID`,
      nullable: true,
    }),

  /**
   * Get by field query
   */
  GetByField: (returnType: any, resourceName: string, fieldName: string) =>
    StandardQuery(returnType, {
      name: `${resourceName.toLowerCase()}By${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`,
      description: `Get a ${resourceName.toLowerCase()} by ${fieldName}`,
      nullable: true,
    }),

  /**
   * Search query
   */
  Search: (returnType: any, resourceName: string) =>
    StandardQuery(returnType, {
      name: `search${resourceName}s`,
      description: `Search for ${resourceName.toLowerCase()}s`,
    }),

  /**
   * List query
   */
  List: (returnType: any, resourceName: string) =>
    PaginatedQuery(returnType, {
      name: `${resourceName.toLowerCase()}s`,
      description: `Get a list of ${resourceName.toLowerCase()}s`,
    }),

  /**
   * Create mutation
   */
  Create: (returnType: any, resourceName: string) =>
    StandardMutation(returnType, {
      name: `create${resourceName}`,
      description: `Create a new ${resourceName.toLowerCase()}`,
    }),

  /**
   * Update mutation
   */
  Update: (returnType: any, resourceName: string) =>
    StandardMutation(returnType, {
      name: `update${resourceName}`,
      description: `Update an existing ${resourceName.toLowerCase()}`,
    }),

  /**
   * Delete mutation
   */
  Delete: (resourceName: string) =>
    StandardMutation(Boolean, {
      name: `delete${resourceName}`,
      description: `Delete a ${resourceName.toLowerCase()}`,
    }),
};

import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * GraphQL Pagination Input
 *
 * Standardized pagination input for GraphQL operations.
 * Extends the shared pagination patterns with GraphQL decorators.
 */
@InputType({ description: 'Pagination input for GraphQL queries' })
export class GraphQLPaginationInput {
  @Field(() => Int, {
    nullable: true,
    description: 'Maximum number of items to return',
    defaultValue: 10,
  })
  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  @Type(() => Number)
  limit?: number = 10;

  @Field(() => Int, {
    nullable: true,
    description: 'Number of items to skip',
    defaultValue: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Offset must be an integer' })
  @Min(0, { message: 'Offset must be at least 0' })
  @Type(() => Number)
  offset?: number = 0;
}

/**
 * GraphQL Search Pagination Input
 *
 * Extended pagination input that includes search functionality.
 */
@InputType({ description: 'Search pagination input for GraphQL queries' })
export class GraphQLSearchPaginationInput extends GraphQLPaginationInput {
  @Field(() => String, { description: 'Search term to filter results' })
  searchTerm: string;
}

/**
 * GraphQL Cursor Pagination Input
 *
 * Cursor-based pagination input for GraphQL operations.
 * Useful for real-time data and large datasets.
 */
@InputType({ description: 'Cursor-based pagination input for GraphQL queries' })
export class GraphQLCursorPaginationInput {
  @Field(() => Int, {
    nullable: true,
    description: 'Maximum number of items to return',
    defaultValue: 10,
  })
  @IsOptional()
  @IsInt({ message: 'First must be an integer' })
  @Min(1, { message: 'First must be at least 1' })
  @Max(100, { message: 'First cannot exceed 100' })
  @Type(() => Number)
  first?: number = 10;

  @Field(() => String, {
    nullable: true,
    description: 'Cursor to start fetching from',
  })
  @IsOptional()
  after?: string;

  @Field(() => Int, {
    nullable: true,
    description: 'Maximum number of items to return (backwards)',
  })
  @IsOptional()
  @IsInt({ message: 'Last must be an integer' })
  @Min(1, { message: 'Last must be at least 1' })
  @Max(100, { message: 'Last cannot exceed 100' })
  @Type(() => Number)
  last?: number;

  @Field(() => String, {
    nullable: true,
    description: 'Cursor to start fetching backwards from',
  })
  @IsOptional()
  before?: string;
}

/**
 * GraphQL Filter Pagination Input
 *
 * Base class for pagination inputs that include filtering.
 * Can be extended by service-specific filter inputs.
 */
@InputType({ description: 'Base filter pagination input for GraphQL queries' })
export abstract class GraphQLFilterPaginationInput extends GraphQLPaginationInput {
  // This class can be extended by services to add specific filters
  // while maintaining consistent pagination behavior
}

import { Field, ObjectType, Int } from '@nestjs/graphql';

/**
 * GraphQL Page Info
 *
 * Standard page information for GraphQL pagination responses.
 */
@ObjectType({ description: 'Page information for pagination' })
export class GraphQLPageInfo {
  @Field(() => Boolean, {
    description: 'Whether there are more items available',
  })
  hasNextPage: boolean;

  @Field(() => Boolean, {
    description: 'Whether there are previous items available',
  })
  hasPreviousPage: boolean;

  @Field(() => String, {
    nullable: true,
    description: 'Cursor for the first item in the current page',
  })
  startCursor?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Cursor for the last item in the current page',
  })
  endCursor?: string;

  @Field(() => Int, {
    description: 'Total number of items available',
  })
  totalCount: number;

  @Field(() => Int, {
    description: 'Current page number (1-based)',
  })
  currentPage: number;

  @Field(() => Int, {
    description: 'Total number of pages',
  })
  totalPages: number;
}

/**
 * GraphQL Connection Interface
 *
 * Base interface for GraphQL connection responses.
 * Follows the Relay Connection specification.
 */
export interface GraphQLConnection<T> {
  edges: GraphQLEdge<T>[];
  pageInfo: GraphQLPageInfo;
  totalCount: number;
}

/**
 * GraphQL Edge Interface
 *
 * Represents an edge in a GraphQL connection.
 */
export interface GraphQLEdge<T> {
  node: T;
  cursor: string;
}

/**
 * GraphQL List Response
 *
 * Simplified list response for GraphQL operations.
 * Alternative to full connection pattern for simpler use cases.
 */
@ObjectType({ description: 'List response with pagination information' })
export abstract class GraphQLListResponse<T> {
  @Field(() => [Object], { description: 'List of items' })
  abstract items: T[];

  @Field(() => Int, { description: 'Total number of items' })
  totalCount: number;

  @Field(() => Int, { description: 'Number of items returned' })
  count: number;

  @Field(() => Boolean, { description: 'Whether there are more items' })
  hasMore: boolean;

  @Field(() => Int, { description: 'Current offset' })
  offset: number;

  @Field(() => Int, { description: 'Limit used for this query' })
  limit: number;
}

/**
 * GraphQL Search Response
 *
 * Response type for search operations with pagination.
 */
@ObjectType({ description: 'Search response with pagination information' })
export abstract class GraphQLSearchResponse<T> extends GraphQLListResponse<T> {
  @Field(() => String, { description: 'Search term used' })
  searchTerm: string;

  @Field(() => Int, { description: 'Time taken for search in milliseconds' })
  searchTime: number;
}

/**
 * Create GraphQL Connection Response
 *
 * Utility function to create a standardized connection response.
 */
export function createGraphQLConnection<T>(
  items: T[],
  totalCount: number,
  limit: number,
  offset: number,
  getCursor: (item: T, index: number) => string,
): GraphQLConnection<T> {
  const edges: GraphQLEdge<T>[] = items.map((item, index) => ({
    node: item,
    cursor: getCursor(item, offset + index),
  }));

  const hasNextPage = offset + limit < totalCount;
  const hasPreviousPage = offset > 0;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit);

  const pageInfo: GraphQLPageInfo = {
    hasNextPage,
    hasPreviousPage,
    startCursor: edges.length > 0 ? edges[0].cursor : undefined,
    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
    totalCount,
    currentPage,
    totalPages,
  };

  return {
    edges,
    pageInfo,
    totalCount,
  };
}

/**
 * Create GraphQL List Response
 *
 * Utility function to create a standardized list response.
 */
export function createGraphQLListResponse<T>(
  items: T[],
  totalCount: number,
  limit: number,
  offset: number,
): Omit<GraphQLListResponse<T>, 'items'> {
  const count = items.length;
  const hasMore = offset + limit < totalCount;

  return {
    totalCount,
    count,
    hasMore,
    offset,
    limit,
  };
}

/**
 * Create GraphQL Search Response
 *
 * Utility function to create a standardized search response.
 */
export function createGraphQLSearchResponse<T>(
  items: T[],
  totalCount: number,
  limit: number,
  offset: number,
  searchTerm: string,
  searchTime: number,
): Omit<GraphQLSearchResponse<T>, 'items'> {
  const listResponse = createGraphQLListResponse(items, totalCount, limit, offset);

  return {
    ...listResponse,
    searchTerm,
    searchTime,
  };
}

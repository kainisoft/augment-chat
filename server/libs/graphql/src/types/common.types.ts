import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';

/**
 * Page Info Type
 * 
 * Standard pagination information following GraphQL Cursor Connections Specification
 */
@ObjectType({
  description: 'Information about pagination in a connection',
})
export class PageInfo {
  @Field(() => Boolean, {
    description: 'Whether there are more items when paginating forward',
  })
  hasNextPage: boolean;

  @Field(() => Boolean, {
    description: 'Whether there are more items when paginating backward',
  })
  hasPreviousPage: boolean;

  @Field(() => String, {
    nullable: true,
    description: 'The cursor corresponding to the first item in the page',
  })
  startCursor?: string;

  @Field(() => String, {
    nullable: true,
    description: 'The cursor corresponding to the last item in the page',
  })
  endCursor?: string;
}

/**
 * Connection Interface
 * 
 * Base interface for GraphQL connections
 */
export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

/**
 * Edge Interface
 * 
 * Base interface for GraphQL edges
 */
export interface Edge<T> {
  node: T;
  cursor: string;
}

/**
 * Pagination Input
 * 
 * Standard input for pagination arguments
 */
@InputType({
  description: 'Input for pagination arguments',
})
export class PaginationInput {
  @Field(() => Int, {
    nullable: true,
    description: 'Number of items to return (max 100)',
    defaultValue: 10,
  })
  first?: number;

  @Field(() => String, {
    nullable: true,
    description: 'Cursor to start pagination from',
  })
  after?: string;

  @Field(() => Int, {
    nullable: true,
    description: 'Number of items to return from the end (max 100)',
  })
  last?: number;

  @Field(() => String, {
    nullable: true,
    description: 'Cursor to end pagination at',
  })
  before?: string;
}

/**
 * Sort Direction Enum
 */
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Sort Input
 * 
 * Standard input for sorting
 */
@InputType({
  description: 'Input for sorting results',
})
export class SortInput {
  @Field(() => String, {
    description: 'Field to sort by',
  })
  field: string;

  @Field(() => String, {
    description: 'Sort direction (ASC or DESC)',
    defaultValue: SortDirection.ASC,
  })
  direction: SortDirection;
}

/**
 * Filter Input
 * 
 * Base input for filtering
 */
@InputType({
  description: 'Base input for filtering results',
})
export class FilterInput {
  @Field(() => String, {
    nullable: true,
    description: 'Search term to filter by',
  })
  search?: string;
}

/**
 * Success Response
 * 
 * Standard response for operations that don't return data
 */
@ObjectType({
  description: 'Standard success response',
})
export class SuccessResponse {
  @Field(() => Boolean, {
    description: 'Whether the operation was successful',
  })
  success: boolean;

  @Field(() => String, {
    nullable: true,
    description: 'Optional message about the operation',
  })
  message?: string;
}

/**
 * ID Input
 * 
 * Standard input for ID-based operations
 */
@InputType({
  description: 'Input containing an ID',
})
export class IdInput {
  @Field(() => String, {
    description: 'The ID of the resource',
  })
  id: string;
}

/**
 * Date Range Input
 * 
 * Input for date range filtering
 */
@InputType({
  description: 'Input for date range filtering',
})
export class DateRangeInput {
  @Field(() => Date, {
    nullable: true,
    description: 'Start date for the range',
  })
  from?: Date;

  @Field(() => Date, {
    nullable: true,
    description: 'End date for the range',
  })
  to?: Date;
}

/**
 * Utility function to create a Connection type
 * 
 * @param nodeType - The type of the nodes in the connection
 * @param name - The name of the connection type
 * @returns Connection type class
 */
export function createConnectionType<T>(
  nodeType: new () => T,
  name: string,
): any {
  @ObjectType(`${name}Edge`, {
    description: `An edge in the ${name} connection`,
  })
  class EdgeType {
    @Field(() => nodeType, {
      description: 'The item at the end of the edge',
    })
    node: T;

    @Field(() => String, {
      description: 'A cursor for use in pagination',
    })
    cursor: string;
  }

  @ObjectType(`${name}Connection`, {
    description: `A connection to a list of ${name} items`,
  })
  class ConnectionType {
    @Field(() => [EdgeType], {
      description: 'A list of edges',
    })
    edges: EdgeType[];

    @Field(() => PageInfo, {
      description: 'Information to aid in pagination',
    })
    pageInfo: PageInfo;

    @Field(() => Int, {
      description: 'Total number of items in the connection',
    })
    totalCount: number;
  }

  return ConnectionType;
}

/**
 * Utility function to create pagination result
 * 
 * @param items - The items to paginate
 * @param totalCount - Total count of items
 * @param args - Pagination arguments
 * @returns Pagination result
 */
export function createPaginationResult<T>(
  items: T[],
  totalCount: number,
  args: PaginationInput,
): Connection<T> {
  const edges = items.map((item, index) => ({
    node: item,
    cursor: Buffer.from(`${index}`).toString('base64'),
  }));

  const hasNextPage = args.first ? items.length === args.first : false;
  const hasPreviousPage = args.after ? true : false;

  return {
    edges,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    },
    totalCount,
  };
}

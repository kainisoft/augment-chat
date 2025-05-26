import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * List Response DTO
 *
 * Standardized response format for list operations across all REST APIs.
 * Provides consistent pagination and metadata information.
 */
export class ListResponseDto<T> {
  @ApiProperty({
    description: 'Array of items',
    isArray: true,
  })
  items: T[];

  @ApiProperty({
    description: 'Total number of items available',
    example: 100,
  })
  totalCount: number;

  @ApiProperty({
    description: 'Number of items returned in this response',
    example: 10,
  })
  count: number;

  @ApiProperty({
    description: 'Whether there are more items available',
    example: true,
  })
  hasMore: boolean;

  @ApiProperty({
    description: 'Current offset (number of items skipped)',
    example: 0,
  })
  offset: number;

  @ApiProperty({
    description: 'Limit used for this query',
    example: 10,
  })
  limit: number;

  /**
   * Create a new list response
   *
   * @param items - Array of items
   * @param totalCount - Total number of items available
   * @param limit - Limit used for the query
   * @param offset - Offset used for the query
   * @returns List response DTO
   */
  static create<T>(
    items: T[],
    totalCount: number,
    limit: number,
    offset: number,
  ): ListResponseDto<T> {
    const response = new ListResponseDto<T>();
    response.items = items;
    response.totalCount = totalCount;
    response.count = items.length;
    response.hasMore = offset + limit < totalCount;
    response.offset = offset;
    response.limit = limit;
    return response;
  }
}

/**
 * Search Response DTO
 *
 * Extended list response that includes search-specific metadata.
 */
export class SearchResponseDto<T> extends ListResponseDto<T> {
  @ApiProperty({
    description: 'Search term used for the query',
    example: 'john',
  })
  searchTerm: string;

  @ApiProperty({
    description: 'Time taken for the search in milliseconds',
    example: 45,
  })
  searchTime: number;

  /**
   * Create a new search response
   *
   * @param items - Array of items
   * @param totalCount - Total number of items available
   * @param limit - Limit used for the query
   * @param offset - Offset used for the query
   * @param searchTerm - Search term used
   * @param searchTime - Time taken for search in milliseconds
   * @returns Search response DTO
   */
  static createSearch<T>(
    items: T[],
    totalCount: number,
    limit: number,
    offset: number,
    searchTerm: string,
    searchTime: number,
  ): SearchResponseDto<T> {
    const response = new SearchResponseDto<T>();
    response.items = items;
    response.totalCount = totalCount;
    response.count = items.length;
    response.hasMore = offset + limit < totalCount;
    response.offset = offset;
    response.limit = limit;
    response.searchTerm = searchTerm;
    response.searchTime = searchTime;
    return response;
  }
}

/**
 * History Response DTO
 *
 * Specialized list response for historical data with time-based metadata.
 */
export class HistoryResponseDto<T> extends ListResponseDto<T> {
  @ApiProperty({
    description: 'Start date for the history query',
    example: '2023-01-01T00:00:00.000Z',
  })
  startDate?: string;

  @ApiProperty({
    description: 'End date for the history query',
    example: '2023-12-31T23:59:59.999Z',
  })
  endDate?: string;

  @ApiProperty({
    description: 'Time period covered by this response',
    example: 'last_30_days',
  })
  period?: string;

  /**
   * Create a new history response
   *
   * @param items - Array of items
   * @param totalCount - Total number of items available
   * @param limit - Limit used for the query
   * @param offset - Offset used for the query
   * @param startDate - Start date for the query
   * @param endDate - End date for the query
   * @param period - Time period description
   * @returns History response DTO
   */
  static create<T>(
    items: T[],
    totalCount: number,
    limit: number,
    offset: number,
    startDate?: string,
    endDate?: string,
    period?: string,
  ): HistoryResponseDto<T> {
    const response = new HistoryResponseDto<T>();
    response.items = items;
    response.totalCount = totalCount;
    response.count = items.length;
    response.hasMore = offset + limit < totalCount;
    response.offset = offset;
    response.limit = limit;
    response.startDate = startDate;
    response.endDate = endDate;
    response.period = period;
    return response;
  }
}

/**
 * Paginated Response Metadata
 *
 * Utility interface for pagination metadata.
 */
export interface PaginationMetadata {
  totalCount: number;
  count: number;
  hasMore: boolean;
  offset: number;
  limit: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Create Pagination Metadata
 *
 * Utility function to create pagination metadata.
 */
export function createPaginationMetadata(
  totalCount: number,
  limit: number,
  offset: number,
  itemCount: number,
): PaginationMetadata {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit);
  const hasMore = offset + limit < totalCount;

  return {
    totalCount,
    count: itemCount,
    hasMore,
    offset,
    limit,
    currentPage,
    totalPages,
  };
}

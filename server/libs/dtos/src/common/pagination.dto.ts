import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';

/**
 * Pagination Query DTO
 *
 * Data Transfer Object for pagination parameters.
 * Used across all services that implement pagination.
 */
export class PaginationQueryDto {
  @ApiProperty({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;

  @ApiProperty({
    description: 'Search query string',
    example: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Sort field',
    example: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * Pagination Metadata DTO
 *
 * Data Transfer Object for pagination metadata.
 * Used in paginated responses across all services.
 */
export class PaginationMetaDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrev: boolean;
}

/**
 * Paginated Response DTO
 *
 * Generic Data Transfer Object for paginated responses.
 * Used across all services that return paginated data.
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items for the current page',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;

  constructor(data: T[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}

/**
 * Utility class for creating pagination metadata
 */
export class PaginationHelper {
  /**
   * Create pagination metadata
   *
   * @param page - Current page number
   * @param limit - Items per page
   * @param total - Total number of items
   * @returns Pagination metadata
   */
  static createMeta(page: number, limit: number, total: number): PaginationMetaDto {
    const totalPages = Math.ceil(total / limit);
    
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Calculate offset for database queries
   *
   * @param page - Current page number
   * @param limit - Items per page
   * @returns Offset value
   */
  static calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Create a paginated response
   *
   * @param data - Array of items
   * @param page - Current page number
   * @param limit - Items per page
   * @param total - Total number of items
   * @returns Paginated response
   */
  static createResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
  ): PaginatedResponseDto<T> {
    const meta = this.createMeta(page, limit, total);
    return new PaginatedResponseDto(data, meta);
  }
}

import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { LogLevel } from '../../kafka/log-message.interface';
import { PaginationQueryDto } from '@app/dtos/common/pagination.dto';
import { SearchResponseDto } from '@app/dtos/common/list-response.dto';
import { IsISODateField, IsValidDateRange } from '@app/validation';

/**
 * DTO for log query requests
 *
 * Extends the shared pagination query DTO for consistent pagination behavior.
 */
export class LogQueryDto extends PaginationQueryDto {
  /**
   * Service name to filter logs by
   * @example "auth-service"
   */
  @IsOptional()
  @IsString({ message: 'Service must be a string' })
  @Transform(({ value }: { value: string }) => value?.trim())
  service?: string;

  /**
   * Log level to filter logs by
   * @example "error"
   */
  @IsOptional()
  @IsEnum(LogLevel, {
    message: `Log level must be one of: ${Object.values(LogLevel).join(', ')}`,
  })
  @Transform(({ value }: { value: string }) => value?.toLowerCase())
  level?: LogLevel;

  /**
   * Start timestamp for log query (ISO format)
   */
  @IsISODateField({
    description: 'Start timestamp for log query (ISO format)',
    example: '2023-07-19T00:00:00.000Z',
  })
  from?: string;

  /**
   * End timestamp for log query (ISO format)
   */
  @IsISODateField({
    description: 'End timestamp for log query (ISO format)',
    example: '2023-07-19T23:59:59.999Z',
  })
  @IsValidDateRange('from', 'to')
  to?: string;

  /**
   * Text query to search for in log messages
   * @example "login failed"
   */
  @IsOptional()
  @IsString({ message: 'Query must be a string' })
  @Transform(({ value }: { value: string }) => value?.trim())
  query?: string;

  // limit and offset are inherited from PaginationQueryDto with proper validation
}

/**
 * DTO for log query response
 *
 * Extends the shared search response DTO for consistent pagination behavior.
 */
export class LogQueryResponseDto extends SearchResponseDto<
  Record<string, any>
> {
  /**
   * Create a new log query response
   * @param logs Array of log messages
   * @param total Total number of logs matching the query
   * @param limit Maximum number of logs returned
   * @param offset Number of logs skipped
   * @param searchTerm Search term used (optional)
   * @param searchTime Time taken for search in milliseconds
   * @returns Log query response
   */
  static createLogResponse(
    logs: Record<string, any>[],
    total: number,
    limit: number,
    offset: number,
    searchTerm?: string,
    searchTime: number = 0,
  ): LogQueryResponseDto {
    return SearchResponseDto.createSearch(
      logs,
      total,
      limit,
      offset,
      searchTerm || '',
      searchTime,
    ) as LogQueryResponseDto;
  }
}

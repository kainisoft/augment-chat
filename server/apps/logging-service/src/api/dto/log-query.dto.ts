import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { LogLevel } from '../../kafka/log-message.interface';

/**
 * DTO for log query requests
 */
export class LogQueryDto {
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
   * @example "2023-07-19T00:00:00.000Z"
   */
  @IsOptional()
  @IsISO8601({}, { message: 'From date must be a valid ISO 8601 date string' })
  from?: string;

  /**
   * End timestamp for log query (ISO format)
   * @example "2023-07-19T23:59:59.999Z"
   */
  @IsOptional()
  @IsISO8601({}, { message: 'To date must be a valid ISO 8601 date string' })
  to?: string;

  /**
   * Text query to search for in log messages
   * @example "login failed"
   */
  @IsOptional()
  @IsString({ message: 'Query must be a string' })
  @Transform(({ value }: { value: string }) => value?.trim())
  query?: string;

  /**
   * Maximum number of logs to return
   * @example 100
   */
  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(1000, { message: 'Limit cannot exceed 1000' })
  @Type(() => Number)
  limit?: number;

  /**
   * Number of logs to skip (for pagination)
   * @example 0
   */
  @IsOptional()
  @IsInt({ message: 'Offset must be an integer' })
  @Min(0, { message: 'Offset must be at least 0' })
  @Type(() => Number)
  offset?: number;
}

/**
 * DTO for log query response
 */
export class LogQueryResponseDto {
  /**
   * Array of log messages
   */
  logs: Record<string, any>[];

  /**
   * Total number of logs matching the query
   */
  total: number;

  /**
   * Maximum number of logs returned
   */
  limit: number;

  /**
   * Number of logs skipped
   */
  offset: number;

  /**
   * Create a new log query response
   * @param logs Array of log messages
   * @param total Total number of logs matching the query
   * @param limit Maximum number of logs returned
   * @param offset Number of logs skipped
   * @returns Log query response
   */
  static create(
    logs: Record<string, any>[],
    total: number,
    limit: number,
    offset: number,
  ): LogQueryResponseDto {
    const response = new LogQueryResponseDto();
    response.logs = logs;
    response.total = total;
    response.limit = limit;
    response.offset = offset;
    return response;
  }
}

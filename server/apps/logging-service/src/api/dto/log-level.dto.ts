import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { LogLevel } from '../../kafka/log-message.interface';

/**
 * DTO for log level update requests
 */
export class LogLevelUpdateDto {
  /**
   * Service name to update log level for
   * @example "auth-service"
   */
  @IsNotEmpty({ message: 'Service name is required' })
  @IsString({ message: 'Service name must be a string' })
  @Length(2, 50, {
    message: 'Service name must be between 2 and 50 characters',
  })
  @Transform(({ value }: { value: string }) => value?.trim())
  service: string;

  /**
   * New log level to set
   * @example "debug"
   */
  @IsNotEmpty({ message: 'Log level is required' })
  @IsEnum(LogLevel, {
    message: `Log level must be one of: ${Object.values(LogLevel).join(', ')}`,
  })
  @Transform(({ value }: { value: string }) => value?.toLowerCase())
  level: LogLevel;
}

/**
 * DTO for log level update response
 */
export class LogLevelResponseDto {
  /**
   * Whether the update was successful
   */
  @IsNotEmpty()
  success: boolean;

  /**
   * Message describing the result
   */
  @IsNotEmpty()
  @IsString()
  message: string;

  /**
   * Service that was updated
   */
  @IsString()
  service?: string;

  /**
   * New log level that was set
   */
  @IsEnum(LogLevel, { each: false })
  level?: LogLevel;

  /**
   * Create a success response
   * @param message Success message
   * @param service Service name
   * @param level Log level
   * @returns Success response
   */
  static success(
    message: string,
    service?: string,
    level?: LogLevel,
  ): LogLevelResponseDto {
    const response = new LogLevelResponseDto();
    response.success = true;
    response.message = message;
    response.service = service;
    response.level = level;
    return response;
  }

  /**
   * Create an error response
   * @param message Error message
   * @returns Error response
   */
  static error(message: string): LogLevelResponseDto {
    const response = new LogLevelResponseDto();
    response.success = false;
    response.message = message;
    return response;
  }
}

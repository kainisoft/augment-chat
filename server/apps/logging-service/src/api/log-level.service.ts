import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogLevelUpdateDto, LogLevelResponseDto } from './dto/log-level.dto';
import { LogLevel } from '../kafka/log-message.interface';

/**
 * Service for managing log levels
 */
@Injectable()
export class LogLevelService {
  private readonly logger = new Logger(LogLevelService.name);

  // In-memory store for service log levels
  // In a production environment, this would be stored in a database or distributed cache
  private readonly serviceLevels = new Map<string, LogLevel>();

  constructor(private readonly configService: ConfigService) {
    // Initialize with default log level
    this.initializeDefaultLogLevels();
  }

  /**
   * Initialize default log levels from configuration
   */
  private initializeDefaultLogLevels() {
    const defaultLevel = this.configService.get<string>(
      'LOG_LEVEL',
      'info',
    ) as LogLevel;
    this.logger.log(`Initializing default log level: ${defaultLevel}`);

    // Set default level for common services
    const services = [
      'api-gateway',
      'auth-service',
      'user-service',
      'chat-service',
      'notification-service',
    ];

    for (const service of services) {
      this.serviceLevels.set(service, defaultLevel);
    }
  }

  /**
   * Update the log level for a service
   * @param updateDto The update parameters
   * @returns The result of the update
   */
  async updateLogLevel(
    updateDto: LogLevelUpdateDto,
  ): Promise<LogLevelResponseDto> {
    try {
      const { service, level } = updateDto;

      // Validate the service name
      if (!service) {
        return LogLevelResponseDto.error('Service name is required');
      }

      // Validate the log level
      if (!Object.values(LogLevel).includes(level)) {
        return LogLevelResponseDto.error(
          `Invalid log level: ${level}. Valid levels are: ${Object.values(LogLevel).join(', ')}`,
        );
      }

      // Update the log level
      this.serviceLevels.set(service, level);

      this.logger.log(`Updated log level for ${service} to ${level}`);

      return LogLevelResponseDto.success(
        `Log level for ${service} updated to ${level}`,
        service,
        level,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error updating log level: ${errorMessage}`,
        errorStack,
      );

      return LogLevelResponseDto.error(
        `Error updating log level: ${errorMessage}`,
      );
    }
  }

  /**
   * Get the log level for a service
   * @param service The service name
   * @returns The log level
   */
  getLogLevel(service: string): LogLevel {
    // Get the log level for the service, or the default level if not set
    return (
      this.serviceLevels.get(service) ||
      this.configService.get<LogLevel>('LOG_LEVEL', LogLevel.INFO)
    );
  }

  /**
   * Get all service log levels
   * @returns A map of service names to log levels
   */
  getAllLogLevels(): Record<string, LogLevel> {
    const levels: Record<string, LogLevel> = {};

    for (const [service, level] of this.serviceLevels.entries()) {
      levels[service] = level;
    }

    return levels;
  }
}

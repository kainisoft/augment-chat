import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogMessage, LogLevel } from '../kafka/log-message.interface';

/**
 * Service for filtering log messages
 */
@Injectable()
export class LogFilterService {
  private readonly logger = new Logger(LogFilterService.name);
  private readonly logLevelPriority: Record<LogLevel, number> = {
    [LogLevel.ERROR]: 0,
    [LogLevel.WARN]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.DEBUG]: 3,
    [LogLevel.VERBOSE]: 4,
  };

  constructor(private readonly configService: ConfigService) {}

  /**
   * Determine if a log message should be processed based on filtering rules
   * @param logMessage The log message to check
   * @returns Whether the log message should be processed
   */
  shouldProcessLog(logMessage: LogMessage): boolean {
    // Filter by log level
    if (!this.isLogLevelEnabled(logMessage.level)) {
      return false;
    }

    // Filter by service (if service filtering is enabled)
    if (!this.isServiceEnabled(logMessage.service)) {
      return false;
    }

    // Additional custom filters can be added here
    // For example, filtering out specific types of messages or by content

    return true;
  }

  /**
   * Check if a log level is enabled based on the configured minimum log level
   * @param level The log level to check
   * @returns Whether the log level is enabled
   */
  private isLogLevelEnabled(level: LogLevel): boolean {
    const configuredLevel = this.configService.get<string>('LOG_LEVEL', 'info');
    const configuredLevelPriority =
      this.logLevelPriority[configuredLevel as LogLevel] ?? 2; // Default to INFO
    const messageLevelPriority = this.logLevelPriority[level] ?? 2;

    // Only process logs with priority less than or equal to the configured level
    // Lower priority number means higher severity (ERROR=0, VERBOSE=4)
    return messageLevelPriority <= configuredLevelPriority;
  }

  /**
   * Check if logging for a service is enabled
   * @param service The service name to check
   * @returns Whether logging for the service is enabled
   */
  private isServiceEnabled(service: string): boolean {
    // Get list of disabled services from config (comma-separated)
    const disabledServices = this.configService
      .get<string>('DISABLED_LOG_SERVICES', '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // If the service is in the disabled list, filter it out
    if (disabledServices.includes(service)) {
      return false;
    }

    return true;
  }

  /**
   * Apply content-based filtering to log messages
   * @param logMessage The log message to filter
   * @returns Whether the log message passes content filtering
   */
  applyContentFilters(logMessage: LogMessage): boolean {
    // Example: Filter out health check logs
    if (
      logMessage.message?.includes('health check') &&
      logMessage.level === LogLevel.DEBUG
    ) {
      return false;
    }

    // Example: Filter out specific paths if they're in metadata
    if (
      logMessage.metadata?.path &&
      (logMessage.metadata.path as string).includes('/health')
    ) {
      return false;
    }

    return true;
  }
}

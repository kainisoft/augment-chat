import { ConfigService } from '@nestjs/config';
import { LogLevel } from '@app/logging';

/**
 * Service Configuration Factory
 *
 * Provides standardized configuration patterns for microservices.
 * This factory ensures consistent configuration across all services
 * while allowing for service-specific customizations.
 */
export class ServiceConfigFactory {
  /**
   * Create standardized logging configuration
   *
   * @param serviceName - Name of the service (e.g., 'user-service', 'auth-service')
   * @param configService - NestJS ConfigService instance
   * @returns Logging configuration object
   */
  static createLoggingConfig(
    serviceName: string,
    configService: ConfigService,
  ) {
    // Get log level from environment or use default
    const logLevelStr = configService.get<string>('LOG_LEVEL', 'info');
    
    // Map string to LogLevel enum
    const level = ServiceConfigFactory.mapLogLevel(logLevelStr);

    return {
      service: serviceName,
      level,
      kafka: {
        brokers: configService
          .get<string>('KAFKA_BROKERS', 'kafka:29092')
          .split(','),
        topic: configService.get<string>('KAFKA_LOGS_TOPIC', 'logs'),
        clientId: serviceName,
      },
      console: configService.get<string>('LOG_CONSOLE', 'true') === 'true',
      redactFields: ['password', 'token', 'secret', 'authorization'],
    };
  }

  /**
   * Create standardized Redis configuration
   *
   * @param servicePrefix - Service-specific prefix (e.g., 'user', 'auth')
   * @returns Redis configuration object
   */
  static createRedisConfig(servicePrefix: string) {
    return {
      isGlobal: true,
      keyPrefix: `${servicePrefix}:`,
    };
  }

  /**
   * Create standardized cache configuration
   *
   * @param servicePrefix - Service-specific prefix (e.g., 'user', 'auth')
   * @param defaultTtl - Default TTL in seconds (default: 300)
   * @returns Cache configuration object
   */
  static createCacheConfig(servicePrefix: string, defaultTtl: number = 300) {
    return {
      isGlobal: true,
      ttl: defaultTtl,
      prefix: `${servicePrefix}:cache`,
      enableLogs: process.env.CACHE_LOGS === 'true',
    };
  }

  /**
   * Create standardized session configuration
   *
   * @param servicePrefix - Service-specific prefix (e.g., 'auth')
   * @param defaultTtl - Default TTL in seconds (default: 3600)
   * @returns Session configuration object
   */
  static createSessionConfig(servicePrefix: string, defaultTtl: number = 3600) {
    return {
      isGlobal: true,
      ttl: parseInt(process.env.SESSION_TTL || defaultTtl.toString(), 10),
      prefix: `${servicePrefix}:session`,
      encrypt: process.env.SESSION_ENCRYPT === 'true',
      encryptionKey: process.env.SESSION_ENCRYPTION_KEY,
      enableLogs: process.env.SESSION_LOGS === 'true',
    };
  }

  /**
   * Map log level string to LogLevel enum
   *
   * @param logLevelStr - Log level string from environment
   * @returns LogLevel enum value
   */
  private static mapLogLevel(logLevelStr: string): LogLevel {
    switch (logLevelStr.toLowerCase()) {
      case 'error':
        return LogLevel.ERROR;
      case 'warn':
        return LogLevel.WARN;
      case 'debug':
        return LogLevel.DEBUG;
      case 'verbose':
        return LogLevel.VERBOSE;
      default:
        return LogLevel.INFO;
    }
  }
}

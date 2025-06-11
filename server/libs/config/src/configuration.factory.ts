import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DatabaseConfig,
  RedisConfig,
  KafkaConfig,
  LoggingConfig,
  SecurityConfig,
  ServiceConfig,
} from './configuration.service';

/**
 * Configuration Factory
 *
 * Provides factory methods for creating configuration objects
 * with proper defaults and validation.
 */
@Injectable()
export class ConfigurationFactory {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Create database configuration for a service
   */
  createDatabaseConfig(serviceName: string): DatabaseConfig {
    const serviceKey = serviceName.toLowerCase().replace(/\s+/g, '-');
    const dbName = `${serviceKey.replace('-', '_')}_db`;

    return {
      url: this.getDatabaseUrl(serviceKey, dbName),
      host: this.configService.get<string>('POSTGRES_HOST', 'localhost'),
      port: this.configService.get<number>('POSTGRES_PORT', 5432),
      username: this.configService.get<string>('POSTGRES_USER', 'postgres'),
      password: this.configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
      database: this.configService.get<string>(
        `${serviceKey.toUpperCase().replace('-', '_')}_DB`,
        dbName,
      ),
      poolSize: this.configService.get<number>('DATABASE_POOL_SIZE', 10),
      idleTimeout:
        this.configService.get<number>('DATABASE_IDLE_TIMEOUT', 30) * 1000,
      ssl: this.configService.get<boolean>('DATABASE_SSL', false),
    };
  }

  /**
   * Create Redis configuration for a service
   */
  createRedisConfig(serviceName: string): RedisConfig {
    const serviceKey = serviceName.toLowerCase().replace(/\s+/g, '-');

    return {
      url: this.configService.get<string>(
        'REDIS_URL',
        'redis://localhost:6379',
      ),
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      database: this.configService.get<number>('REDIS_DATABASE', 0),
      keyPrefix: `${serviceKey}:`,
      ttl: this.configService.get<number>('REDIS_TTL', 3600),
    };
  }

  /**
   * Create Kafka configuration for a service
   */
  createKafkaConfig(serviceName: string): KafkaConfig {
    const serviceKey = serviceName.toLowerCase().replace(/\s+/g, '-');

    return {
      brokers: this.configService
        .get<string>('KAFKA_BROKERS', 'kafka:29092')
        .split(','),
      clientId: `${serviceKey}-client`,
      groupId: `${serviceKey}-group`,
      retries: this.configService.get<number>('KAFKA_RETRIES', 3),
      retryDelayMs: this.configService.get<number>(
        'KAFKA_RETRY_DELAY_MS',
        1000,
      ),
      requestTimeout: this.configService.get<number>(
        'KAFKA_REQUEST_TIMEOUT',
        30000,
      ),
      connectionTimeout: this.configService.get<number>(
        'KAFKA_CONNECTION_TIMEOUT',
        10000,
      ),
    };
  }

  /**
   * Create logging configuration
   */
  createLoggingConfig(serviceName: string): LoggingConfig {
    return {
      level: this.configService.get<string>('LOG_LEVEL', 'info'),
      console: this.configService.get<boolean>('LOG_CONSOLE', true),
      file: this.configService.get<boolean>('LOG_FILE', false),
      kafka: this.configService.get<boolean>('LOG_KAFKA', true),
      redactFields: this.configService
        .get<string>('LOG_REDACT_FIELDS', 'password,token,secret,authorization')
        .split(','),
    };
  }

  /**
   * Create security configuration
   */
  createSecurityConfig(): SecurityConfig {
    return {
      jwtSecret: this.configService.get<string>(
        'JWT_SECRET',
        'change-me-in-production',
      ),
      jwtExpiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
      refreshTokenExpiresIn: this.configService.get<string>(
        'REFRESH_TOKEN_EXPIRES_IN',
        '7d',
      ),
      bcryptRounds: this.configService.get<number>('BCRYPT_ROUNDS', 12),
      rateLimitTtl: this.configService.get<number>('RATE_LIMIT_TTL', 60),
      rateLimitMax: this.configService.get<number>('RATE_LIMIT_MAX', 100),
    };
  }

  /**
   * Create service configuration
   */
  createServiceConfig(serviceName: string): ServiceConfig {
    const serviceKey = serviceName.toLowerCase().replace(/\s+/g, '-');

    return {
      name: serviceName,
      version: this.configService.get<string>('APP_VERSION', '1.0.0'),
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      port: this.getServicePort(serviceKey),
      host: this.configService.get<string>('HOST', '0.0.0.0'),
      apiPrefix: this.configService.get<string>('API_PREFIX', 'api'),
      cors: {
        enabled: this.configService.get<boolean>('CORS_ENABLED', true),
        origin: this.configService.get<string>('CORS_ORIGIN') || true,
        credentials: this.configService.get<boolean>('CORS_CREDENTIALS', true),
      },
    };
  }

  /**
   * Create complete configuration for a service
   */
  createCompleteConfig(serviceName: string) {
    return {
      service: this.createServiceConfig(serviceName),
      database: this.createDatabaseConfig(serviceName),
      redis: this.createRedisConfig(serviceName),
      kafka: this.createKafkaConfig(serviceName),
      logging: this.createLoggingConfig(serviceName),
      security: this.createSecurityConfig(),
    };
  }

  /**
   * Get service port with fallback logic
   */
  private getServicePort(serviceKey: string): number {
    const portMap: Record<string, number> = {
      'api-gateway': 4000,
      'websocket-gateway': 4001,
      'auth-service': 4002,
      'user-service': 4003,
      'chat-service': 4004,
      'notification-service': 4005,
      'logging-service': 4006,
    };

    return (
      this.configService.get<number>(
        `${serviceKey.toUpperCase().replace('-', '_')}_PORT`,
      ) ||
      this.configService.get<number>('PORT') ||
      portMap[serviceKey] ||
      4000
    );
  }

  /**
   * Get database URL with fallback logic
   */
  private getDatabaseUrl(serviceKey: string, dbName: string): string {
    const envVar = `DATABASE_URL_${serviceKey.toUpperCase().replace('-', '_')}`;

    return (
      this.configService.get<string>(envVar) ||
      this.configService.get<string>('DATABASE_URL') ||
      `postgresql://${this.configService.get<string>('POSTGRES_USER', 'postgres')}:${this.configService.get<string>('POSTGRES_PASSWORD', 'postgres')}@${this.configService.get<string>('POSTGRES_HOST', 'localhost')}:${this.configService.get<string>('POSTGRES_PORT', '5432')}/${dbName}`
    );
  }
}

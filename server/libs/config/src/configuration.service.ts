import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigModuleOptions } from './config.module';

export interface DatabaseConfig {
  url: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  poolSize: number;
  idleTimeout: number;
  ssl: boolean;
}

export interface RedisConfig {
  url: string;
  host: string;
  port: number;
  password?: string;
  database: number;
  keyPrefix: string;
  ttl: number;
}

export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  groupId: string;
  retries: number;
  retryDelayMs: number;
  requestTimeout: number;
  connectionTimeout: number;
}

export interface LoggingConfig {
  level: string;
  console: boolean;
  file: boolean;
  kafka: boolean;
  redactFields: string[];
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenExpiresIn: string;
  bcryptRounds: number;
  rateLimitTtl: number;
  rateLimitMax: number;
}

export interface ServiceConfig {
  name: string;
  version: string;
  environment: string;
  port: number;
  host: string;
  apiPrefix: string;
  cors: {
    enabled: boolean;
    origin: string | boolean;
    credentials: boolean;
  };
}

/**
 * Configuration Service
 *
 * Provides type-safe configuration management with validation
 * and standardized configuration patterns for microservices.
 */
@Injectable()
export class ConfigurationService {
  constructor(
    private readonly configService: ConfigService,
    @Inject('CONFIG_OPTIONS') private readonly options: ConfigModuleOptions,
  ) {}

  /**
   * Get service configuration
   */
  getServiceConfig(): ServiceConfig {
    return {
      name: this.options.serviceName,
      version: this.getString('APP_VERSION', '1.0.0'),
      environment: this.getString('NODE_ENV', 'development'),
      port: this.getNumber('PORT', this.getDefaultPort()),
      host: this.getString('HOST', '0.0.0.0'),
      apiPrefix: this.getString('API_PREFIX', 'api'),
      cors: {
        enabled: this.getBoolean('CORS_ENABLED', true),
        origin: this.getString('CORS_ORIGIN') || true,
        credentials: this.getBoolean('CORS_CREDENTIALS', true),
      },
    };
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig(): DatabaseConfig {
    const serviceKey = this.getServiceKey();
    const dbName = `${serviceKey}_db`;

    return {
      url: this.getDatabaseUrl(serviceKey, dbName),
      host: this.getString('POSTGRES_HOST', 'localhost'),
      port: this.getNumber('POSTGRES_PORT', 5432),
      username: this.getString('POSTGRES_USER', 'postgres'),
      password: this.getString('POSTGRES_PASSWORD', 'postgres'),
      database: this.getString(`${serviceKey.toUpperCase()}_DB`, dbName),
      poolSize: this.getNumber('DATABASE_POOL_SIZE', 10),
      idleTimeout: this.getNumber('DATABASE_IDLE_TIMEOUT', 30) * 1000,
      ssl: this.getBoolean('DATABASE_SSL', false),
    };
  }

  /**
   * Get Redis configuration
   */
  getRedisConfig(): RedisConfig {
    const serviceKey = this.getServiceKey();

    return {
      url: this.getString('REDIS_URL', 'redis://localhost:6379'),
      host: this.getString('REDIS_HOST', 'localhost'),
      port: this.getNumber('REDIS_PORT', 6379),
      password: this.getString('REDIS_PASSWORD'),
      database: this.getNumber('REDIS_DATABASE', 0),
      keyPrefix: `${serviceKey}:`,
      ttl: this.getNumber('REDIS_TTL', 3600),
    };
  }

  /**
   * Get Kafka configuration
   */
  getKafkaConfig(): KafkaConfig {
    const serviceKey = this.getServiceKey();

    return {
      brokers: this.getString('KAFKA_BROKERS', 'kafka:29092').split(','),
      clientId: `${serviceKey}-client`,
      groupId: `${serviceKey}-group`,
      retries: this.getNumber('KAFKA_RETRIES', 3),
      retryDelayMs: this.getNumber('KAFKA_RETRY_DELAY_MS', 1000),
      requestTimeout: this.getNumber('KAFKA_REQUEST_TIMEOUT', 30000),
      connectionTimeout: this.getNumber('KAFKA_CONNECTION_TIMEOUT', 10000),
    };
  }

  /**
   * Get logging configuration
   */
  getLoggingConfig(): LoggingConfig {
    return {
      level: this.getString('LOG_LEVEL', 'info'),
      console: this.getBoolean('LOG_CONSOLE', true),
      file: this.getBoolean('LOG_FILE', false),
      kafka: this.getBoolean('LOG_KAFKA', true),
      redactFields: this.getArray('LOG_REDACT_FIELDS', [
        'password',
        'token',
        'secret',
        'authorization',
      ]),
    };
  }

  /**
   * Get security configuration
   */
  getSecurityConfig(): SecurityConfig {
    return {
      jwtSecret: this.getString('JWT_SECRET', 'change-me-in-production'),
      jwtExpiresIn: this.getString('JWT_EXPIRES_IN', '15m'),
      refreshTokenExpiresIn: this.getString('REFRESH_TOKEN_EXPIRES_IN', '7d'),
      bcryptRounds: this.getNumber('BCRYPT_ROUNDS', 12),
      rateLimitTtl: this.getNumber('RATE_LIMIT_TTL', 60),
      rateLimitMax: this.getNumber('RATE_LIMIT_MAX', 100),
    };
  }

  /**
   * Get a string configuration value
   */
  getString(key: string, defaultValue?: string): string {
    return this.configService.get<string>(key) || defaultValue || '';
  }

  /**
   * Get a number configuration value
   */
  getNumber(key: string, defaultValue?: number): number {
    const value = this.configService.get<string>(key);
    if (value) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? (defaultValue || 0) : parsed;
    }
    return defaultValue || 0;
  }

  /**
   * Get a boolean configuration value
   */
  getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = this.configService.get<string>(key);
    if (value) {
      return value.toLowerCase() === 'true';
    }
    return defaultValue || false;
  }

  /**
   * Get an array configuration value
   */
  getArray(key: string, defaultValue?: string[]): string[] {
    const value = this.configService.get<string>(key);
    if (value) {
      return value.split(',').map(item => item.trim());
    }
    return defaultValue || [];
  }

  /**
   * Get service key for configuration
   */
  private getServiceKey(): string {
    return this.options.serviceName.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Get default port based on service name
   */
  private getDefaultPort(): number {
    const portMap: Record<string, number> = {
      'api-gateway': 4000,
      'auth-service': 4001,
      'user-service': 4002,
      'chat-service': 4003,
      'notification-service': 4004,
      'logging-service': 4005,
    };

    return portMap[this.getServiceKey()] || 4000;
  }

  /**
   * Get database URL with fallback logic
   */
  private getDatabaseUrl(serviceKey: string, dbName: string): string {
    const envVar = `DATABASE_URL_${serviceKey.toUpperCase().replace('-', '_')}`;

    return (
      this.getString(envVar) ||
      this.getString('DATABASE_URL') ||
      `postgresql://${this.getString('POSTGRES_USER', 'postgres')}:${this.getString('POSTGRES_PASSWORD', 'postgres')}@${this.getString('POSTGRES_HOST', 'localhost')}:${this.getString('POSTGRES_PORT', '5432')}/${dbName}`
    );
  }
}

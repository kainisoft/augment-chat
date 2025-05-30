import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ServiceConfiguration {
  serviceName: string;
  port: number;
  host: string;
  environment: string;
  version: string;
  apiPrefix: string;
  cors: {
    enabled: boolean;
    origin: string | boolean;
    credentials: boolean;
  };
  validation: {
    enabled: boolean;
    transform: boolean;
    whitelist: boolean;
    forbidNonWhitelisted: boolean;
  };
  logging: {
    level: string;
    console: boolean;
    kafka: {
      enabled: boolean;
      brokers: string[];
      topic: string;
    };
  };
  database: {
    url: string;
    poolSize: number;
    idleTimeout: number;
  };
  redis: {
    url: string;
    keyPrefix: string;
  };
  kafka: {
    brokers: string[];
    clientId: string;
    groupId: string;
  };
}

/**
 * Service Configuration Service
 *
 * Provides standardized configuration management for microservices.
 * Centralizes environment variable handling and default values.
 */
@Injectable()
export class ServiceConfigurationService {
  constructor(private readonly configService?: ConfigService) {}

  /**
   * Get complete service configuration
   */
  getServiceConfiguration(serviceName: string): ServiceConfiguration {
    const serviceKey = serviceName.toLowerCase().replace(/\s+/g, '-');

    return {
      serviceName,
      port: this.getPort(serviceKey),
      host: this.getHost(),
      environment: this.getEnvironment(),
      version: this.getVersion(),
      apiPrefix: this.getApiPrefix(),
      cors: this.getCorsConfiguration(),
      validation: this.getValidationConfiguration(),
      logging: this.getLoggingConfiguration(serviceName),
      database: this.getDatabaseConfiguration(serviceKey),
      redis: this.getRedisConfiguration(serviceKey),
      kafka: this.getKafkaConfiguration(serviceName),
    };
  }

  /**
   * Get service port with fallback logic
   */
  private getPort(serviceKey: string): number {
    const portMap: Record<string, number> = {
      'api-gateway': 4000,
      'auth-service': 4001,
      'user-service': 4002,
      'chat-service': 4003,
      'notification-service': 4004,
      'logging-service': 4005,
    };

    return (
      this.getNumber(`${serviceKey.toUpperCase().replace('-', '_')}_PORT`) ||
      this.getNumber('PORT') ||
      portMap[serviceKey] ||
      4000
    );
  }

  /**
   * Get host configuration
   */
  private getHost(): string {
    return this.getString('HOST', '0.0.0.0');
  }

  /**
   * Get environment
   */
  private getEnvironment(): string {
    return this.getString('NODE_ENV', 'development');
  }

  /**
   * Get application version
   */
  private getVersion(): string {
    return this.getString('APP_VERSION', '1.0.0');
  }

  /**
   * Get API prefix
   */
  private getApiPrefix(): string {
    return this.getString('API_PREFIX', 'api');
  }

  /**
   * Get CORS configuration
   */
  private getCorsConfiguration() {
    return {
      enabled: this.getBoolean('CORS_ENABLED', true),
      origin: this.getString('CORS_ORIGIN') || true,
      credentials: this.getBoolean('CORS_CREDENTIALS', true),
    };
  }

  /**
   * Get validation configuration
   */
  private getValidationConfiguration() {
    return {
      enabled: this.getBoolean('VALIDATION_ENABLED', true),
      transform: this.getBoolean('VALIDATION_TRANSFORM', true),
      whitelist: this.getBoolean('VALIDATION_WHITELIST', true),
      forbidNonWhitelisted: this.getBoolean(
        'VALIDATION_FORBID_NON_WHITELISTED',
        true,
      ),
    };
  }

  /**
   * Get logging configuration
   */
  private getLoggingConfiguration(serviceName: string) {
    return {
      level: this.getString('LOG_LEVEL', 'info'),
      console: this.getBoolean('LOG_CONSOLE', true),
      kafka: {
        enabled: this.getBoolean('LOG_KAFKA_ENABLED', true),
        brokers: this.getString('KAFKA_BROKERS', 'kafka:29092').split(','),
        topic: this.getString('KAFKA_LOGS_TOPIC', 'logs'),
      },
    };
  }

  /**
   * Get database configuration
   */
  private getDatabaseConfiguration(serviceKey: string) {
    const dbName = `${serviceKey.replace('-', '_')}_db`;

    return {
      url: this.getDatabaseUrl(serviceKey, dbName),
      poolSize: this.getNumber('DATABASE_POOL_SIZE', 10),
      idleTimeout: this.getNumber('DATABASE_IDLE_TIMEOUT', 30) * 1000,
    };
  }

  /**
   * Get Redis configuration
   */
  private getRedisConfiguration(serviceKey: string) {
    return {
      url: this.getString('REDIS_URL', 'redis://localhost:6379'),
      keyPrefix: `${serviceKey}:`,
    };
  }

  /**
   * Get Kafka configuration
   */
  private getKafkaConfiguration(serviceName: string) {
    const serviceKey = serviceName.toLowerCase().replace(/\s+/g, '-');

    return {
      brokers: this.getString('KAFKA_BROKERS', 'kafka:29092').split(','),
      clientId: `${serviceKey}-client`,
      groupId: `${serviceKey}-group`,
    };
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

  /**
   * Helper method to get string values
   */
  private getString(key: string, defaultValue?: string): string {
    if (this.configService) {
      return this.configService.get<string>(key) || defaultValue || '';
    }
    return process.env[key] || defaultValue || '';
  }

  /**
   * Helper method to get number values
   */
  private getNumber(key: string, defaultValue?: number): number {
    const value = this.getString(key);
    if (value) {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? (defaultValue || 0) : parsed;
    }
    return defaultValue || 0;
  }

  /**
   * Helper method to get boolean values
   */
  private getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = this.getString(key);
    if (value) {
      return value.toLowerCase() === 'true';
    }
    return defaultValue || false;
  }
}

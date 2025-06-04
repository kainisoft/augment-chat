import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ValidationRule {
  key: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'array' | 'url' | 'email';
  pattern?: RegExp;
  min?: number;
  max?: number;
  allowedValues?: string[];
  description?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Environment Validation Service
 *
 * Provides validation for environment variables and configuration
 * to ensure proper service startup and configuration.
 */
@Injectable()
export class EnvironmentValidationService {
  private readonly logger = new Logger(EnvironmentValidationService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Validate environment variables against rules
   */
  validate(rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of rules) {
      const value = this.configService.get<string>(rule.key);
      const result = this.validateRule(rule, value);

      if (result.error) {
        if (rule.required) {
          errors.push(result.error);
        } else {
          warnings.push(result.error);
        }
      }
    }

    const isValid = errors.length === 0;

    if (!isValid) {
      this.logger.error('Environment validation failed:', errors);
    }

    if (warnings.length > 0) {
      this.logger.warn('Environment validation warnings:', warnings);
    }

    return { isValid, errors, warnings };
  }

  /**
   * Get common validation rules for microservices
   */
  getCommonRules(): ValidationRule[] {
    return [
      {
        key: 'NODE_ENV',
        required: true,
        type: 'string',
        allowedValues: ['development', 'production', 'test'],
        description: 'Application environment',
      },
      {
        key: 'PORT',
        required: false,
        type: 'number',
        min: 1000,
        max: 65535,
        description: 'Service port number',
      },
      {
        key: 'DATABASE_URL',
        required: false,
        type: 'url',
        pattern: /^postgresql:\/\/.+/,
        description: 'PostgreSQL database connection URL',
      },
      {
        key: 'REDIS_URL',
        required: false,
        type: 'url',
        pattern: /^redis:\/\/.+/,
        description: 'Redis connection URL',
      },
      {
        key: 'KAFKA_BROKERS',
        required: false,
        type: 'array',
        description: 'Kafka broker addresses',
      },
      {
        key: 'JWT_SECRET',
        required: true,
        type: 'string',
        min: 32,
        description: 'JWT signing secret (minimum 32 characters)',
      },
      {
        key: 'LOG_LEVEL',
        required: false,
        type: 'string',
        allowedValues: ['error', 'warn', 'info', 'debug', 'verbose'],
        description: 'Logging level',
      },
    ];
  }

  /**
   * Get database-specific validation rules
   */
  getDatabaseRules(): ValidationRule[] {
    return [
      {
        key: 'POSTGRES_HOST',
        required: false,
        type: 'string',
        description: 'PostgreSQL host',
      },
      {
        key: 'POSTGRES_PORT',
        required: false,
        type: 'number',
        min: 1,
        max: 65535,
        description: 'PostgreSQL port',
      },
      {
        key: 'POSTGRES_USER',
        required: false,
        type: 'string',
        description: 'PostgreSQL username',
      },
      {
        key: 'POSTGRES_PASSWORD',
        required: false,
        type: 'string',
        description: 'PostgreSQL password',
      },
      {
        key: 'DATABASE_POOL_SIZE',
        required: false,
        type: 'number',
        min: 1,
        max: 100,
        description: 'Database connection pool size',
      },
    ];
  }

  /**
   * Get Redis-specific validation rules
   */
  getRedisRules(): ValidationRule[] {
    return [
      {
        key: 'REDIS_HOST',
        required: false,
        type: 'string',
        description: 'Redis host',
      },
      {
        key: 'REDIS_PORT',
        required: false,
        type: 'number',
        min: 1,
        max: 65535,
        description: 'Redis port',
      },
      {
        key: 'REDIS_PASSWORD',
        required: false,
        type: 'string',
        description: 'Redis password',
      },
    ];
  }

  /**
   * Get Kafka-specific validation rules
   */
  getKafkaRules(): ValidationRule[] {
    return [
      {
        key: 'KAFKA_BROKERS',
        required: false,
        type: 'array',
        description: 'Kafka broker addresses',
      },
      {
        key: 'KAFKA_RETRIES',
        required: false,
        type: 'number',
        min: 0,
        max: 10,
        description: 'Kafka retry attempts',
      },
    ];
  }

  /**
   * Validate a single rule
   */
  private validateRule(
    rule: ValidationRule,
    value: string | undefined,
  ): { error?: string } {
    // Check if required value is missing
    if (rule.required && (!value || value.trim() === '')) {
      return { error: `Required environment variable ${rule.key} is missing` };
    }

    // Skip validation if value is not provided and not required
    if (!value) {
      return {};
    }

    // Type validation
    switch (rule.type) {
      case 'number':
        return this.validateNumber(rule, value);
      case 'boolean':
        return this.validateBoolean(rule, value);
      case 'array':
        return this.validateArray(rule, value);
      case 'url':
        return this.validateUrl(rule, value);
      case 'email':
        return this.validateEmail(rule, value);
      case 'string':
      default:
        return this.validateString(rule, value);
    }
  }

  /**
   * Validate string value
   */
  private validateString(
    rule: ValidationRule,
    value: string,
  ): { error?: string } {
    if (rule.min && value.length < rule.min) {
      return {
        error: `${rule.key} must be at least ${rule.min} characters long`,
      };
    }

    if (rule.max && value.length > rule.max) {
      return {
        error: `${rule.key} must be at most ${rule.max} characters long`,
      };
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return { error: `${rule.key} does not match required pattern` };
    }

    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      return {
        error: `${rule.key} must be one of: ${rule.allowedValues.join(', ')}`,
      };
    }

    return {};
  }

  /**
   * Validate number value
   */
  private validateNumber(
    rule: ValidationRule,
    value: string,
  ): { error?: string } {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      return { error: `${rule.key} must be a valid number` };
    }

    if (rule.min && num < rule.min) {
      return { error: `${rule.key} must be at least ${rule.min}` };
    }

    if (rule.max && num > rule.max) {
      return { error: `${rule.key} must be at most ${rule.max}` };
    }

    return {};
  }

  /**
   * Validate boolean value
   */
  private validateBoolean(
    rule: ValidationRule,
    value: string,
  ): { error?: string } {
    const lowerValue = value.toLowerCase();
    if (!['true', 'false'].includes(lowerValue)) {
      return { error: `${rule.key} must be 'true' or 'false'` };
    }

    return {};
  }

  /**
   * Validate array value
   */
  private validateArray(
    rule: ValidationRule,
    value: string,
  ): { error?: string } {
    const items = value.split(',').map((item) => item.trim());

    if (rule.min && items.length < rule.min) {
      return { error: `${rule.key} must have at least ${rule.min} items` };
    }

    if (rule.max && items.length > rule.max) {
      return { error: `${rule.key} must have at most ${rule.max} items` };
    }

    return {};
  }

  /**
   * Validate URL value
   */
  private validateUrl(rule: ValidationRule, value: string): { error?: string } {
    try {
      new URL(value);
    } catch {
      return { error: `${rule.key} must be a valid URL` };
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return { error: `${rule.key} does not match required URL pattern` };
    }

    return {};
  }

  /**
   * Validate email value
   */
  private validateEmail(
    rule: ValidationRule,
    value: string,
  ): { error?: string } {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      return { error: `${rule.key} must be a valid email address` };
    }

    return {};
  }

  /**
   * Get User Service specific validation rules
   */
  getUserServiceRules(): ValidationRule[] {
    return [
      ...this.getCommonRules(),
      {
        key: 'DATABASE_URL_USER',
        required: true,
        type: 'url',
        pattern: /^postgresql:\/\/.+/,
        description: 'User service PostgreSQL database connection URL',
      },
      {
        key: 'GRAPHQL_PLAYGROUND',
        required: false,
        type: 'boolean',
        description: 'Enable GraphQL Playground',
      },
      {
        key: 'GRAPHQL_DEBUG',
        required: false,
        type: 'boolean',
        description: 'Enable GraphQL debug mode',
      },
      {
        key: 'GRAPHQL_INTROSPECTION',
        required: false,
        type: 'boolean',
        description: 'Enable GraphQL introspection',
      },
      {
        key: 'QUERY_COMPLEXITY_LIMIT',
        required: false,
        type: 'number',
        min: 100,
        max: 10000,
        description: 'GraphQL query complexity limit',
      },
      {
        key: 'QUERY_DEPTH_LIMIT',
        required: false,
        type: 'number',
        min: 5,
        max: 20,
        description: 'GraphQL query depth limit',
      },
      {
        key: 'CACHE_TTL',
        required: false,
        type: 'number',
        min: 60,
        max: 3600,
        description: 'Cache TTL in seconds',
      },
      {
        key: 'REDIS_KEY_PREFIX',
        required: false,
        type: 'string',
        pattern: /^[a-zA-Z0-9_-]+:$/,
        description: 'Redis key prefix (must end with colon)',
      },
    ];
  }

  /**
   * Get Chat Service specific validation rules
   */
  getChatServiceRules(): ValidationRule[] {
    return [
      ...this.getCommonRules(),
      {
        key: 'MONGODB_URI',
        required: true,
        type: 'url',
        pattern: /^mongodb:\/\/.+/,
        description: 'Chat service MongoDB connection URI',
      },
      {
        key: 'MONGODB_CONNECTION_POOL_SIZE',
        required: false,
        type: 'number',
        min: 1,
        max: 50,
        description: 'MongoDB connection pool size',
      },
      {
        key: 'MONGODB_CONNECTION_TIMEOUT',
        required: false,
        type: 'number',
        min: 1000,
        max: 60000,
        description: 'MongoDB connection timeout in milliseconds',
      },
      {
        key: 'MAX_MESSAGE_LENGTH',
        required: false,
        type: 'number',
        min: 1000,
        max: 50000,
        description: 'Maximum message length in characters',
      },
      {
        key: 'MESSAGE_HISTORY_LIMIT',
        required: false,
        type: 'number',
        min: 10,
        max: 1000,
        description: 'Message history limit per conversation',
      },
      {
        key: 'WS_PORT',
        required: false,
        type: 'number',
        min: 1000,
        max: 65535,
        description: 'WebSocket server port',
      },
      {
        key: 'WS_PATH',
        required: false,
        type: 'string',
        pattern: /^\/[a-zA-Z0-9_-]*$/,
        description: 'WebSocket path (must start with /)',
      },
      {
        key: 'GRAPHQL_SUBSCRIPTIONS_ENABLED',
        required: false,
        type: 'boolean',
        description: 'Enable GraphQL subscriptions',
      },
      {
        key: 'TYPING_INDICATOR_TIMEOUT',
        required: false,
        type: 'number',
        min: 1000,
        max: 10000,
        description: 'Typing indicator timeout in milliseconds',
      },
    ];
  }

  /**
   * Get Notification Service specific validation rules
   */
  getNotificationServiceRules(): ValidationRule[] {
    return [
      ...this.getCommonRules(),
      {
        key: 'MONGODB_URI',
        required: true,
        type: 'url',
        pattern: /^mongodb:\/\/.+/,
        description: 'Notification service MongoDB connection URI',
      },
      {
        key: 'EMAIL_ENABLED',
        required: false,
        type: 'boolean',
        description: 'Enable email notifications',
      },
      {
        key: 'SMS_ENABLED',
        required: false,
        type: 'boolean',
        description: 'Enable SMS notifications',
      },
      {
        key: 'PUSH_ENABLED',
        required: false,
        type: 'boolean',
        description: 'Enable push notifications',
      },
      {
        key: 'EMAIL_SMTP_HOST',
        required: false,
        type: 'string',
        description: 'SMTP server host for email notifications',
      },
      {
        key: 'EMAIL_SMTP_PORT',
        required: false,
        type: 'number',
        min: 1,
        max: 65535,
        description: 'SMTP server port',
      },
      {
        key: 'EMAIL_SMTP_USER',
        required: false,
        type: 'email',
        description: 'SMTP username (email address)',
      },
      {
        key: 'SMS_FROM_NUMBER',
        required: false,
        type: 'string',
        pattern: /^\+[1-9]\d{1,14}$/,
        description: 'SMS sender phone number (E.164 format)',
      },
      {
        key: 'NOTIFICATION_BATCH_SIZE',
        required: false,
        type: 'number',
        min: 1,
        max: 1000,
        description: 'Notification batch processing size',
      },
      {
        key: 'NOTIFICATION_RETRY_ATTEMPTS',
        required: false,
        type: 'number',
        min: 0,
        max: 10,
        description: 'Number of retry attempts for failed notifications',
      },
      {
        key: 'NOTIFICATION_RETRY_DELAY',
        required: false,
        type: 'number',
        min: 1000,
        max: 60000,
        description: 'Delay between retry attempts in milliseconds',
      },
      {
        key: 'NOTIFICATION_RATE_LIMIT_PER_USER',
        required: false,
        type: 'number',
        min: 1,
        max: 1000,
        description: 'Rate limit per user for notifications',
      },
      {
        key: 'NOTIFICATION_RATE_LIMIT_WINDOW',
        required: false,
        type: 'number',
        min: 60,
        max: 86400,
        description: 'Rate limit window in seconds',
      },
    ];
  }

  /**
   * Get Auth Service specific validation rules
   */
  getAuthServiceRules(): ValidationRule[] {
    return [
      ...this.getCommonRules(),
      {
        key: 'DATABASE_URL_AUTH',
        required: true,
        type: 'url',
        pattern: /^postgresql:\/\/.+/,
        description: 'Auth service PostgreSQL database connection URL',
      },
      {
        key: 'JWT_ACCESS_EXPIRY',
        required: false,
        type: 'number',
        min: 300,
        max: 3600,
        description: 'JWT access token expiry in seconds',
      },
      {
        key: 'JWT_REFRESH_EXPIRY',
        required: false,
        type: 'number',
        min: 86400,
        max: 2592000,
        description: 'JWT refresh token expiry in seconds',
      },
      {
        key: 'SESSION_TTL',
        required: false,
        type: 'number',
        min: 300,
        max: 86400,
        description: 'Session TTL in seconds',
      },
      {
        key: 'SESSION_ENCRYPTION_KEY',
        required: false,
        type: 'string',
        min: 32,
        description: 'Session encryption key (minimum 32 characters)',
      },
      {
        key: 'AUTH_MAX_FAILED_LOGIN_ATTEMPTS',
        required: false,
        type: 'number',
        min: 3,
        max: 10,
        description: 'Maximum failed login attempts before lockout',
      },
      {
        key: 'AUTH_ACCOUNT_LOCKOUT_DURATION_MINUTES',
        required: false,
        type: 'number',
        min: 5,
        max: 1440,
        description: 'Account lockout duration in minutes',
      },
      {
        key: 'BCRYPT_ROUNDS',
        required: false,
        type: 'number',
        min: 10,
        max: 15,
        description: 'Bcrypt hashing rounds',
      },
    ];
  }

  /**
   * Get API Gateway specific validation rules
   */
  getApiGatewayRules(): ValidationRule[] {
    return [
      ...this.getCommonRules(),
      {
        key: 'API_GATEWAY_PORT',
        required: false,
        type: 'number',
        min: 1000,
        max: 65535,
        description: 'API Gateway port number',
      },
      {
        key: 'USER_SERVICE_GRAPHQL_URL',
        required: true,
        type: 'url',
        pattern: /^https?:\/\/.+\/graphql$/,
        description: 'User service GraphQL endpoint URL',
      },
      {
        key: 'CHAT_SERVICE_GRAPHQL_URL',
        required: true,
        type: 'url',
        pattern: /^https?:\/\/.+\/graphql$/,
        description: 'Chat service GraphQL endpoint URL',
      },
      {
        key: 'GRAPHQL_PLAYGROUND',
        required: false,
        type: 'boolean',
        description: 'Enable GraphQL Playground in API Gateway',
      },
      {
        key: 'GRAPHQL_DEBUG',
        required: false,
        type: 'boolean',
        description: 'Enable GraphQL debug mode in API Gateway',
      },
      {
        key: 'GRAPHQL_INTROSPECTION',
        required: false,
        type: 'boolean',
        description: 'Enable GraphQL introspection in API Gateway',
      },
      {
        key: 'QUERY_COMPLEXITY_LIMIT',
        required: false,
        type: 'number',
        min: 500,
        max: 5000,
        description: 'GraphQL query complexity limit for gateway',
      },
      {
        key: 'QUERY_DEPTH_LIMIT',
        required: false,
        type: 'number',
        min: 10,
        max: 25,
        description: 'GraphQL query depth limit for gateway',
      },
    ];
  }

  /**
   * Get Logging Service specific validation rules
   */
  getLoggingServiceRules(): ValidationRule[] {
    return [
      ...this.getCommonRules(),
      {
        key: 'LOKI_URL',
        required: true,
        type: 'url',
        pattern: /^https?:\/\/.+/,
        description: 'Loki server URL for log storage',
      },
      {
        key: 'LOKI_BATCH_SIZE',
        required: false,
        type: 'number',
        min: 1,
        max: 1000,
        description: 'Loki batch size for log entries',
      },
      {
        key: 'LOKI_BATCH_WAIT_MS',
        required: false,
        type: 'number',
        min: 100,
        max: 10000,
        description: 'Loki batch wait time in milliseconds',
      },
      {
        key: 'LOG_RETENTION_DAYS',
        required: false,
        type: 'number',
        min: 1,
        max: 365,
        description: 'Log retention period in days',
      },
      {
        key: 'KAFKA_CONSUMER_GROUP',
        required: false,
        type: 'string',
        pattern: /^[a-zA-Z0-9_-]+$/,
        description: 'Kafka consumer group ID',
      },
      {
        key: 'KAFKA_MAX_BYTES',
        required: false,
        type: 'number',
        min: 1024,
        max: 10485760,
        description: 'Kafka maximum message size in bytes',
      },
      {
        key: 'ENABLE_REQUEST_LOGGING',
        required: false,
        type: 'boolean',
        description: 'Enable HTTP request logging',
      },
      {
        key: 'ENABLE_PERFORMANCE_LOGGING',
        required: false,
        type: 'boolean',
        description: 'Enable performance metrics logging',
      },
      {
        key: 'API_KEY_ENABLED',
        required: false,
        type: 'boolean',
        description: 'Enable API key authentication',
      },
    ];
  }

  /**
   * Get validation rules for a specific service
   */
  getServiceRules(serviceName: string): ValidationRule[] {
    switch (serviceName.toLowerCase()) {
      case 'user-service':
        return this.getUserServiceRules();
      case 'chat-service':
        return this.getChatServiceRules();
      case 'notification-service':
        return this.getNotificationServiceRules();
      case 'auth-service':
        return this.getAuthServiceRules();
      case 'api-gateway':
        return this.getApiGatewayRules();
      case 'logging-service':
        return this.getLoggingServiceRules();
      default:
        return this.getCommonRules();
    }
  }
}

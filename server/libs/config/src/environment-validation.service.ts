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
}

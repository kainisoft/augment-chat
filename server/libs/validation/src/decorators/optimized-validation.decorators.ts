import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiPropertyOptions,
} from '@nestjs/swagger';
import {
  CachedValidators,
  validationCache,
  VALIDATION_CACHE_KEYS,
} from '../cache/validation-cache.service';

/**
 * Optimized Validation Decorators
 *
 * Performance-optimized validation decorators that use caching and memoization
 * to improve validation performance for frequently validated data.
 */

/**
 * Optimized email field validation with caching
 */
export function IsOptimizedEmailField(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      description: 'Email address (cached validation)',
      example: 'user@example.com',
      format: 'email',
      ...options,
    }),
    IsString(),
    IsNotEmpty({ message: 'Email is required' }),
    createCachedValidator('isOptimizedEmail', CachedValidators.validateEmail, {
      message: 'Please provide a valid email address',
    }),
  );
}

/**
 * Optimized UUID field validation with caching
 */
export function IsOptimizedUUIDField(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      description: 'UUID v4 identifier (cached validation)',
      example: '123e4567-e89b-12d3-a456-426614174000',
      format: 'uuid',
      ...options,
    }),
    IsString(),
    IsNotEmpty(),
    createCachedValidator('isOptimizedUUID', CachedValidators.validateUUID, {
      message: 'Must be a valid UUID v4',
    }),
  );
}

/**
 * Optimized username field validation with caching
 */
export function IsOptimizedUsernameField(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      description:
        'Username (3-50 characters, alphanumeric, underscore, hyphen) - cached validation',
      example: 'john_doe',
      minLength: 3,
      maxLength: 50,
      pattern: '^[a-zA-Z0-9_-]+$',
      ...options,
    }),
    IsString(),
    IsNotEmpty(),
    MinLength(3, { message: 'Username must be at least 3 characters long' }),
    MaxLength(50, { message: 'Username cannot exceed 50 characters' }),
    createCachedValidator(
      'isOptimizedUsername',
      CachedValidators.validateUsername,
      {
        message:
          'Username can only contain letters, numbers, underscores, and hyphens',
      },
    ),
  );
}

/**
 * Optimized JWT token field validation with caching
 */
export function IsOptimizedJWTTokenField(options?: ApiPropertyOptions) {
  return applyDecorators(
    ApiProperty({
      description: 'JWT token (cached validation)',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      ...options,
    }),
    IsString(),
    IsNotEmpty(),
    createCachedValidator('isOptimizedJWT', CachedValidators.validateJWT, {
      message: 'Must be a valid JWT token',
    }),
  );
}

/**
 * Memoized strong password validation
 */
export function IsOptimizedStrongPasswordField(options?: ApiPropertyOptions) {
  const memoizedPasswordValidator = validationCache.memoize(
    VALIDATION_CACHE_KEYS.PASSWORD,
    (password: string) => {
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const isLongEnough = password.length >= 8;

      return {
        hasUpper,
        hasLower,
        hasNumber,
        isLongEnough,
        isValid: hasUpper && hasLower && hasNumber && isLongEnough,
      };
    },
    (password) => `pwd_${password.length}_${password.slice(0, 2)}`, // Safe key generation
    { maxSize: 100, ttlMs: 2 * 60 * 1000 }, // 2 minutes for passwords
  );

  return applyDecorators(
    ApiProperty({
      description:
        'Strong password (min 8 chars, uppercase, lowercase, number) - optimized validation',
      example: 'Password123',
      minLength: 8,
      ...options,
    }),
    IsString({ message: 'Password must be a string' }),
    IsNotEmpty({ message: 'Password is required' }),
    MinLength(8, { message: 'Password must be at least 8 characters long' }),
    createCachedValidator(
      'isOptimizedStrongPassword',
      (password: string) => {
        const result = memoizedPasswordValidator(password);
        return result.isValid;
      },
      {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      },
    ),
  );
}

/**
 * Batch validation decorator for multiple fields
 */
export function IsBatchValidatedFields(
  validationRules: Array<{
    field: string;
    validator: (value: any) => boolean;
    message: string;
  }>,
  options?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBatchValidated',
      target: object.constructor,
      propertyName: propertyName,
      options: options,
      validator: {
        validate(value: any, args: ValidationArguments): boolean {
          const obj = args.object as any;

          // Use batch validation with caching
          const cacheKey = `batch_${args.targetName}_${propertyName}`;
          const validationKey = JSON.stringify(
            validationRules.map((rule) => ({
              field: rule.field,
              value: obj[rule.field],
            })),
          );

          const cached = validationCache.get<boolean>(cacheKey, validationKey);
          if (cached !== undefined) {
            return cached;
          }

          // Perform batch validation
          const results = validationRules.map((rule) => ({
            field: rule.field,
            valid: rule.validator(obj[rule.field]),
            message: rule.message,
          }));

          const allValid = results.every((result) => result.valid);

          // Cache the result
          validationCache.set(cacheKey, validationKey, allValid, {
            maxSize: 50,
            ttlMs: 1 * 60 * 1000, // 1 minute for batch validations
          });

          return allValid;
        },
        defaultMessage(args: ValidationArguments): string {
          return `Batch validation failed for ${args.property}`;
        },
      },
    });
  };
}

/**
 * Performance monitoring decorator for validation
 */
export function IsPerformanceMonitoredField(
  validatorName: string,
  validator: (value: any) => boolean,
  options?: ApiPropertyOptions & { enableProfiling?: boolean },
) {
  const enableProfiling = options?.enableProfiling ?? false;

  return applyDecorators(
    ApiProperty({
      description: `Performance monitored validation for ${validatorName}`,
      ...options,
    }),
    createCachedValidator(
      `perf_${validatorName}`,
      (value: any) => {
        if (enableProfiling) {
          const startTime = performance.now();
          const result = validator(value);
          const endTime = performance.now();

          // Log performance metrics (in production, send to monitoring service)
          console.debug(
            `Validation ${validatorName} took ${endTime - startTime}ms`,
          );

          return result;
        }

        return validator(value);
      },
      {
        message: `${validatorName} validation failed`,
      },
    ),
  );
}

/**
 * Create a cached validator decorator
 */
function createCachedValidator(
  name: string,
  validator: (value: any) => boolean,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          return validator(value);
        },
        defaultMessage(args: ValidationArguments) {
          return (
            (validationOptions?.message as string) ||
            `${args.property} validation failed`
          );
        },
      },
    });
  };
}

/**
 * Validation performance utilities
 */
export class ValidationPerformanceUtils {
  /**
   * Get validation cache statistics
   */
  static getCacheStats() {
    return validationCache.getAllStats();
  }

  /**
   * Get validation efficiency metrics
   */
  static getEfficiencyMetrics() {
    return validationCache.getEfficiencyMetrics();
  }

  /**
   * Clear validation caches
   */
  static clearCaches(cacheKey?: string) {
    validationCache.clear(cacheKey);
  }

  /**
   * Cleanup expired cache entries
   */
  static cleanupCaches() {
    validationCache.cleanup();
  }

  /**
   * Warm up validation caches with common values
   */
  static warmUpCaches() {
    // Warm up email validation
    const commonEmails = [
      'user@example.com',
      'test@test.com',
      'admin@domain.org',
      'support@company.co.uk',
    ];

    commonEmails.forEach((email) => {
      CachedValidators.validateEmail(email);
    });

    // Warm up UUID validation
    const commonUUIDs = [
      '123e4567-e89b-12d3-a456-426614174000',
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    ];

    commonUUIDs.forEach((uuid) => {
      CachedValidators.validateUUID(uuid);
    });

    // Warm up username validation
    const commonUsernames = ['john_doe', 'user123', 'admin', 'test-user'];

    commonUsernames.forEach((username) => {
      CachedValidators.validateUsername(username);
    });
  }

  /**
   * Get validation performance report
   */
  static getPerformanceReport() {
    const stats = this.getCacheStats();
    const metrics = this.getEfficiencyMetrics();

    return {
      timestamp: new Date().toISOString(),
      overallMetrics: metrics,
      cacheStats: Object.fromEntries(stats),
      recommendations: this.generateRecommendations(metrics, stats),
    };
  }

  /**
   * Generate performance recommendations
   */
  private static generateRecommendations(
    metrics: ReturnType<typeof ValidationPerformanceUtils.getEfficiencyMetrics>,
    stats: Map<string, any>,
  ) {
    const recommendations: string[] = [];

    if (metrics.overallHitRate < 0.7) {
      recommendations.push(
        'Consider increasing cache TTL or size - hit rate is below 70%',
      );
    }

    if (metrics.totalSize > 5000) {
      recommendations.push(
        'Consider reducing cache sizes - total cache size is large',
      );
    }

    for (const [cacheKey, stat] of stats.entries()) {
      if (stat.hitRate < 0.5) {
        recommendations.push(
          `Cache ${cacheKey} has low hit rate (${(stat.hitRate * 100).toFixed(1)}%) - consider optimization`,
        );
      }
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Validation caching is performing well - no immediate optimizations needed',
      );
    }

    return recommendations;
  }
}

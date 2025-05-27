import { Module } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { ValidationCacheService } from './cache/validation-cache.service';

/**
 * Validation Module
 *
 * Provides shared validation utilities, decorators, and patterns
 * for consistent validation across all microservices.
 *
 * This module includes:
 * - Common validation decorators
 * - Optimized validation decorators with caching
 * - Reusable validation patterns
 * - Custom validation pipes
 * - Validation utilities and helpers
 * - Performance-optimized validation caching
 */
@Module({
  providers: [ValidationService, ValidationCacheService],
  exports: [ValidationService, ValidationCacheService],
})
export class ValidationModule {}

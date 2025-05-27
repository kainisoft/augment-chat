/**
 * Validation Library
 *
 * This module exports validation utilities, decorators, and patterns
 * for consistent validation across all microservices.
 *
 * Optimized for tree-shaking with selective exports.
 */

// Core module and service
export { ValidationModule } from './validation.module';
export { ValidationService } from './validation.service';
export {
  ValidationCacheService,
  validationCache,
  VALIDATION_CACHE_KEYS,
  CachedValidators,
} from './cache/validation-cache.service';

// Commonly used validation decorators (selective exports for better tree-shaking)
export {
  IsUUIDField,
  IsEmailField,
  IsUsernameField,
  IsStrongPasswordField,
  IsDisplayNameField,
  IsOptionalStringField,
  IsJWTTokenField,
  IsRefreshTokenField,
} from './decorators/common-validation.decorators';

// Less commonly used decorators (lazy-loaded exports)
export {
  IsBioField,
  IsAvatarUrlField,
  IsSearchTermField,
  IsISODateField,
  IsLogLevelField,
  IsJWTToken,
  IsValidDateRange,
} from './decorators/common-validation.decorators';

// Performance-optimized validation decorators (with caching)
export {
  IsOptimizedEmailField,
  IsOptimizedUUIDField,
  IsOptimizedUsernameField,
  IsOptimizedJWTTokenField,
  IsOptimizedStrongPasswordField,
  IsBatchValidatedFields,
  IsPerformanceMonitoredField,
  ValidationPerformanceUtils,
} from './decorators/optimized-validation.decorators';

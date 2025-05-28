/**
 * Validation Library
 *
 * This module exports validation utilities, decorators, and patterns
 * for consistent validation across all microservices.
 *
 * Optimized for tree-shaking with selective exports.
 * Only exports that are actually used across services are included.
 */

// Actually used validation decorators (based on import analysis)
export {
  IsUUIDField,
  IsEmailField,
  IsUsernameField,
  IsStrongPasswordField,
  IsDisplayNameField,
  IsBioField,
  IsAvatarUrlField,
  IsJWTTokenField,
  IsRefreshTokenField,
  IsISODateField,
  IsLogLevelField,
  IsValidDateRange,
} from './decorators/common-validation.decorators';

// Lazy-loaded exports for optional features (tree-shakable in production)
export const LazyValidationUtils = {
  // Core module and service (lazy-loaded to reduce bundle size)
  async loadValidationModule() {
    const { ValidationModule } = await import('./validation.module');
    return ValidationModule;
  },

  async loadValidationService() {
    const { ValidationService } = await import('./validation.service');
    return ValidationService;
  },

  async loadValidationCache() {
    const {
      ValidationCacheService,
      validationCache,
      VALIDATION_CACHE_KEYS,
      CachedValidators,
    } = await import('./cache/validation-cache.service');
    return {
      ValidationCacheService,
      validationCache,
      VALIDATION_CACHE_KEYS,
      CachedValidators,
    };
  },

  // Unused decorators (available via lazy loading)
  async loadUnusedDecorators() {
    const { IsOptionalStringField, IsJWTToken } = await import(
      './decorators/common-validation.decorators'
    );
    return {
      IsOptionalStringField,
      IsJWTToken,
    };
  },

  // Performance-optimized decorators (available via lazy loading)
  async loadOptimizedDecorators() {
    const {
      IsOptimizedEmailField,
      IsOptimizedUUIDField,
      IsOptimizedUsernameField,
      IsOptimizedJWTTokenField,
      IsOptimizedStrongPasswordField,
      IsBatchValidatedFields,
      IsPerformanceMonitoredField,
      ValidationPerformanceUtils,
    } = await import('./decorators/optimized-validation.decorators');
    return {
      IsOptimizedEmailField,
      IsOptimizedUUIDField,
      IsOptimizedUsernameField,
      IsOptimizedJWTTokenField,
      IsOptimizedStrongPasswordField,
      IsBatchValidatedFields,
      IsPerformanceMonitoredField,
      ValidationPerformanceUtils,
    };
  },
};

/**
 * Configuration Library
 *
 * This module exports enhanced configuration management utilities
 * for consistent configuration patterns across all microservices.
 *
 * Features:
 * - Type-safe configuration management
 * - Environment variable validation
 * - Standardized configuration patterns
 * - Service-specific configuration factories
 * - Configuration validation and error handling
 */

// Core module
export { ConfigModule, ConfigModuleOptions } from './config.module';

// Configuration service
export {
  ConfigurationService,
  DatabaseConfig,
  RedisConfig,
  KafkaConfig,
  LoggingConfig,
  SecurityConfig,
  ServiceConfig,
} from './configuration.service';

// Environment validation
export {
  EnvironmentValidationService,
  ValidationRule,
  ValidationResult,
} from './environment-validation.service';

// Configuration factory
export { ConfigurationFactory } from './configuration.factory';

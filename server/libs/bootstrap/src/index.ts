/**
 * Bootstrap Library
 *
 * This module exports enhanced bootstrap utilities for consistent
 * service startup patterns across all microservices.
 *
 * Features:
 * - Enhanced bootstrap service with common configurations
 * - Service configuration management
 * - Hot module replacement utilities
 * - Standardized error handling
 * - Common middleware setup
 */

// Core module
export { BootstrapModule } from './bootstrap.module';

// Enhanced bootstrap service
export {
  BootstrapService,
  BootstrapOptions,
  bootstrap,
} from './bootstrap.service';

// Service configuration
export {
  ServiceConfigurationService,
  ServiceConfiguration,
} from './service-configuration.service';

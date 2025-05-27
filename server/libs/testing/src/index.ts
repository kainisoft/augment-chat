/**
 * Testing Library
 *
 * This module exports testing utilities, mocks, and patterns
 * for consistent testing across all microservices.
 *
 * Optimized for tree-shaking with selective exports.
 * Note: Currently unused in production (0 usages) - consider lazy loading.
 */

// Core module (only export module for tree-shaking in production)
export { TestingModule } from './testing.module';

// Lazy loading utilities for testing (tree-shakable in production)
export {
  LazyTestingUtils,
  lazyLoadMockFactory,
  lazyLoadControllerTestBuilder,
  lazyLoadServiceTestBuilder,
  lazyLoadTestSetup,
} from './lazy-testing.util';

// Legacy exports for backward compatibility (will be tree-shaken in production)
export { MockFactoryService } from './mocks/mock-factory.service';
export { ControllerTestBuilder } from './builders/controller-test.builder';
export { ServiceTestBuilder } from './builders/service-test.builder';
export { TestSetupService } from './builders/test-setup.service';
export { TestDatabaseService } from './database/test-database.service';
export { E2ETestSetupService } from './e2e/e2e-test-setup.service';

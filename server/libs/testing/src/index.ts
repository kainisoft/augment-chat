/**
 * Testing Library
 *
 * This module exports testing utilities, mocks, and patterns
 * for consistent testing across all microservices.
 *
 * Note: Testing utilities are only used in test files (.spec.ts, .test.ts)
 * and are automatically tree-shaken from production builds.
 */

// Core module
export { TestingModule } from './testing.module';

// Testing utilities (used in test files only - tree-shaken in production)
export { MockFactoryService } from './mocks/mock-factory.service';
export { ControllerTestBuilder } from './builders/controller-test.builder';
export { ServiceTestBuilder } from './builders/service-test.builder';
export { TestSetupService } from './builders/test-setup.service';
export { TestDatabaseService } from './database/test-database.service';
export { E2ETestSetupService } from './e2e/e2e-test-setup.service';

// Lazy loading utilities for testing (optional)
export {
  LazyTestingUtils,
  lazyLoadMockFactory,
  lazyLoadControllerTestBuilder,
  lazyLoadServiceTestBuilder,
  lazyLoadTestSetup,
} from './lazy-testing.util';

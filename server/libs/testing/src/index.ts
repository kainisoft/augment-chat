/**
 * Testing Library
 *
 * This module exports testing utilities, mocks, and patterns
 * for consistent testing across all microservices.
 *
 * Optimized for tree-shaking with selective exports.
 * Note: Currently unused in production (0 usages) - consider lazy loading.
 */

// Core module
export { TestingModule } from './testing.module';

// Database testing utilities (lazy-loaded)
export { TestDatabaseService } from './database/test-database.service';

// Mock factories (lazy-loaded)
export { MockFactoryService } from './mocks/mock-factory.service';

// Test builders (lazy-loaded)
export { TestSetupService } from './builders/test-setup.service';
export { ControllerTestBuilder } from './builders/controller-test.builder';
export { ServiceTestBuilder } from './builders/service-test.builder';

// E2E testing utilities (lazy-loaded)
export { E2ETestSetupService } from './e2e/e2e-test-setup.service';

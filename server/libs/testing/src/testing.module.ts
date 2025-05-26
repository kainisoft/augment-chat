import { Module } from '@nestjs/common';
import { TestDatabaseService } from './database/test-database.service';
import { MockFactoryService } from './mocks/mock-factory.service';

/**
 * Testing Module
 *
 * Provides shared testing utilities, mocks, and patterns
 * for consistent testing across all microservices.
 *
 * This module includes:
 * - Test database utilities and setup
 * - Mock factories for common objects
 * - Testing helpers and utilities
 * - Common test patterns and fixtures
 *
 * ## Usage
 *
 * Import this module in your test files to access testing utilities:
 *
 * ```typescript
 * import { Test, TestingModule } from '@nestjs/testing';
 * import { TestingModule as SharedTestingModule, MockFactoryService } from '@app/testing';
 *
 * describe('YourService', () => {
 *   let service: YourService;
 *   let mockFactory: MockFactoryService;
 *
 *   beforeEach(async () => {
 *     const module: TestingModule = await Test.createTestingModule({
 *       imports: [SharedTestingModule],
 *       providers: [YourService],
 *     }).compile();
 *
 *     service = module.get<YourService>(YourService);
 *     mockFactory = module.get<MockFactoryService>(MockFactoryService);
 *   });
 * });
 * ```
 */
@Module({
  providers: [TestDatabaseService, MockFactoryService],
  exports: [TestDatabaseService, MockFactoryService],
})
export class TestingModule {}

import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { PerformanceIntegrationService } from './performance/performance-integration.service';

/**
 * Common Module
 *
 * Provides shared utilities, services, and patterns
 * for consistent implementation across all microservices.
 *
 * This module includes:
 * - Common utilities and helpers
 * - Performance monitoring and optimization
 * - Memory optimization utilities
 * - Memoization and caching utilities
 */
@Module({
  providers: [CommonService, PerformanceIntegrationService],
  exports: [CommonService, PerformanceIntegrationService],
})
export class CommonModule {}

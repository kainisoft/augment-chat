import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BootstrapService } from './bootstrap.service';
import { ServiceConfigurationService } from './service-configuration.service';

/**
 * Bootstrap Module
 *
 * Provides enhanced bootstrap utilities for consistent service startup
 * patterns across all microservices.
 *
 * This module includes:
 * - Enhanced bootstrap service with common configurations
 * - Service configuration management
 * - Hot module replacement utilities
 * - Standardized error handling
 * - Common middleware setup
 */
@Module({
  imports: [ConfigModule],
  providers: [BootstrapService, ServiceConfigurationService],
  exports: [BootstrapService, ServiceConfigurationService],
})
export class BootstrapModule {}

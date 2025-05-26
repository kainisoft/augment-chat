import { Module } from '@nestjs/common';
import { ValidationService } from './validation.service';

/**
 * Validation Module
 *
 * Provides shared validation utilities, decorators, and patterns
 * for consistent validation across all microservices.
 *
 * This module includes:
 * - Common validation decorators
 * - Reusable validation patterns
 * - Custom validation pipes
 * - Validation utilities and helpers
 */
@Module({
  providers: [ValidationService],
  exports: [ValidationService],
})
export class ValidationModule {}

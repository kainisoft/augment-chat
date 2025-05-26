import { Module } from '@nestjs/common';
import { RateLimitService } from './rate-limit/rate-limit.service';
import { SecurityUtilsService } from './utils/security-utils.service';

/**
 * Security Module
 *
 * Provides shared security utilities, guards, and patterns
 * for consistent security implementation across all microservices.
 *
 * This module includes:
 * - Rate limiting utilities and guards
 * - Security decorators and metadata
 * - Common security patterns and helpers
 * - Input sanitization utilities
 * - Security validation patterns
 */
@Module({
  providers: [RateLimitService, SecurityUtilsService],
  exports: [RateLimitService, SecurityUtilsService],
})
export class SecurityModule {}

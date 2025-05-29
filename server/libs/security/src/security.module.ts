import { Module } from '@nestjs/common';
import { RedisModule } from '@app/redis';
import { LoggingModule } from '@app/logging';
import { RateLimitService } from './rate-limit/rate-limit.service';
import { SecurityUtilsService } from './utils/security-utils.service';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { LazySecurityService } from './lazy/lazy-security.service';

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
 * - Lazy-loaded heavy security operations
 * - Performance-optimized security utilities
 */
@Module({
  imports: [
    RedisModule.registerDefault({
      isGlobal: false,
      keyPrefix: 'security:',
    }),
    LoggingModule,
  ],
  providers: [
    RateLimitService,
    SecurityUtilsService,
    RateLimitGuard,
    LazySecurityService,
  ],
  exports: [
    RateLimitService,
    SecurityUtilsService,
    RateLimitGuard,
    LazySecurityService,
  ],
})
export class SecurityModule {}

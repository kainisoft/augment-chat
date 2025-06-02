/**
 * Security Library
 *
 * This module exports security utilities, guards, decorators, and patterns
 * for consistent security implementation across all microservices.
 *
 * Optimized for tree-shaking with selective exports.
 */

// Core module
export { SecurityModule } from './security.module';

// Rate limiting (most frequently used - 5 usages)
export {
  RateLimit,
  RateLimitSkip,
  RateLimitKeyGenerator,
  Auth,
  AUTH_TYPE_KEY,
} from './decorators';
export { RateGuardService, AuthGuardService } from './services';

// Security utilities (frequently used)
export { SecurityUtilsService } from './utils/security-utils.service';

// Guards (lazy-loaded for better performance)
export {
  RateLimitGuard,
  RateLimitMetadata,
  AuthenticationGuard,
  AccessTokenGuard,
} from './guards';

// Lazy loading utilities (for heavy security operations)
export {
  LazySecurityService,
  LazySecurityOperation,
  MemoizedSecurityOperation,
} from './lazy/lazy-security.service';

export { AuthType, TokenType } from './enums';
export { JwtPayload } from './interfaces';

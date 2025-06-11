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

// Rate limiting and authentication decorators (most frequently used)
export {
  RateLimit,
  RateLimitSkip,
  RateLimitKeyGenerator,
  Auth,
  AUTH_TYPE_KEY,
  CurrentUser,
  CurrentUserId,
  CurrentUserRoles,
  CurrentUserPermissions,
} from './decorators';
export {
  RateGuardService,
  AuthGuardService,
  UserContextService,
} from './services';

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
export {
  JwtPayload,
  AuthGuardOptions,
  AuthenticatedRequest,
  RateGuardOptions,
} from './interfaces';

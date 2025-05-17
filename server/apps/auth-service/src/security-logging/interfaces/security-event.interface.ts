/**
 * Security Event Types
 *
 * Enum of all possible security event types for logging
 */
export enum SecurityEventType {
  // Authentication events
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',

  // Token events
  TOKEN_CREATED = 'token_created',
  TOKEN_REFRESHED = 'token_refreshed',
  TOKEN_REVOKED = 'token_revoked',
  TOKEN_EXPIRED = 'token_expired',

  // Account events
  ACCOUNT_CREATED = 'account_created',
  ACCOUNT_UPDATED = 'account_updated',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',

  // Password events
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  PASSWORD_RESET_COMPLETED = 'password_reset_completed',

  // Session events
  SESSION_CREATED = 'session_created',
  SESSION_TERMINATED = 'session_terminated',
  SESSION_EXPIRED = 'session_expired',
  ALL_SESSIONS_TERMINATED = 'all_sessions_terminated',

  // Access events
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PERMISSION_VIOLATION = 'permission_violation',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
}

/**
 * Security Event Severity
 *
 * Enum of possible severity levels for security events
 */
export enum SecurityEventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Base Security Event Data
 *
 * Base interface for all security event data
 */
export interface BaseSecurityEventData {
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  success?: boolean;
  reason?: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Authentication Event Data
 */
export interface AuthenticationEventData extends BaseSecurityEventData {
  method?: string; // e.g., 'password', 'oauth', '2fa'
  provider?: string; // For OAuth: 'google', 'github', etc.
}

/**
 * Token Event Data
 */
export interface TokenEventData extends BaseSecurityEventData {
  tokenId?: string;
  tokenType?: string; // 'access', 'refresh'
  expiresAt?: number;
}

/**
 * Account Event Data
 */
export interface AccountEventData extends BaseSecurityEventData {
  accountId?: string;
  changes?: string[]; // Fields that were changed
}

/**
 * Password Event Data
 */
export interface PasswordEventData extends BaseSecurityEventData {
  requestId?: string; // For password reset requests
}

/**
 * Session Event Data
 */
export interface SessionEventData extends BaseSecurityEventData {
  deviceInfo?: string;
  location?: string;
  duration?: number; // Session duration in seconds
  terminatedCount?: number; // For ALL_SESSIONS_TERMINATED
}

/**
 * Access Event Data
 */
export interface AccessEventData extends BaseSecurityEventData {
  resource?: string;
  action?: string;
  requiredPermission?: string;
}

/**
 * Security Event
 *
 * Interface for security events to be logged
 */
export interface SecurityEvent {
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  timestamp: number;
  data: BaseSecurityEventData;
}

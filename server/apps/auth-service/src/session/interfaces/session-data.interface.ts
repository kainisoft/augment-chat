/**
 * Session data interface
 *
 * Extends the base SessionData interface from the Redis library
 * with application-specific fields
 */
export interface SessionData {
  /**
   * User ID
   */
  userId?: string;

  /**
   * Session creation timestamp
   */
  createdAt: number;

  /**
   * Session last accessed timestamp
   */
  lastAccessedAt: number;

  /**
   * Session expiration timestamp
   */
  expiresAt: number;

  /**
   * Client IP address
   */
  ip?: string;

  /**
   * Client user agent
   */
  userAgent?: string;

  /**
   * Session data
   */
  data?: Record<string, any>;
}

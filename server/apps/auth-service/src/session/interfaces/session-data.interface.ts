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

  /**
   * Device information (browser, OS, device type)
   */
  deviceInfo?: Record<string, any>;

  /**
   * Geographic location information
   */
  location?: Record<string, any>;

  /**
   * Whether the session is active
   */
  isActive?: boolean;

  /**
   * Termination timestamp (if session was terminated)
   */
  terminatedAt?: number;

  /**
   * Termination reason (if session was terminated)
   */
  terminationReason?: string;
}

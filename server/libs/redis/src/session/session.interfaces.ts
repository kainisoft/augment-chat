/**
 * Session data interface
 *
 * This interface defines the structure of session data.
 */
export interface SessionData {
  /**
   * User ID associated with the session
   */
  userId?: string;

  /**
   * Session creation timestamp
   */
  createdAt: number;

  /**
   * Session last access timestamp
   */
  lastAccessedAt: number;

  /**
   * Session expiration timestamp
   */
  expiresAt: number;

  /**
   * IP address of the client
   */
  ip?: string;

  /**
   * User agent of the client
   */
  userAgent?: string;

  /**
   * Custom session data
   */
  data: Record<string, any>;
}

/**
 * Session options interface
 *
 * This interface defines the options for session management.
 */
export interface SessionOptions {
  /**
   * Session TTL in seconds
   * @default 86400 (1 day)
   */
  ttl?: number;

  /**
   * Session prefix
   * @default 'session'
   */
  prefix?: string;

  /**
   * Whether to encrypt session data
   * @default false
   */
  encrypt?: boolean;

  /**
   * Encryption key for session data
   * Required if encrypt is true
   */
  encryptionKey?: string;

  /**
   * Whether to automatically renew session on access
   * @default true
   */
  autoRenew?: boolean;

  /**
   * Whether to log session operations
   * @default false
   */
  enableLogs?: boolean;
}

/**
 * Default session options
 */
export const defaultSessionOptions: SessionOptions = {
  ttl: 86400, // 1 day
  prefix: 'session',
  encrypt: false,
  autoRenew: true,
  enableLogs: false,
};

/**
 * Session store interface
 *
 * This interface defines the methods that should be implemented by a session store.
 */
export interface SessionStore {
  /**
   * Create a new session
   * @param data Session data
   * @returns Promise resolving to the session ID
   */
  create(data: Partial<SessionData>): Promise<string>;

  /**
   * Get a session by ID
   * @param id Session ID
   * @returns Promise resolving to the session data or null if not found
   */
  get(id: string): Promise<SessionData | null>;

  /**
   * Update a session
   * @param id Session ID
   * @param data Session data to update
   * @returns Promise resolving to true if the session was updated
   */
  update(id: string, data: Partial<SessionData>): Promise<boolean>;

  /**
   * Delete a session
   * @param id Session ID
   * @returns Promise resolving to true if the session was deleted
   */
  delete(id: string): Promise<boolean>;

  /**
   * Touch a session to renew its expiration
   * @param id Session ID
   * @returns Promise resolving to true if the session was touched
   */
  touch(id: string): Promise<boolean>;

  /**
   * Find sessions by user ID
   * @param userId User ID
   * @returns Promise resolving to an array of session IDs
   */
  findByUserId(userId: string): Promise<string[]>;

  /**
   * Delete all sessions for a user
   * @param userId User ID
   * @returns Promise resolving to the number of sessions deleted
   */
  deleteByUserId(userId: string): Promise<number>;

  /**
   * Get all sessions for a user
   * @param userId User ID
   * @returns Promise resolving to an array of session data
   */
  getUserSessions(userId: string): Promise<SessionData[]>;
}

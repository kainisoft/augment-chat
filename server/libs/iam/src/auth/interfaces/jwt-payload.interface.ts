/**
 * JWT token types
 */
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

/**
 * JWT token payload
 */
export interface JwtPayload {
  /**
   * Subject (user ID)
   */
  sub: string;

  /**
   * Token type
   */
  type: TokenType;

  /**
   * Issued at timestamp
   */
  iat: number;

  /**
   * Expiration timestamp
   */
  exp?: number;

  /**
   * Session ID
   */
  sessionId?: string;

  /**
   * User roles
   */
  roles?: string[];

  /**
   * User permissions
   */
  permissions?: string[];

  /**
   * Additional data
   */
  [key: string]: any;
}

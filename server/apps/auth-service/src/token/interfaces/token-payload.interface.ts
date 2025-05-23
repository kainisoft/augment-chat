import { TokenType } from '@app/iam';

/**
 * Token payload interface
 */
export interface TokenPayload {
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
   * Added by JWT library
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

import { TokenType } from '../enums/token-type.enum';

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
   * Additional data
   */
  [key: string]: any;
}

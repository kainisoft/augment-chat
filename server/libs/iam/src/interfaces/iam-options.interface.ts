/**
 * IAM module options
 */
export interface IamOptions {
  /**
   * JWT secret key
   */
  jwtSecret: string;

  /**
   * JWT expiration time
   * @default '15m'
   */
  jwtExpiresIn?: string;

  /**
   * Refresh token expiration time
   * @default '7d'
   */
  refreshTokenExpiresIn?: string;

  /**
   * Whether to register the module globally
   * @default false
   */
  isGlobal?: boolean;
}

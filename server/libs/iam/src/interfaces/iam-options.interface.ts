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
   * Redis connection options for token storage
   */
  redis?: {
    /**
     * Redis host
     * @default 'localhost'
     */
    host?: string;

    /**
     * Redis port
     * @default 6379
     */
    port?: number;

    /**
     * Redis password
     */
    password?: string;

    /**
     * Redis key prefix
     * @default 'iam:'
     */
    keyPrefix?: string;
  };

  /**
   * Whether to register the module globally
   * @default false
   */
  isGlobal?: boolean;

  /**
   * Global guards configuration
   */
  globalGuards?: {
    /**
     * Whether to register the JWT guard globally
     * @default false
     */
    jwt?: boolean;

    /**
     * Whether to register the roles guard globally
     * @default false
     */
    roles?: boolean;
  };
}

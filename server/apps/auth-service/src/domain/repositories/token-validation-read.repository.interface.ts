import { TokenValidationReadModel } from '../read-models/token-validation.read-model';

/**
 * Token Validation Read Repository Interface
 *
 * Repository interface for reading token validation data
 */
export interface TokenValidationReadRepository {
  /**
   * Validate an access token
   * @param token - The access token to validate
   * @returns The token validation result
   */
  validateAccessToken(token: string): Promise<TokenValidationReadModel>;

  /**
   * Validate a refresh token
   * @param token - The refresh token to validate
   * @returns The token validation result
   */
  validateRefreshToken(token: string): Promise<TokenValidationReadModel>;
}

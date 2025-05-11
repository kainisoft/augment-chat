import { Injectable } from '@nestjs/common';
import { TokenService } from '../../token/token.service';
import { TokenValidationReadRepository } from '../../domain/repositories/token-validation-read.repository.interface';
import { TokenValidationReadModel } from '../../domain/read-models/token-validation.read-model';
import { TokenType } from '../../token/enums/token-type.enum';

/**
 * Token Validation Read Repository
 *
 * Implementation of the TokenValidationReadRepository interface.
 */
@Injectable()
export class TokenValidationReadRepositoryImpl
  implements TokenValidationReadRepository
{
  constructor(private readonly tokenService: TokenService) {}

  /**
   * Validate an access token
   * @param token - The access token to validate
   * @returns The token validation result
   */
  async validateAccessToken(token: string): Promise<TokenValidationReadModel> {
    try {
      const payload = await this.tokenService.validateToken(
        token,
        TokenType.ACCESS,
      );

      return {
        valid: true,
        userId: payload.sub,
        sessionId: payload.sessionId,
        email: payload.email,
        isVerified: payload.isVerified,
        isActive: true,
        expiresAt: new Date((payload.exp || 0) * 1000),
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate a refresh token
   * @param token - The refresh token to validate
   * @returns The token validation result
   */
  async validateRefreshToken(token: string): Promise<TokenValidationReadModel> {
    try {
      const payload = await this.tokenService.validateToken(
        token,
        TokenType.REFRESH,
      );

      return {
        valid: true,
        userId: payload.sub,
        sessionId: payload.sessionId,
        expiresAt: new Date((payload.exp || 0) * 1000),
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }
}

import { Injectable } from '@nestjs/common';
import { TokenService } from '../../token/token.service';
import { TokenValidationReadRepository } from '../../domain/repositories/token-validation-read.repository.interface';
import { TokenValidationReadModel } from '../../domain/read-models/token-validation.read-model';
import { TokenType } from '@app/iam';
import { LoggingService, ErrorLoggerService } from '@app/logging';

/**
 * Token Validation Read Repository
 *
 * Implementation of the TokenValidationReadRepository interface.
 */
@Injectable()
export class TokenValidationReadRepositoryImpl
  implements TokenValidationReadRepository
{
  constructor(
    private readonly tokenService: TokenService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(TokenValidationReadRepositoryImpl.name);
  }

  /**
   * Validate an access token
   * @param token - The access token to validate
   * @returns The token validation result
   */
  async validateAccessToken(token: string): Promise<TokenValidationReadModel> {
    try {
      this.loggingService.debug(
        'Validating access token',
        'validateAccessToken',
      );

      const payload = await this.tokenService.validateToken(
        token,
        TokenType.ACCESS,
      );

      const result = {
        valid: true,
        userId: payload.sub,
        sessionId: payload.sessionId,
        email: payload.email,
        isVerified: payload.isVerified,
        isActive: true,
        expiresAt: new Date((payload.exp || 0) * 1000),
      };

      this.loggingService.debug(
        'Access token validated successfully',
        'validateAccessToken',
        { userId: payload.sub, sessionId: payload.sessionId },
      );

      return result;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to validate access token',
        {
          source: TokenValidationReadRepositoryImpl.name,
          method: 'validateAccessToken',
          error: error instanceof Error ? error.message : String(error),
        },
      );

      return {
        valid: false,
        error: error instanceof Error ? error.message : String(error),
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
      this.loggingService.debug(
        'Validating refresh token',
        'validateRefreshToken',
      );

      const payload = await this.tokenService.validateToken(
        token,
        TokenType.REFRESH,
      );

      const result = {
        valid: true,
        userId: payload.sub,
        sessionId: payload.sessionId,
        expiresAt: new Date((payload.exp || 0) * 1000),
      };

      this.loggingService.debug(
        'Refresh token validated successfully',
        'validateRefreshToken',
        { userId: payload.sub, sessionId: payload.sessionId },
      );

      return result;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to validate refresh token',
        {
          source: TokenValidationReadRepositoryImpl.name,
          method: 'validateRefreshToken',
          error: error instanceof Error ? error.message : String(error),
        },
      );

      return {
        valid: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

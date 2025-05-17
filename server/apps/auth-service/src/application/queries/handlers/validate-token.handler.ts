import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { ErrorLoggerService, LoggingService } from '@app/logging';

import { ValidateTokenQuery } from '../impl/validate-token.query';
import { TokenValidationReadRepository } from '../../../domain/repositories/token-validation-read.repository.interface';
import { TokenValidationReadModel } from '../../../domain/read-models/token-validation.read-model';
import { TokenType } from '@app/iam';

/**
 * Validate Token Query Handler
 *
 * Handles token validation and returns the token payload
 */
@QueryHandler(ValidateTokenQuery)
export class ValidateTokenHandler
  implements IQueryHandler<ValidateTokenQuery, TokenValidationReadModel>
{
  constructor(
    @Inject('TokenValidationReadRepository')
    private readonly tokenValidationRepository: TokenValidationReadRepository,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(ValidateTokenHandler.name);
  }

  async execute(query: ValidateTokenQuery): Promise<TokenValidationReadModel> {
    try {
      const { token, tokenType } = query;

      let result: TokenValidationReadModel;
      if (tokenType === TokenType.ACCESS) {
        result =
          await this.tokenValidationRepository.validateAccessToken(token);
      } else if (tokenType === TokenType.REFRESH) {
        result =
          await this.tokenValidationRepository.validateRefreshToken(token);
      } else {
        throw new BadRequestException('Invalid token type');
      }

      this.loggingService.debug(`Token validated successfully`, 'execute', {
        tokenType,
        valid: result.valid,
      });

      return result;
    } catch (error: any) {
      this.errorLogger.error(error, 'Failed to validate token', {
        source: ValidateTokenHandler.name,
        method: 'execute',
        token: query.token ? '[REDACTED]' : undefined,
        tokenType: query.tokenType,
      });

      return {
        valid: false,
        error: error.message,
      };
    }
  }
}

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { LoggingService } from '@app/logging';

import { ValidateTokenQuery } from '../impl/validate-token.query';
import { TokenType } from '../../../token/enums/token-type.enum';
import { TokenValidationReadRepository } from '../../../domain/repositories/token-validation-read.repository.interface';
import { TokenValidationReadModel } from '../../../domain/read-models/token-validation.read-model';

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
      this.loggingService.debug(
        `Token validation failed: ${error.message}`,
        'execute',
        { error: error.message },
      );

      return {
        valid: false,
        error: error.message,
      };
    }
  }
}

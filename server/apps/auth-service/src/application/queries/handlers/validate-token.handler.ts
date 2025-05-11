import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { LoggingService } from '@app/logging';

import { ValidateTokenQuery } from '../impl/validate-token.query';
import { TokenService } from '../../../token/token.service';
import { TokenType } from '../../../token/enums/token-type.enum';

/**
 * Validate Token Query Handler
 *
 * Handles token validation and returns the token payload
 */
@QueryHandler(ValidateTokenQuery)
export class ValidateTokenHandler implements IQueryHandler<ValidateTokenQuery> {
  constructor(
    private readonly tokenService: TokenService,
    private readonly loggingService: LoggingService,
  ) {
    this.loggingService.setContext(ValidateTokenHandler.name);
  }

  async execute(query: ValidateTokenQuery): Promise<any> {
    try {
      const { token, tokenType } = query;

      let payload;
      if (tokenType === TokenType.ACCESS) {
        payload = await this.tokenService.verifyToken(token, TokenType.ACCESS);
      } else if (tokenType === TokenType.REFRESH) {
        payload = await this.tokenService.verifyToken(token, TokenType.REFRESH);
      } else {
        throw new BadRequestException('Invalid token type');
      }

      this.loggingService.debug(`Token validated successfully`, 'execute', {
        tokenType,
      });

      return {
        valid: true,
        payload,
      };
    } catch (error) {
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

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { LoggingService } from '@app/logging';

import { GetUserAuthInfoQuery } from '../impl/get-user-auth-info.query';
import { UserAuthReadRepository } from '../../../domain/repositories/user-auth-read.repository.interface';
import { UserAuthInfoReadModel } from '../../../domain/read-models/user-auth-info.read-model';

/**
 * Get User Auth Info Query Handler
 *
 * Retrieves authentication information for a user
 */
@QueryHandler(GetUserAuthInfoQuery)
export class GetUserAuthInfoHandler
  implements IQueryHandler<GetUserAuthInfoQuery, UserAuthInfoReadModel>
{
  constructor(
    @Inject('UserAuthReadRepository')
    private readonly userAuthReadRepository: UserAuthReadRepository,
    private readonly loggingService: LoggingService,
  ) {
    this.loggingService.setContext(GetUserAuthInfoHandler.name);
  }

  async execute(query: GetUserAuthInfoQuery): Promise<UserAuthInfoReadModel> {
    try {
      const userAuthInfo = await this.userAuthReadRepository.findById(query.userId);
      if (!userAuthInfo) {
        throw new NotFoundException(`User with ID ${query.userId} not found`);
      }

      this.loggingService.debug(`Retrieved auth info for user`, 'execute', {
        userId: query.userId,
      });

      return userAuthInfo;
    } catch (error) {
      this.loggingService.error(
        `Failed to get user auth info: ${error.message}`,
        'execute',
        { error: error.message, userId: query.userId },
      );
      throw error;
    }
  }
}

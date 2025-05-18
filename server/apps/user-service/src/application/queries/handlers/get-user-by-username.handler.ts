import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { GetUserByUsernameQuery } from '../impl/get-user-by-username.query';
import { UserReadRepository } from '../../../domain/repositories/user-read.repository.interface';
import { UserProfileReadModel } from '../../../domain/read-models/user-profile.read-model';

/**
 * Get User By Username Query Handler
 *
 * Retrieves a user by their username
 */
@QueryHandler(GetUserByUsernameQuery)
export class GetUserByUsernameHandler
  implements IQueryHandler<GetUserByUsernameQuery, UserProfileReadModel>
{
  constructor(
    @Inject('UserReadRepository')
    private readonly userReadRepository: UserReadRepository,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(GetUserByUsernameHandler.name);
  }

  async execute(query: GetUserByUsernameQuery): Promise<UserProfileReadModel> {
    try {
      this.loggingService.debug(
        `Getting user by username: ${query.username}`,
        'execute',
        { username: query.username },
      );

      const userProfile = await this.userReadRepository.findByUsername(
        query.username,
      );
      if (!userProfile) {
        throw new NotFoundException(
          `User with username ${query.username} not found`,
        );
      }

      this.loggingService.debug(
        `Retrieved user by username: ${query.username}`,
        'execute',
        { username: query.username, userId: userProfile.id },
      );

      return userProfile;
    } catch (error) {
      // Log error
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to get user by username',
        {
          source: GetUserByUsernameHandler.name,
          method: 'execute',
          username: query.username,
        },
      );

      // Re-throw error
      throw error;
    }
  }
}

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { GetUserProfileQuery } from '../impl/get-user-profile.query';
import { UserReadRepository } from '../../../domain/repositories/user-read.repository.interface';
import { UserProfileReadModel } from '../../../domain/read-models/user-profile.read-model';

/**
 * Get User Profile Query Handler
 *
 * Retrieves a user's profile information
 */
@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler
  implements IQueryHandler<GetUserProfileQuery, UserProfileReadModel>
{
  constructor(
    @Inject('UserReadRepository')
    private readonly userReadRepository: UserReadRepository,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(GetUserProfileHandler.name);
  }

  async execute(query: GetUserProfileQuery): Promise<UserProfileReadModel> {
    try {
      this.loggingService.debug(
        `Getting user profile: ${query.userId}`,
        'execute',
        { userId: query.userId },
      );

      const userProfile = await this.userReadRepository.findById(query.userId);
      if (!userProfile) {
        throw new NotFoundException(`User with ID ${query.userId} not found`);
      }

      this.loggingService.debug(
        `Retrieved user profile: ${query.userId}`,
        'execute',
        { userId: query.userId },
      );

      return userProfile;
    } catch (error) {
      // Log error
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to get user profile',
        {
          source: GetUserProfileHandler.name,
          method: 'execute',
          userId: query.userId,
        },
      );

      // Re-throw error
      throw error;
    }
  }
}

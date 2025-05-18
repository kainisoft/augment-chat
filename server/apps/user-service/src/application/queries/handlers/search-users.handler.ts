import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { SearchUsersQuery } from '../impl/search-users.query';
import { UserReadRepository } from '../../../domain/repositories/user-read.repository.interface';
import { UserProfileReadModel } from '../../../domain/read-models/user-profile.read-model';

/**
 * Search Users Query Handler
 *
 * Searches for users by username or display name
 */
@QueryHandler(SearchUsersQuery)
export class SearchUsersHandler
  implements IQueryHandler<SearchUsersQuery, UserProfileReadModel[]>
{
  constructor(
    @Inject('UserReadRepository')
    private readonly userReadRepository: UserReadRepository,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(SearchUsersHandler.name);
  }

  async execute(query: SearchUsersQuery): Promise<UserProfileReadModel[]> {
    try {
      this.loggingService.debug(
        `Searching users with term: ${query.searchTerm}`,
        'execute',
        {
          searchTerm: query.searchTerm,
          limit: query.limit,
          offset: query.offset,
        },
      );

      const options = {
        limit: query.limit,
        offset: query.offset,
        orderBy: 'username',
        orderDirection: 'asc' as const,
      };

      const users = await this.userReadRepository.searchUsers(
        query.searchTerm,
        options,
      );

      this.loggingService.debug(
        `Found ${users.length} users matching search term: ${query.searchTerm}`,
        'execute',
        {
          searchTerm: query.searchTerm,
          count: users.length,
        },
      );

      return users;
    } catch (error) {
      // Log error
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to search users',
        {
          source: SearchUsersHandler.name,
          method: 'execute',
          searchTerm: query.searchTerm,
        },
      );

      // Re-throw error
      throw error;
    }
  }
}

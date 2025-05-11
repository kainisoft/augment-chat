import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { LoggingService } from '@app/logging';

import { GetUserAuthInfoQuery } from '../impl/get-user-auth-info.query';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserId } from '../../../domain/models/value-objects/user-id.value-object';

/**
 * Get User Auth Info Query Handler
 *
 * Retrieves authentication information for a user
 */
@QueryHandler(GetUserAuthInfoQuery)
export class GetUserAuthInfoHandler
  implements IQueryHandler<GetUserAuthInfoQuery>
{
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly loggingService: LoggingService,
  ) {
    this.loggingService.setContext(GetUserAuthInfoHandler.name);
  }

  async execute(query: GetUserAuthInfoQuery): Promise<any> {
    try {
      const userId = new UserId(query.userId);

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${query.userId} not found`);
      }

      this.loggingService.debug(`Retrieved auth info for user`, 'execute', {
        userId: query.userId,
      });

      return {
        id: user.getId().toString(),
        email: user.getEmail().toString(),
        isActive: user.getIsActive(),
        isVerified: user.getIsVerified(),
        lastLoginAt: user.getLastLoginAt(),
      };
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

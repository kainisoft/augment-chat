import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { UserId } from '@app/domain';
import { DeleteUserCommand } from '../impl/delete-user.command';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserDeletedEvent } from '../../../domain/events/user-deleted.event';
import { UserNotFoundError } from '../../../domain/errors/user.error';
import { UserCacheService } from '../../../cache/user-cache.service';

/**
 * Delete User Command Handler
 *
 * Handles the deletion of a user profile
 */
@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly userCacheService: UserCacheService,
  ) {
    this.loggingService.setContext(DeleteUserHandler.name);
  }

  async execute(command: DeleteUserCommand): Promise<void> {
    try {
      this.loggingService.debug(`Deleting user: ${command.userId}`, 'execute', {
        userId: command.userId,
      });

      // Find user by ID
      const userIdObj = new UserId(command.userId);
      const user = await this.userRepository.findById(userIdObj);
      if (!user) {
        throw new UserNotFoundError(command.userId);
      }

      // Get authId before deletion
      const authId = user.getAuthId().toString();
      const username = user.getUsername().toString();

      // Delete user from database
      await this.userRepository.delete(userIdObj);

      // Invalidate cache
      await this.userCacheService.invalidateUserProfile(command.userId);
      await this.userCacheService.invalidateSearchResults(username);

      this.loggingService.debug(
        `Invalidated cache for deleted user ${command.userId}`,
        'execute',
        { userId: command.userId, username },
      );

      // Publish domain event
      this.eventBus.publish(new UserDeletedEvent(command.userId, authId));

      this.loggingService.debug(
        `User deleted successfully: ${command.userId}`,
        'execute',
        {
          userId: command.userId,
          authId,
        },
      );
    } catch (error) {
      // Handle specific errors
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }

      // Log error
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to delete user',
        {
          source: DeleteUserHandler.name,
          method: 'execute',
          userId: command.userId,
        },
      );

      // Re-throw error
      throw error;
    }
  }
}

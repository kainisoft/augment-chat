import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { UserId } from '@app/domain';
import { UpdateUserStatusCommand } from '../impl/update-user-status.command';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { UserStatus } from '../../../domain/models/value-objects';
import { UserStatusChangedEvent } from '../../../domain/events/user-status-changed.event';
import { UserNotFoundError } from '../../../domain/errors/user.error';
import { ValueObjectError } from '@app/common/errors/domain/business-error';
import { UserCacheService } from '../../../cache/user-cache.service';

/**
 * Update User Status Command Handler
 *
 * Handles updating a user's status
 */
@CommandHandler(UpdateUserStatusCommand)
export class UpdateUserStatusHandler
  implements ICommandHandler<UpdateUserStatusCommand>
{
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly userCacheService: UserCacheService,
  ) {
    this.loggingService.setContext(UpdateUserStatusHandler.name);
  }

  async execute(command: UpdateUserStatusCommand): Promise<void> {
    try {
      this.loggingService.debug(
        `Updating user status: ${command.userId} to ${command.status}`,
        'execute',
        { userId: command.userId, status: command.status },
      );

      // Find user by ID
      const userIdObj = new UserId(command.userId);
      const user = await this.userRepository.findById(userIdObj);
      if (!user) {
        throw new UserNotFoundError(command.userId);
      }

      // Get current status
      const currentStatus = user.getStatus().toString();

      // Update status
      try {
        const newStatus = new UserStatus(command.status);
        user.updateStatus(newStatus);
      } catch (error) {
        if (error instanceof ValueObjectError) {
          throw new BadRequestException(error.message);
        }
        throw error;
      }

      // Save user to database
      await this.userRepository.save(user);

      // Invalidate cache
      const userId = user.getId().toString();
      await this.userCacheService.invalidateUserProfile(userId);

      // No need to invalidate search results as status changes don't affect search

      this.loggingService.debug(
        `Invalidated cache for user ${userId}`,
        'execute',
        { userId, previousStatus: currentStatus, newStatus: command.status },
      );

      // Publish domain event if status changed
      if (currentStatus !== command.status) {
        this.eventBus.publish(
          new UserStatusChangedEvent(userId, currentStatus, command.status),
        );
      }

      this.loggingService.debug(
        `User status updated successfully: ${user.getId().toString()}`,
        'execute',
        {
          userId: user.getId().toString(),
          previousStatus: currentStatus,
          newStatus: command.status,
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
        'Failed to update user status',
        {
          source: UpdateUserStatusHandler.name,
          method: 'execute',
          userId: command.userId,
          status: command.status,
        },
      );

      // Re-throw error
      throw error;
    }
  }
}

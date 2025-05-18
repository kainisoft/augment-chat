import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { UpdateUserProfileCommand } from '../impl/update-user-profile.command';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import {
  UserId,
  DisplayName,
  Bio,
  AvatarUrl,
} from '../../../domain/models/value-objects';
import { UserProfileUpdatedEvent } from '../../../domain/events/user-profile-updated.event';
import { UserNotFoundError } from '../../../domain/errors/user.error';

/**
 * Update User Profile Command Handler
 *
 * Handles updating a user's profile information
 */
@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler
  implements ICommandHandler<UpdateUserProfileCommand>
{
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UpdateUserProfileHandler.name);
  }

  async execute(command: UpdateUserProfileCommand): Promise<void> {
    try {
      this.loggingService.debug(
        `Updating user profile: ${command.userId}`,
        'execute',
        { userId: command.userId },
      );

      // Find user by ID
      const userId = new UserId(command.userId);
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundError(command.userId);
      }

      // Track updated fields
      const updatedFields: string[] = [];

      // Update display name if provided
      if (command.displayName !== undefined) {
        const displayName = new DisplayName(command.displayName);
        user.updateDisplayName(displayName);
        updatedFields.push('displayName');
      }

      // Update bio if provided
      if (command.bio !== undefined) {
        const bio = new Bio(command.bio);
        user.updateBio(bio);
        updatedFields.push('bio');
      }

      // Update avatar URL if provided
      if (command.avatarUrl !== undefined) {
        const avatarUrl = new AvatarUrl(command.avatarUrl);
        user.updateAvatarUrl(avatarUrl);
        updatedFields.push('avatarUrl');
      }

      // Save user to database
      await this.userRepository.save(user);

      // Publish domain event if fields were updated
      if (updatedFields.length > 0) {
        this.eventBus.publish(
          new UserProfileUpdatedEvent(user.getId().toString(), updatedFields),
        );
      }

      this.loggingService.debug(
        `User profile updated successfully: ${user.getId().toString()}`,
        'execute',
        {
          userId: user.getId().toString(),
          updatedFields,
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
        'Failed to update user profile',
        {
          source: UpdateUserProfileHandler.name,
          method: 'execute',
          userId: command.userId,
        },
      );

      // Re-throw error
      throw error;
    }
  }
}

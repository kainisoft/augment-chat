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
import { UserCacheService } from '../../../cache/user-cache.service';

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
    private readonly userCacheService: UserCacheService,
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
      const userIdObj = new UserId(command.userId);
      const user = await this.userRepository.findById(userIdObj);
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

      // Invalidate cache
      const userId = user.getId().toString();
      await this.userCacheService.invalidateUserProfile(userId);

      // Invalidate search results cache as profile data has changed
      await this.userCacheService.invalidateSearchResults();

      this.loggingService.debug(
        `Invalidated cache for user ${userId}`,
        'execute',
        { userId, updatedFields },
      );

      // Publish domain event if fields were updated
      if (updatedFields.length > 0) {
        this.eventBus.publish(
          new UserProfileUpdatedEvent(userId, updatedFields),
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

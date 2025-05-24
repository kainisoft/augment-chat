import { Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { UserCacheService } from '../../../cache/user-cache.service';

/**
 * User Profile Updated Kafka Handler
 *
 * Handles user profile update events from the user-service via Kafka.
 * This handler invalidates the user cache when a user's profile is updated.
 */
@Injectable()
export class UserProfileUpdatedKafkaHandler {
  constructor(
    private readonly userCacheService: UserCacheService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserProfileUpdatedKafkaHandler.name);
  }

  /**
   * Handle user profile updated event
   *
   * This method is called when a user's profile is updated in the user-service.
   * It invalidates the cached user data to ensure consistency across services.
   *
   * @param event - The user profile updated event
   */
  async handle(event: any): Promise<void> {
    try {
      const { userId, updatedFields } = event;

      this.loggingService.debug(
        `Handling UserProfileUpdatedEvent from Kafka: ${userId}`,
        'handle',
        {
          userId,
          updatedFields,
        },
      );

      // Invalidate user cache since profile data has changed
      await this.userCacheService.invalidateUser(userId);

      this.loggingService.debug(
        `Invalidated user cache for profile update: ${userId}`,
        'handle',
        {
          userId,
          updatedFields,
        },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to handle UserProfileUpdatedEvent from Kafka',
        {
          source: UserProfileUpdatedKafkaHandler.name,
          method: 'handle',
          userId: event?.userId,
          updatedFields: event?.updatedFields,
        },
      );
    }
  }
}

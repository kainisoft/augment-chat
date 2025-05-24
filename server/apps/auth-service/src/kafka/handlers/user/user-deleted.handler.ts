import { Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { UserCacheService } from '../../../cache/user-cache.service';
import { PermissionCacheService } from '../../../permission/permission-cache.service';

/**
 * User Deleted Kafka Handler
 *
 * Handles user deletion events from the user-service via Kafka.
 * This handler invalidates all cached data related to the deleted user.
 */
@Injectable()
export class UserDeletedKafkaHandler {
  constructor(
    private readonly userCacheService: UserCacheService,
    private readonly permissionCacheService: PermissionCacheService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserDeletedKafkaHandler.name);
  }

  /**
   * Handle user deleted event
   *
   * This method is called when a user is deleted in the user-service.
   * It invalidates all cached data related to the user to ensure consistency.
   *
   * @param event - The user deleted event
   */
  async handle(event: any): Promise<void> {
    try {
      const { userId, authId } = event;

      this.loggingService.debug(
        `Handling UserDeletedEvent from Kafka: ${userId}`,
        'handle',
        {
          userId,
          authId,
        },
      );

      // Invalidate user cache
      await this.userCacheService.invalidateUser(userId);

      // Invalidate permission cache
      await this.permissionCacheService.invalidatePermissions(userId);

      this.loggingService.debug(
        `Invalidated all cache for deleted user: ${userId}`,
        'handle',
        {
          userId,
          authId,
        },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to handle UserDeletedEvent from Kafka',
        {
          source: UserDeletedKafkaHandler.name,
          method: 'handle',
          userId: event?.userId,
          authId: event?.authId,
        },
      );
    }
  }
}

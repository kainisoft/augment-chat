import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { UpdateUserProfileCommand } from '../../../application/commands/impl/update-user-profile.command';

/**
 * User Email Changed Event Handler
 *
 * Handles the UserEmailChangedEvent from the Auth Service.
 */
@Injectable()
export class UserEmailChangedHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserEmailChangedHandler.name);
  }

  /**
   * Handle the UserEmailChangedEvent
   * @param payload - The event payload
   */
  async handle(payload: any): Promise<void> {
    try {
      this.loggingService.debug(
        `Handling UserEmailChangedEvent for user: ${payload.userId}`,
        'handle',
        { userId: payload.userId, newEmail: payload.newEmail },
      );

      // Extract username from email (before the @ symbol)
      const username = payload.newEmail.split('@')[0];

      // Update the user profile with the new username
      await this.commandBus.execute(
        new UpdateUserProfileCommand(
          payload.userId,
          username, // Update displayName to match new username
          undefined, // Don't update bio
          undefined, // Don't update avatarUrl
        ),
      );

      this.loggingService.log(
        `User profile updated for email change: ${payload.userId}`,
        'handle',
        { userId: payload.userId, newUsername: username },
      );
    } catch (error) {
      this.errorLogger.error(
        error,
        `Error handling UserEmailChangedEvent for user: ${payload.userId}`,
        {
          userId: payload.userId,
          newEmail: payload.newEmail,
          error: error instanceof Error ? error.stack : String(error),
        },
      );
    }
  }
}

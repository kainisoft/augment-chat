import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { UserRegisteredEvent } from '@app/events';

import { CreateUserCommand } from '../../../application/commands/impl/create-user.command';

/**
 * User Registered Event Handler
 *
 * Handles the UserRegisteredEvent from the Auth Service.
 */
@Injectable()
export class UserRegisteredHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserRegisteredHandler.name);
  }

  /**
   * Handle the UserRegisteredEvent
   * @param event - The event
   */
  async handle(event: UserRegisteredEvent): Promise<void> {
    try {
      this.loggingService.debug(
        `Handling UserRegisteredEvent for user: ${event.userId}`,
        'handle',
        { userId: event.userId, email: event.email },
      );

      // Extract username from email (before the @ symbol)
      const username = event.email.split('@')[0];

      // Create a new user profile
      await this.commandBus.execute(
        new CreateUserCommand(
          event.userId, // authId
          username,
          username, // Default displayName to username
        ),
      );

      this.loggingService.log(
        `User profile created for registered user: ${event.userId}`,
        'handle',
        { userId: event.userId, username },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error handling UserRegisteredEvent for user: ${event.userId}`,
        {
          userId: event.userId,
          email: event.email,
          error: error instanceof Error ? error.stack : String(error),
        },
      );
    }
  }
}

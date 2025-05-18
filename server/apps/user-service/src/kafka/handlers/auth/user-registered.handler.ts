import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';

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
   * @param payload - The event payload
   */
  async handle(payload: any): Promise<void> {
    try {
      this.loggingService.debug(
        `Handling UserRegisteredEvent for user: ${payload.userId}`,
        'handle',
        { userId: payload.userId, email: payload.email },
      );

      // Extract username from email (before the @ symbol)
      const username = payload.email.split('@')[0];

      // Create a new user profile
      await this.commandBus.execute(
        new CreateUserCommand(
          payload.userId, // authId
          username,
          username, // Default displayName to username
        ),
      );

      this.loggingService.log(
        `User profile created for registered user: ${payload.userId}`,
        'handle',
        { userId: payload.userId, username },
      );
    } catch (error) {
      this.errorLogger.error(
        error,
        `Error handling UserRegisteredEvent for user: ${payload.userId}`,
        {
          userId: payload.userId,
          email: payload.email,
          error: error instanceof Error ? error.stack : String(error),
        },
      );
    }
  }
}

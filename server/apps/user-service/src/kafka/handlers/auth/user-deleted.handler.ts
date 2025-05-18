import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { DeleteUserCommand } from '../../../application/commands/impl/delete-user.command';

/**
 * User Deleted Event Handler
 *
 * Handles the UserDeletedEvent from the Auth Service.
 */
@Injectable()
export class UserDeletedHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserDeletedHandler.name);
  }

  /**
   * Handle the UserDeletedEvent
   * @param payload - The event payload
   */
  async handle(payload: any): Promise<void> {
    try {
      this.loggingService.debug(
        `Handling UserDeletedEvent for user: ${payload.userId}`,
        'handle',
        { userId: payload.userId },
      );

      // Delete the user profile
      await this.commandBus.execute(new DeleteUserCommand(payload.userId));

      this.loggingService.log(
        `User profile deleted for user: ${payload.userId}`,
        'handle',
        { userId: payload.userId },
      );
    } catch (error) {
      this.errorLogger.error(
        error,
        `Error handling UserDeletedEvent for user: ${payload.userId}`,
        {
          userId: payload.userId,
          error: error instanceof Error ? error.stack : String(error),
        },
      );
    }
  }
}

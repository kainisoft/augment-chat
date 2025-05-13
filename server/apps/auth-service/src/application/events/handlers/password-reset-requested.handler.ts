import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { PasswordResetRequestedEvent } from '../impl/password-reset-requested.event';

/**
 * Password Reset Requested Event Handler
 *
 * Handles side effects when a user requests a password reset
 */
@EventsHandler(PasswordResetRequestedEvent)
export class PasswordResetRequestedHandler
  implements IEventHandler<PasswordResetRequestedEvent>
{
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(PasswordResetRequestedHandler.name);
  }

  async handle(event: PasswordResetRequestedEvent): Promise<void> {
    try {
      this.loggingService.log(
        `Password reset requested for user: ${event.email}`,
        'handle',
        {
          userId: event.userId,
          timestamp: event.timestamp,
        },
      );

      // Additional side effects like sending password reset email, etc.
      // would be implemented here

      // Simulate an async operation
      await Promise.resolve();
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Error handling password reset request', {
        source: PasswordResetRequestedHandler.name,
        method: 'handle',
        userId: event.userId,
        email: event.email,
      });
    }
  }
}

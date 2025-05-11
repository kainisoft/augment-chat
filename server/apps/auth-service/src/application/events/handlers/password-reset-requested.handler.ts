import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService } from '@app/logging';

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
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext(PasswordResetRequestedHandler.name);
  }

  async handle(event: PasswordResetRequestedEvent): Promise<void> {
    this.loggingService.info(
      `Password reset requested for user: ${event.email}`,
      'handle',
      {
        userId: event.userId,
        timestamp: event.timestamp,
      },
    );

    // Additional side effects like sending password reset email, etc.
    // would be implemented here
  }
}

import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService } from '@app/logging';

import { PasswordChangedEvent } from '../impl/password-changed.event';

/**
 * Password Changed Event Handler
 *
 * Handles side effects when a user's password is changed
 */
@EventsHandler(PasswordChangedEvent)
export class PasswordChangedHandler
  implements IEventHandler<PasswordChangedEvent>
{
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext(PasswordChangedHandler.name);
  }

  async handle(event: PasswordChangedEvent): Promise<void> {
    this.loggingService.info(`Password changed for user`, 'handle', {
      userId: event.userId,
      timestamp: event.timestamp,
    });

    // Additional side effects like sending password change notification email, etc.
    // would be implemented here
  }
}

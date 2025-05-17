import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { SecurityLoggingService } from '../../../security-logging/security-logging.service';
import { SecurityEventType } from '../../../security-logging/interfaces/security-event.interface';
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
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly securityLoggingService: SecurityLoggingService,
  ) {
    this.loggingService.setContext(PasswordChangedHandler.name);
  }

  async handle(event: PasswordChangedEvent): Promise<void> {
    try {
      // Standard logging
      this.loggingService.log(`Password changed for user`, 'handle', {
        userId: event.userId,
        timestamp: event.timestamp,
      });

      // Security logging
      await this.securityLoggingService.logPasswordEvent(
        SecurityEventType.PASSWORD_CHANGED,
        {
          userId: event.userId,
          timestamp: event.timestamp.getTime(),
        },
      );

      // Additional side effects like sending password change notification email, etc.
      // would be implemented here
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(error, 'Error handling password changed event', {
        source: PasswordChangedHandler.name,
        method: 'handle',
        userId: event.userId,
      });
    }
  }
}

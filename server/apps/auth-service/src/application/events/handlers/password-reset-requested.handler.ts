import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { SecurityLoggingService } from '../../../security-logging/security-logging.service';
import { SecurityEventType } from '../../../security-logging/interfaces/security-event.interface';
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
    private readonly securityLoggingService: SecurityLoggingService,
  ) {
    this.loggingService.setContext(PasswordResetRequestedHandler.name);
  }

  async handle(event: PasswordResetRequestedEvent): Promise<void> {
    try {
      // Standard logging
      this.loggingService.log(
        `Password reset requested for user: ${event.email}`,
        'handle',
        {
          userId: event.userId,
          timestamp: event.timestamp,
        },
      );

      // Security logging
      await this.securityLoggingService.logPasswordEvent(
        SecurityEventType.PASSWORD_RESET_REQUESTED,
        {
          userId: event.userId,
          email: event.email,
          timestamp: event.timestamp.getTime(),
          requestId: `reset-${event.userId}-${event.timestamp.getTime()}`, // Generate a request ID for tracking
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

import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { SecurityLoggingService } from '../../../security-logging/security-logging.service';
import { SecurityEventType } from '../../../security-logging/interfaces/security-event.interface';
import { AllSessionsTerminatedEvent } from '../impl';

/**
 * All Sessions Terminated Event Handler
 *
 * Handles events when all sessions for a user are terminated
 */
@EventsHandler(AllSessionsTerminatedEvent)
export class AllSessionsTerminatedHandler
  implements IEventHandler<AllSessionsTerminatedEvent>
{
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly securityLoggingService: SecurityLoggingService,
  ) {
    this.loggingService.setContext(AllSessionsTerminatedHandler.name);
  }

  async handle(event: AllSessionsTerminatedEvent): Promise<void> {
    try {
      // Standard logging
      this.loggingService.debug(
        `Terminated ${event.terminatedCount} sessions for user ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          currentSessionId: event.currentSessionId,
          terminatedCount: event.terminatedCount,
        },
      );

      // Security logging
      await this.securityLoggingService.logSessionEvent(
        SecurityEventType.ALL_SESSIONS_TERMINATED,
        {
          userId: event.userId,
          sessionId: event.currentSessionId,
          terminatedCount: event.terminatedCount,
          timestamp: Date.now(),
        },
      );

      // Additional logic for session termination could be added here
      // For example, sending notifications, etc.
    } catch (error) {
      // Use ErrorLoggerService for structured error logging
      this.errorLogger.error(
        error,
        'Error handling all sessions termination event',
        {
          source: AllSessionsTerminatedHandler.name,
          method: 'handle',
          userId: event.userId,
          terminatedCount: event.terminatedCount,
        },
      );
    }
  }
}

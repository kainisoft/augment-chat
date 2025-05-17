import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService } from '@app/logging';
import { SessionTerminatedEvent } from '../impl';

/**
 * Session Terminated Event Handler
 *
 * Handles events when a session is terminated
 */
@EventsHandler(SessionTerminatedEvent)
export class SessionTerminatedHandler
  implements IEventHandler<SessionTerminatedEvent>
{
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext(SessionTerminatedHandler.name);
  }

  async handle(event: SessionTerminatedEvent): Promise<void> {
    this.loggingService.debug(
      `Session ${event.sessionId} terminated for user ${event.userId}`,
      'handle',
      {
        userId: event.userId,
        sessionId: event.sessionId,
        reason: event.reason,
      },
    );

    // Additional logic for session termination could be added here
    // For example, sending notifications, updating security logs, etc.
  }
}

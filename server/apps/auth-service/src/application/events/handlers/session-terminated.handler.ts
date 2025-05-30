import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { SessionTerminatedEvent } from '../impl';
import { KafkaProducerService } from '../../../kafka/kafka-producer.service';

/**
 * Session Terminated Event Handler
 *
 * Handles events when a session is terminated
 * and publishes the event to Kafka
 */
@EventsHandler(SessionTerminatedEvent)
export class SessionTerminatedHandler
  implements IEventHandler<SessionTerminatedEvent>
{
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(SessionTerminatedHandler.name);
  }

  async handle(event: SessionTerminatedEvent): Promise<void> {
    try {
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

      // Publish event to Kafka
      this.loggingService.debug(
        `Publishing SessionTerminatedEvent to Kafka: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          sessionId: event.sessionId,
          reason: event.reason,
        },
      );

      await this.kafkaProducerService.send('auth-events', event, event.userId);

      this.loggingService.debug(
        `Published SessionTerminatedEvent to Kafka: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          sessionId: event.sessionId,
          reason: event.reason,
        },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to handle SessionTerminatedEvent',
        {
          source: SessionTerminatedHandler.name,
          method: 'handle',
          userId: event.userId,
          sessionId: event.sessionId,
          reason: event.reason,
          error: error instanceof Error ? error.stack : String(error),
        },
      );
    }
  }
}

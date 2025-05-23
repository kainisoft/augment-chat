import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { AllSessionsTerminatedEvent } from '../impl';
import { KafkaProducerService } from '../../../kafka/kafka-producer.service';

/**
 * All Sessions Terminated Event Handler
 *
 * Handles events when all sessions for a user are terminated
 * and publishes the event to Kafka
 */
@EventsHandler(AllSessionsTerminatedEvent)
export class AllSessionsTerminatedHandler
  implements IEventHandler<AllSessionsTerminatedEvent>
{
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(AllSessionsTerminatedHandler.name);
  }

  async handle(event: AllSessionsTerminatedEvent): Promise<void> {
    try {
      this.loggingService.debug(
        `Terminated ${event.terminatedCount} sessions for user ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          currentSessionId: event.currentSessionId,
          terminatedCount: event.terminatedCount,
        },
      );

      // Additional logic for session termination could be added here
      // For example, sending notifications, updating security logs, etc.

      // Publish event to Kafka
      this.loggingService.debug(
        `Publishing AllSessionsTerminatedEvent to Kafka: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          currentSessionId: event.currentSessionId,
          terminatedCount: event.terminatedCount,
        },
      );

      await this.kafkaProducerService.send(
        'auth-events',
        event,
        event.userId,
      );

      this.loggingService.debug(
        `Published AllSessionsTerminatedEvent to Kafka: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          currentSessionId: event.currentSessionId,
          terminatedCount: event.terminatedCount,
        },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to handle AllSessionsTerminatedEvent',
        {
          source: AllSessionsTerminatedHandler.name,
          method: 'handle',
          userId: event.userId,
          currentSessionId: event.currentSessionId,
          terminatedCount: event.terminatedCount,
          error: error instanceof Error ? error.stack : String(error),
        },
      );
      throw error;
    }
  }
}

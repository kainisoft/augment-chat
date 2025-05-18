import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { KafkaProducerService } from '../../kafka-producer.service';
import { SessionTerminatedEvent } from '../../../application/events/impl/session-terminated.event';

/**
 * Session Terminated Kafka Event Handler
 *
 * Publishes SessionTerminatedEvent to Kafka
 */
@Injectable()
@EventsHandler(SessionTerminatedEvent)
export class SessionTerminatedKafkaHandler
  implements IEventHandler<SessionTerminatedEvent>
{
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(SessionTerminatedKafkaHandler.name);
  }

  async handle(event: SessionTerminatedEvent): Promise<void> {
    try {
      this.loggingService.debug(
        `Publishing SessionTerminatedEvent to Kafka: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          sessionId: event.sessionId,
          reason: event.reason,
        },
      );

      // Publish event to Kafka
      await this.kafkaProducerService.send(
        'auth-events',
        {
          type: 'SessionTerminated',
          payload: {
            userId: event.userId,
            sessionId: event.sessionId,
            reason: event.reason,
            timestamp: new Date().toISOString(),
          },
        },
        event.userId,
      );

      this.loggingService.debug(
        `Published SessionTerminatedEvent to Kafka: ${event.userId}`,
        'handle',
        { userId: event.userId, sessionId: event.sessionId, reason: event.reason },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to publish SessionTerminatedEvent to Kafka',
        {
          source: SessionTerminatedKafkaHandler.name,
          method: 'handle',
          userId: event.userId,
          sessionId: event.sessionId,
          reason: event.reason,
        },
      );
    }
  }
}

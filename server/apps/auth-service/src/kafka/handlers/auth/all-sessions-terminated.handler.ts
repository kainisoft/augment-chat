import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { KafkaProducerService } from '../../kafka-producer.service';
import { AllSessionsTerminatedEvent } from '../../../application/events/impl/all-sessions-terminated.event';

/**
 * All Sessions Terminated Kafka Event Handler
 *
 * Publishes AllSessionsTerminatedEvent to Kafka
 */
@Injectable()
@EventsHandler(AllSessionsTerminatedEvent)
export class AllSessionsTerminatedKafkaHandler
  implements IEventHandler<AllSessionsTerminatedEvent>
{
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(AllSessionsTerminatedKafkaHandler.name);
  }

  async handle(event: AllSessionsTerminatedEvent): Promise<void> {
    try {
      this.loggingService.debug(
        `Publishing AllSessionsTerminatedEvent to Kafka: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          currentSessionId: event.currentSessionId,
          terminatedCount: event.terminatedCount,
        },
      );

      // Publish event to Kafka
      await this.kafkaProducerService.send(
        'auth-events',
        {
          type: 'AllSessionsTerminated',
          payload: {
            userId: event.userId,
            currentSessionId: event.currentSessionId,
            terminatedCount: event.terminatedCount,
            timestamp: new Date().toISOString(),
          },
        },
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
        'Failed to publish AllSessionsTerminatedEvent to Kafka',
        {
          source: AllSessionsTerminatedKafkaHandler.name,
          method: 'handle',
          userId: event.userId,
          currentSessionId: event.currentSessionId,
          terminatedCount: event.terminatedCount,
        },
      );
    }
  }
}

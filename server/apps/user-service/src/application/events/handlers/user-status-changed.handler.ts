import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { UserStatusChangedEvent } from '../../../domain/events/user-status-changed.event';
import { KafkaProducerService } from '../../../kafka/kafka-producer.service';

/**
 * User Status Changed Event Handler
 *
 * Handles the UserStatusChangedEvent and publishes it to Kafka.
 */
@Injectable()
@EventsHandler(UserStatusChangedEvent)
export class UserStatusChangedHandler
  implements IEventHandler<UserStatusChangedEvent>
{
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserStatusChangedHandler.name);
  }

  async handle(event: UserStatusChangedEvent): Promise<void> {
    try {
      this.loggingService.debug(
        `Handling UserStatusChangedEvent: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          previousStatus: event.previousStatus,
          newStatus: event.newStatus,
        },
      );

      // Publish event to Kafka
      await this.kafkaProducerService.send(
        'user-events',
        {
          type: 'UserStatusChanged',
          userId: event.userId,
          previousStatus: event.previousStatus,
          newStatus: event.newStatus,
          timestamp: event.timestamp,
        },
        event.userId,
      );

      this.loggingService.debug(
        `Published UserStatusChangedEvent to Kafka: ${event.userId}`,
        'handle',
        { userId: event.userId },
      );
    } catch (error) {
      this.errorLogger.error(
        error,
        'Failed to publish UserStatusChangedEvent to Kafka',
        {
          source: UserStatusChangedHandler.name,
          method: 'handle',
          userId: event.userId,
          previousStatus: event.previousStatus,
          newStatus: event.newStatus,
        },
      );
    }
  }
}

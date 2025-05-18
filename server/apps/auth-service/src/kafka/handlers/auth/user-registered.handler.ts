import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { KafkaProducerService } from '../../kafka-producer.service';
import { UserRegisteredEvent } from '../../../application/events/impl/user-registered.event';

/**
 * User Registered Kafka Event Handler
 *
 * Publishes UserRegisteredEvent to Kafka
 */
@Injectable()
@EventsHandler(UserRegisteredEvent)
export class UserRegisteredKafkaHandler
  implements IEventHandler<UserRegisteredEvent>
{
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserRegisteredKafkaHandler.name);
  }

  async handle(event: UserRegisteredEvent): Promise<void> {
    try {
      this.loggingService.debug(
        `Publishing UserRegisteredEvent to Kafka: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          email: event.email,
        },
      );

      // Publish event to Kafka
      await this.kafkaProducerService.send(
        'auth-events',
        {
          type: 'UserRegistered',
          payload: {
            userId: event.userId,
            email: event.email,
            timestamp: event.timestamp.toISOString(),
          },
        },
        event.userId,
      );

      this.loggingService.debug(
        `Published UserRegisteredEvent to Kafka: ${event.userId}`,
        'handle',
        { userId: event.userId },
      );
    } catch (error) {
      this.errorLogger.error(
        error,
        'Failed to publish UserRegisteredEvent to Kafka',
        {
          source: UserRegisteredKafkaHandler.name,
          method: 'handle',
          userId: event.userId,
          email: event.email,
        },
      );
    }
  }
}

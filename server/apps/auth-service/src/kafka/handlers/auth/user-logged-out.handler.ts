import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { KafkaProducerService } from '../../kafka-producer.service';
import { UserLoggedOutEvent } from '../../../application/events/impl/user-logged-out.event';

/**
 * User Logged Out Kafka Event Handler
 *
 * Publishes UserLoggedOutEvent to Kafka
 */
@Injectable()
@EventsHandler(UserLoggedOutEvent)
export class UserLoggedOutKafkaHandler
  implements IEventHandler<UserLoggedOutEvent>
{
  constructor(
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserLoggedOutKafkaHandler.name);
  }

  async handle(event: UserLoggedOutEvent): Promise<void> {
    try {
      this.loggingService.debug(
        `Publishing UserLoggedOutEvent to Kafka: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          sessionId: event.sessionId,
        },
      );

      // Publish event to Kafka
      await this.kafkaProducerService.send(
        'auth-events',
        {
          type: 'UserLoggedOut',
          payload: {
            userId: event.userId,
            sessionId: event.sessionId,
            timestamp: event.timestamp.toISOString(),
          },
        },
        event.userId,
      );

      this.loggingService.debug(
        `Published UserLoggedOutEvent to Kafka: ${event.userId}`,
        'handle',
        { userId: event.userId, sessionId: event.sessionId },
      );
    } catch (error) {
      this.errorLogger.error(
        error,
        'Failed to publish UserLoggedOutEvent to Kafka',
        {
          source: UserLoggedOutKafkaHandler.name,
          method: 'handle',
          userId: event.userId,
          sessionId: event.sessionId,
        },
      );
    }
  }
}

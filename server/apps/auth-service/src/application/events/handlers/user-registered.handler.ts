import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';

import { UserRegisteredEvent } from '../impl/user-registered.event';
import { UserAuthReadRepository } from '../../../domain/repositories/user-auth-read.repository.interface';
import { KafkaProducerService } from '../../../kafka/kafka-producer.service';

/**
 * User Registered Event Handler
 *
 * Handles side effects when a user is registered and publishes the event to Kafka
 */
@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler
  implements IEventHandler<UserRegisteredEvent>
{
  constructor(
    @Inject('UserAuthReadRepository')
    private readonly userAuthReadRepository: UserAuthReadRepository,
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(UserRegisteredHandler.name);
  }

  async handle(event: UserRegisteredEvent): Promise<void> {
    this.loggingService.log(`User registered: ${event.email}`, 'handle', {
      userId: event.userId,
      timestamp: event.timestamp,
    });

    try {
      // In a real implementation, we might need to update or refresh the read model
      // For example, if we had a separate read database, we would update it here
      const userInfo = await this.userAuthReadRepository.findById(event.userId);

      if (userInfo) {
        this.loggingService.debug(
          `Read model for user ${event.userId} is available`,
          'handle',
          { userId: event.userId },
        );
      } else {
        this.loggingService.warn(
          `Read model for user ${event.userId} not found`,
          'handle',
          { userId: event.userId },
        );
      }

      // Additional side effects like sending welcome email, etc.
      // would be implemented here

      // Publish event to Kafka
      this.loggingService.debug(
        `Publishing UserRegisteredEvent to Kafka: ${event.userId}`,
        'handle',
        {
          userId: event.userId,
          email: event.email,
        },
      );

      await this.kafkaProducerService.send('auth-events', event, event.userId);

      this.loggingService.debug(
        `Published UserRegisteredEvent to Kafka: ${event.userId}`,
        'handle',
        { userId: event.userId },
      );
    } catch (error) {
      // Use the ErrorLoggerService to log the error with context
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error handling UserRegisteredEvent for user: ${event.userId}`,
        {
          userId: event.userId,
          error: error instanceof Error ? error.stack : String(error),
        },
      );

      throw error;
    }
  }
}

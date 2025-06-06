import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { MessageReadEvent } from '../message-read.event';
import { KafkaProducerService } from '../../../kafka/kafka-producer.service';

/**
 * Message Read Event Handler
 *
 * Handles MessageReadEvent for real-time notifications and Kafka publishing.
 */
@EventsHandler(MessageReadEvent)
@Injectable()
export class MessageReadHandler implements IEventHandler<MessageReadEvent> {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {
    this.loggingService.setContext(MessageReadHandler.name);
  }

  async handle(event: MessageReadEvent): Promise<void> {
    try {
      this.loggingService.debug(
        `Handling MessageReadEvent for message: ${event.messageId}`,
        'handle',
        {
          messageId: event.messageId,
          userId: event.userId,
          conversationId: event.conversationId,
          readAt: event.readAt,
        },
      );

      // Publish event to Kafka for inter-service communication
      await this.kafkaProducerService.send(
        'chat-events',
        event,
        event.messageId,
      );

      this.loggingService.log(
        `Message ${event.messageId} marked as read by user ${event.userId}`,
        'handle',
        {
          messageId: event.messageId,
          userId: event.userId,
          conversationId: event.conversationId,
        },
      );

      this.loggingService.debug(
        `Published MessageReadEvent to Kafka: ${event.messageId}`,
        'handle',
        { messageId: event.messageId, userId: event.userId },
      );

      // TODO: Implement real-time notification via WebSocket subscriptions
      // TODO: Update conversation unread counts
      // TODO: Update read receipts for other participants
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to handle MessageReadEvent',
        {
          source: MessageReadHandler.name,
          method: 'handle',
          messageId: event.messageId,
          userId: event.userId,
          conversationId: event.conversationId,
        },
      );
    }
  }
}

import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { MarkMessageReadCommand } from '../mark-message-read.command';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { MessageId } from '../../../domain/value-objects/message-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { MessageReadEvent } from '../../events/message-read.event';

/**
 * Mark Message Read Command Handler
 *
 * Handles the MarkMessageReadCommand following the CQRS pattern.
 */
@CommandHandler(MarkMessageReadCommand)
@Injectable()
export class MarkMessageReadHandler
  implements ICommandHandler<MarkMessageReadCommand>
{
  constructor(
    @Inject('MessageRepository')
    private readonly messageRepository: MessageRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(MarkMessageReadHandler.name);
  }

  async execute(command: MarkMessageReadCommand): Promise<void> {
    try {
      this.loggingService.debug(
        `Marking message as read: ${command.messageId} for user: ${command.userId}`,
        'execute',
        {
          messageId: command.messageId,
          userId: command.userId,
        },
      );

      // Verify the message exists
      const messageId = new MessageId(command.messageId);
      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        throw new Error(`Message with ID ${command.messageId} not found`);
      }

      // Mark as read using repository method (updates MongoDB directly and also marks as delivered)
      const userId = new UserId(command.userId);
      await this.messageRepository.markAsRead(messageId, userId);

      // Publish domain event for real-time updates
      await this.eventBus.publish(
        new MessageReadEvent(
          command.messageId,
          command.userId,
          message.getConversationId().toString(),
          new Date(),
        ),
      );

      this.loggingService.debug(
        `Message marked as read successfully: ${command.messageId} for user: ${command.userId}`,
        'execute',
        {
          messageId: command.messageId,
          userId: command.userId,
        },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error marking message as read: ${command.messageId}`,
        {
          source: MarkMessageReadHandler.name,
          method: 'execute',
          messageId: command.messageId,
          userId: command.userId,
        },
      );
      throw error;
    }
  }
}

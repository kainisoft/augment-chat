import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { DeleteMessageCommand } from '../delete-message.command';
import { MessageRepository } from '../../../domain/repositories/message.repository';
import { MessageId } from '../../../domain/value-objects/message-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';

/**
 * Delete Message Command Handler
 *
 * Handles the DeleteMessageCommand following the CQRS pattern.
 */
@CommandHandler(DeleteMessageCommand)
@Injectable()
export class DeleteMessageHandler
  implements ICommandHandler<DeleteMessageCommand>
{
  constructor(
    @Inject('MessageRepository')
    private readonly messageRepository: MessageRepository,
    private readonly eventBus: EventBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(DeleteMessageHandler.name);
  }

  async execute(command: DeleteMessageCommand): Promise<void> {
    try {
      this.loggingService.debug(
        `Deleting message: ${command.messageId}`,
        'execute',
        {
          messageId: command.messageId,
          senderId: command.senderId,
        },
      );

      // Find the message
      const messageId = new MessageId(command.messageId);
      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        throw new Error(`Message with ID ${command.messageId} not found`);
      }

      // Validate sender can delete the message
      const senderId = new UserId(command.senderId);
      if (!message.canBeDeletedBy(senderId)) {
        throw new Error(
          `User ${command.senderId} is not authorized to delete message ${command.messageId}`,
        );
      }

      // Delete the message
      await this.messageRepository.delete(messageId);

      this.loggingService.debug(
        `Message deleted successfully: ${command.messageId}`,
        'execute',
        {
          messageId: command.messageId,
          senderId: command.senderId,
        },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error deleting message: ${command.messageId}`,
        {
          source: DeleteMessageHandler.name,
          method: 'execute',
          messageId: command.messageId,
          senderId: command.senderId,
        },
      );
      throw error;
    }
  }
}

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { GetMessageQuery } from '../get-message.query';
import { MessageReadRepository } from '../../../domain/repositories/message-read.repository';
import { ConversationReadRepository } from '../../../domain/repositories/conversation-read.repository';
import { MessageReadModel } from '../../../domain/read-models/message.read-model';
import { MessageId } from '../../../domain/value-objects/message-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';

/**
 * Get Message Query Handler
 *
 * Handles the GetMessageQuery following the CQRS pattern.
 */
@QueryHandler(GetMessageQuery)
@Injectable()
export class GetMessageHandler
  implements IQueryHandler<GetMessageQuery, MessageReadModel>
{
  constructor(
    @Inject('MessageReadRepository')
    private readonly messageReadRepository: MessageReadRepository,
    @Inject('ConversationReadRepository')
    private readonly conversationReadRepository: ConversationReadRepository,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(GetMessageHandler.name);
  }

  async execute(query: GetMessageQuery): Promise<MessageReadModel> {
    try {
      this.loggingService.debug(
        `Getting message by ID: ${query.messageId}`,
        'execute',
        {
          messageId: query.messageId,
          userId: query.userId,
        },
      );

      const messageId = new MessageId(query.messageId);
      const userId = new UserId(query.userId);

      // Get message
      const message = await this.messageReadRepository.findById(messageId);
      if (!message) {
        throw new NotFoundException(
          `Message with ID ${query.messageId} not found`,
        );
      }

      // Check if user is participant in the conversation
      const conversation = await this.conversationReadRepository.findById(
        message.conversationId,
      );
      if (
        !conversation ||
        !conversation.participants.some((p) => p.equals(userId))
      ) {
        throw new ForbiddenException(
          'User is not authorized to view this message',
        );
      }

      this.loggingService.debug(
        `Retrieved message by ID: ${query.messageId}`,
        'execute',
        {
          messageId: query.messageId,
          userId: query.userId,
          conversationId: message.conversationId.toString(),
        },
      );

      return message;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting message by ID: ${query.messageId}`,
        {
          source: GetMessageHandler.name,
          method: 'execute',
          messageId: query.messageId,
          userId: query.userId,
        },
      );
      throw error;
    }
  }
}

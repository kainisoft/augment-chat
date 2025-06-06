import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { GetConversationMessagesQuery } from '../get-conversation-messages.query';
import { MessageReadRepository } from '../../../domain/repositories/message-read.repository';
import { ConversationReadRepository } from '../../../domain/repositories/conversation-read.repository';
import { MessageReadModel } from '../../../domain/read-models/message.read-model';
import { ConversationId } from '../../../domain/value-objects/conversation-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';

/**
 * Get Conversation Messages Query Handler
 *
 * Handles the GetConversationMessagesQuery following the CQRS pattern.
 */
@QueryHandler(GetConversationMessagesQuery)
@Injectable()
export class GetConversationMessagesHandler
  implements IQueryHandler<GetConversationMessagesQuery, MessageReadModel[]>
{
  constructor(
    @Inject('MessageReadRepository')
    private readonly messageReadRepository: MessageReadRepository,
    @Inject('ConversationReadRepository')
    private readonly conversationReadRepository: ConversationReadRepository,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(GetConversationMessagesHandler.name);
  }

  async execute(
    query: GetConversationMessagesQuery,
  ): Promise<MessageReadModel[]> {
    try {
      this.loggingService.debug(
        `Getting messages for conversation: ${query.conversationId}`,
        'execute',
        {
          conversationId: query.conversationId,
          userId: query.userId,
          limit: query.limit,
          offset: query.offset,
        },
      );

      const conversationId = new ConversationId(query.conversationId);
      const userId = new UserId(query.userId);

      // Check if conversation exists and user is participant
      const conversation =
        await this.conversationReadRepository.findById(conversationId);
      if (!conversation) {
        throw new NotFoundException(
          `Conversation with ID ${query.conversationId} not found`,
        );
      }

      if (!conversation.participants.some((p) => p.equals(userId))) {
        throw new ForbiddenException(
          'User is not authorized to view messages in this conversation',
        );
      }

      // Get messages with pagination
      const options = {
        limit: query.limit,
        offset: query.offset,
        orderBy: 'createdAt',
        orderDirection: 'desc' as const,
      };

      const messages = await this.messageReadRepository.findByConversationId(
        conversationId,
        options,
      );

      this.loggingService.debug(
        `Retrieved ${messages.length} messages for conversation: ${query.conversationId}`,
        'execute',
        {
          conversationId: query.conversationId,
          userId: query.userId,
          count: messages.length,
        },
      );

      return messages;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting messages for conversation: ${query.conversationId}`,
        {
          source: GetConversationMessagesHandler.name,
          method: 'execute',
          conversationId: query.conversationId,
          userId: query.userId,
        },
      );
      throw error;
    }
  }
}

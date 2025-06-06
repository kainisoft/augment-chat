import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { GetConversationQuery } from '../get-conversation.query';
import { ConversationReadRepository } from '../../../domain/repositories/conversation-read.repository';
import { ConversationReadModel } from '../../../domain/read-models/conversation.read-model';
import { ConversationId } from '../../../domain/value-objects/conversation-id.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';

/**
 * Get Conversation Query Handler
 *
 * Handles the GetConversationQuery following the CQRS pattern.
 */
@QueryHandler(GetConversationQuery)
@Injectable()
export class GetConversationHandler
  implements IQueryHandler<GetConversationQuery, ConversationReadModel>
{
  constructor(
    @Inject('ConversationReadRepository')
    private readonly conversationReadRepository: ConversationReadRepository,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(GetConversationHandler.name);
  }

  async execute(query: GetConversationQuery): Promise<ConversationReadModel> {
    try {
      this.loggingService.debug(
        `Getting conversation by ID: ${query.conversationId}`,
        'execute',
        {
          conversationId: query.conversationId,
          userId: query.userId,
        },
      );

      const conversationId = new ConversationId(query.conversationId);
      const userId = new UserId(query.userId);

      // Get conversation
      const conversation =
        await this.conversationReadRepository.findById(conversationId);
      if (!conversation) {
        throw new NotFoundException(
          `Conversation with ID ${query.conversationId} not found`,
        );
      }

      // Check if user is participant
      if (!conversation.participants.some((p) => p.equals(userId))) {
        throw new ForbiddenException(
          'User is not authorized to view this conversation',
        );
      }

      this.loggingService.debug(
        `Retrieved conversation by ID: ${query.conversationId}`,
        'execute',
        {
          conversationId: query.conversationId,
          userId: query.userId,
          type: conversation.type,
        },
      );

      return conversation;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting conversation by ID: ${query.conversationId}`,
        {
          source: GetConversationHandler.name,
          method: 'execute',
          conversationId: query.conversationId,
          userId: query.userId,
        },
      );
      throw error;
    }
  }
}

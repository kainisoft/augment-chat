import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { GetUserConversationsQuery } from '../get-user-conversations.query';
import { ConversationReadRepository } from '../../../domain/repositories/conversation-read.repository';
import { ConversationReadModel } from '../../../domain/read-models/conversation.read-model';
import { UserId } from '../../../domain/value-objects/user-id.vo';

/**
 * Get User Conversations Query Handler
 *
 * Handles the GetUserConversationsQuery following the CQRS pattern.
 */
@QueryHandler(GetUserConversationsQuery)
@Injectable()
export class GetUserConversationsHandler
  implements IQueryHandler<GetUserConversationsQuery, ConversationReadModel[]>
{
  constructor(
    @Inject('ConversationReadRepository')
    private readonly conversationReadRepository: ConversationReadRepository,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(GetUserConversationsHandler.name);
  }

  async execute(
    query: GetUserConversationsQuery,
  ): Promise<ConversationReadModel[]> {
    try {
      this.loggingService.debug(
        `Getting conversations for user: ${query.userId}`,
        'execute',
        {
          userId: query.userId,
          limit: query.limit,
          offset: query.offset,
        },
      );

      const userId = new UserId(query.userId);

      // Get conversations with pagination
      const options = {
        limit: query.limit,
        offset: query.offset,
        orderBy: 'lastMessageAt',
        orderDirection: 'desc' as const,
      };

      const conversations =
        await this.conversationReadRepository.findByParticipant(
          userId,
          options,
        );

      this.loggingService.debug(
        `Retrieved ${conversations.length} conversations for user: ${query.userId}`,
        'execute',
        {
          userId: query.userId,
          count: conversations.length,
        },
      );

      return conversations;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting conversations for user: ${query.userId}`,
        {
          source: GetUserConversationsHandler.name,
          method: 'execute',
          userId: query.userId,
        },
      );
      throw error;
    }
  }
}

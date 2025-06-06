import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import {
  ConversationType,
  ConversationConnection,
  CreateConversationInput,
  UpdateConversationInput,
  DeleteConversationResponse,
  AddParticipantsInput,
  RemoveParticipantsInput,
} from '../types';
import { CreateConversationCommand } from '../../application/commands/create-conversation.command';
import { GetConversationQuery } from '../../application/queries/get-conversation.query';
import { GetUserConversationsQuery } from '../../application/queries/get-user-conversations.query';
import { AuthenticatedRequest } from '@app/security';

/**
 * Conversation Resolver
 *
 * Handles GraphQL operations for conversations including queries and mutations.
 */
@Resolver(() => ConversationType)
export class ConversationResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(ConversationResolver.name);
  }

  /**
   * Get a conversation by ID
   */
  @Query(() => ConversationType, {
    name: 'conversation',
    description: 'Get a conversation by ID',
    nullable: true,
  })
  async getConversationById(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: AuthenticatedRequest,
  ): Promise<ConversationType | null> {
    try {
      this.loggingService.debug(
        `Getting conversation by ID: ${id}`,
        'getConversationById',
        {
          conversationId: id,
        },
      );

      // Get current user from context
      const currentUserId = context.user?.sub || 'anonymous-user';

      const conversation = await this.queryBus.execute(
        new GetConversationQuery(id, currentUserId),
      );

      if (!conversation) {
        return null;
      }

      return {
        id: conversation.id.toString(),
        type: conversation.type,
        participants: conversation.participants.map(p => p.toString()),
        name: conversation.name,
        description: conversation.description,
        avatar: conversation.avatar,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount: 0, // TODO: Calculate unread count
        messageCount: 0, // TODO: Calculate message count
      } as ConversationType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting conversation by ID: ${id}`,
        {
          source: ConversationResolver.name,
          method: 'getConversationById',
          conversationId: id,
        },
      );
      throw error;
    }
  }

  /**
   * Get conversations for the current user
   */
  @Query(() => ConversationConnection, {
    name: 'conversations',
    description: 'Get conversations for the current user with pagination',
  })
  async getConversations(
    @Args('limit', { type: () => Number, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Number, defaultValue: 0 }) offset: number,
  ): Promise<ConversationConnection> {
    try {
      this.loggingService.debug(
        'Getting conversations for current user',
        'getConversations',
        {
          limit,
          offset,
        },
      );

      // TODO: Implement with CQRS query handler
      // const conversations = await this.queryBus.execute(
      //   new GetUserConversationsQuery(currentUserId, limit, offset)
      // );

      // Temporary mock response for testing
      const mockConversations: ConversationType[] = [
        {
          id: 'conv-1',
          type: 'private' as any,
          participants: ['user-123', 'user-456'],
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessageAt: new Date(),
          unreadCount: 2,
          messageCount: 15,
        },
        {
          id: 'conv-2',
          type: 'group' as any,
          participants: ['user-123', 'user-456', 'user-789'],
          name: 'Team Chat',
          description: 'Our team discussion',
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessageAt: new Date(),
          unreadCount: 0,
          messageCount: 42,
        },
      ];

      return {
        items: mockConversations,
        totalCount: mockConversations.length,
        count: mockConversations.length,
        hasMore: false,
        offset,
        limit,
      } as ConversationConnection;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Error getting conversations for current user',
        {
          source: ConversationResolver.name,
          method: 'getConversations',
        },
      );
      throw error;
    }
  }

  /**
   * Create a new conversation
   */
  @Mutation(() => ConversationType, {
    name: 'createConversation',
    description: 'Create a new conversation',
  })
  async createConversation(
    @Args('input') input: CreateConversationInput,
    @Context() context: AuthenticatedRequest,
  ): Promise<ConversationType> {
    try {
      this.loggingService.debug(
        `Creating ${input.type} conversation`,
        'createConversation',
        {
          type: input.type,
          participantCount: input.participants.length,
          name: input.name,
        },
      );

      // Get current user from context
      const currentUserId = context.user?.sub || 'anonymous-user';

      await this.commandBus.execute(
        new CreateConversationCommand(
          input.type,
          input.participants,
          currentUserId,
          input.name,
          input.description,
          input.avatar,
        ),
      );

      // Return a success response (in real implementation, we might want to return the created conversation)
      return {
        id: `conv-${Date.now()}`,
        type: input.type,
        participants: input.participants,
        name: input.name,
        description: input.description,
        avatar: input.avatar,
        createdAt: new Date(),
        updatedAt: new Date(),
        unreadCount: 0,
        messageCount: 0,
      } as ConversationType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error creating ${input.type} conversation`,
        {
          source: ConversationResolver.name,
          method: 'createConversation',
          type: input.type,
          participantCount: input.participants.length,
        },
      );
      throw error;
    }
  }

  /**
   * Update a conversation
   */
  @Mutation(() => ConversationType, {
    name: 'updateConversation',
    description: 'Update an existing conversation',
  })
  async updateConversation(
    @Args('conversationId', { type: () => ID }) conversationId: string,
    @Args('input') input: UpdateConversationInput,
  ): Promise<ConversationType> {
    try {
      this.loggingService.debug(
        `Updating conversation: ${conversationId}`,
        'updateConversation',
        {
          conversationId,
          name: input.name,
        },
      );

      // TODO: Implement with CQRS command handler
      // await this.commandBus.execute(
      //   new UpdateConversationCommand(conversationId, input.name, input.description, input.avatar)
      // );

      // Temporary mock response for testing
      return {
        id: conversationId,
        type: 'group' as any,
        participants: ['user-123', 'user-456'],
        name: input.name || 'Updated Conversation',
        description: input.description,
        avatar: input.avatar,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(),
        unreadCount: 0,
        messageCount: 10,
      } as ConversationType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error updating conversation: ${conversationId}`,
        {
          source: ConversationResolver.name,
          method: 'updateConversation',
          conversationId,
        },
      );
      throw error;
    }
  }

  /**
   * Delete a conversation
   */
  @Mutation(() => DeleteConversationResponse, {
    name: 'deleteConversation',
    description: 'Delete a conversation',
  })
  async deleteConversation(
    @Args('conversationId', { type: () => ID }) conversationId: string,
  ): Promise<DeleteConversationResponse> {
    try {
      this.loggingService.debug(
        `Deleting conversation: ${conversationId}`,
        'deleteConversation',
        { conversationId },
      );

      // TODO: Implement with CQRS command handler
      // await this.commandBus.execute(new DeleteConversationCommand(conversationId));

      return {
        success: true,
        conversationId,
      };
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error deleting conversation: ${conversationId}`,
        {
          source: ConversationResolver.name,
          method: 'deleteConversation',
          conversationId,
        },
      );

      return {
        success: false,
        conversationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

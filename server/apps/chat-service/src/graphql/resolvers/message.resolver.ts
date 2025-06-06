import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import {
  MessageType,
  MessageConnection,
  SendMessageInput,
  UpdateMessageInput,
  DeleteMessageResponse,
  AddReactionInput,
  AddReactionResponse,
  RemoveReactionResponse,
} from '../types';
import { SendMessageCommand } from '../../application/commands/send-message.command';
import { UpdateMessageCommand } from '../../application/commands/update-message.command';
import { DeleteMessageCommand } from '../../application/commands/delete-message.command';
import { GetMessageQuery } from '../../application/queries/get-message.query';
import { GetConversationMessagesQuery } from '../../application/queries/get-conversation-messages.query';
import { AuthenticatedRequest } from '@app/security';

/**
 * Message Resolver
 *
 * Handles GraphQL operations for messages including queries and mutations.
 */
@Resolver(() => MessageType)
export class MessageResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(MessageResolver.name);
  }

  /**
   * Get a message by ID
   */
  @Query(() => MessageType, {
    name: 'message',
    description: 'Get a message by ID',
    nullable: true,
  })
  async getMessageById(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: AuthenticatedRequest,
  ): Promise<MessageType | null> {
    try {
      this.loggingService.debug(
        `Getting message by ID: ${id}`,
        'getMessageById',
        {
          messageId: id,
        },
      );

      // Get current user from context (will be implemented with authentication)
      const currentUserId = context.user?.sub || 'anonymous-user';

      const message = await this.queryBus.execute(
        new GetMessageQuery(id, currentUserId),
      );

      if (!message) {
        return null;
      }

      return {
        id: message.id.toString(),
        conversationId: message.conversationId.toString(),
        senderId: message.senderId.toString(),
        content: message.content,
        messageType: message.messageType,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        replyTo: message.replyTo?.toString(),
        attachments: message.attachments,
      } as MessageType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting message by ID: ${id}`,
        {
          source: MessageResolver.name,
          method: 'getMessageById',
          messageId: id,
        },
      );
      throw error;
    }
  }

  /**
   * Get messages for a conversation
   */
  @Query(() => MessageConnection, {
    name: 'messages',
    description: 'Get messages for a conversation with pagination',
  })
  async getMessages(
    @Args('conversationId', { type: () => ID }) conversationId: string,
    @Args('limit', { type: () => Number, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Number, defaultValue: 0 }) offset: number,
    @Context() context: AuthenticatedRequest,
  ): Promise<MessageConnection> {
    try {
      this.loggingService.debug(
        `Getting messages for conversation: ${conversationId}`,
        'getMessages',
        {
          conversationId,
          limit,
          offset,
        },
      );

      // Get current user from context
      const currentUserId = context.user?.sub || 'anonymous-user';

      const messages = await this.queryBus.execute(
        new GetConversationMessagesQuery(conversationId, currentUserId, limit, offset),
      );

      const messageTypes: MessageType[] = messages.map(message => ({
        id: message.id.toString(),
        conversationId: message.conversationId.toString(),
        senderId: message.senderId.toString(),
        content: message.content,
        messageType: message.messageType,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        replyTo: message.replyTo?.toString(),
        attachments: message.attachments,
      }));

      return {
        items: messageTypes,
        totalCount: messageTypes.length,
        count: messageTypes.length,
        hasMore: messageTypes.length === limit,
        offset,
        limit,
      } as MessageConnection;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error getting messages for conversation: ${conversationId}`,
        {
          source: MessageResolver.name,
          method: 'getMessages',
          conversationId,
        },
      );
      throw error;
    }
  }

  /**
   * Send a new message
   */
  @Mutation(() => MessageType, {
    name: 'sendMessage',
    description: 'Send a new message to a conversation',
  })
  async sendMessage(
    @Args('input') input: SendMessageInput,
    @Context() context: AuthenticatedRequest,
  ): Promise<MessageType> {
    try {
      this.loggingService.debug(
        `Sending message to conversation: ${input.conversationId}`,
        'sendMessage',
        {
          conversationId: input.conversationId,
          contentLength: input.content.length,
          messageType: input.messageType,
        },
      );

      // Get current user from context
      const currentUserId = context.user?.sub || 'anonymous-user';

      await this.commandBus.execute(
        new SendMessageCommand(
          input.conversationId,
          currentUserId,
          input.content,
          input.messageType || 'text',
          input.replyTo,
          input.attachments,
        ),
      );

      // Return a success response (in real implementation, we might want to return the created message)
      return {
        id: `msg-${Date.now()}`,
        conversationId: input.conversationId,
        senderId: currentUserId,
        content: input.content,
        createdAt: new Date(),
        updatedAt: new Date(),
        messageType: input.messageType || 'text',
        replyTo: input.replyTo,
        attachments: input.attachments,
      } as MessageType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error sending message to conversation: ${input.conversationId}`,
        {
          source: MessageResolver.name,
          method: 'sendMessage',
          conversationId: input.conversationId,
        },
      );
      throw error;
    }
  }

  /**
   * Update a message
   */
  @Mutation(() => MessageType, {
    name: 'updateMessage',
    description: 'Update an existing message',
  })
  async updateMessage(
    @Args('messageId', { type: () => ID }) messageId: string,
    @Args('input') input: UpdateMessageInput,
    @Context() context: AuthenticatedRequest,
  ): Promise<MessageType> {
    try {
      this.loggingService.debug(
        `Updating message: ${messageId}`,
        'updateMessage',
        {
          messageId,
          contentLength: input.content.length,
        },
      );

      // Get current user from context
      const currentUserId = context.user?.sub || 'anonymous-user';

      await this.commandBus.execute(
        new UpdateMessageCommand(messageId, currentUserId, input.content),
      );

      // Get updated message to return
      const updatedMessage = await this.queryBus.execute(
        new GetMessageQuery(messageId, currentUserId),
      );

      if (!updatedMessage) {
        throw new Error(`Message with ID ${messageId} not found after update`);
      }

      return {
        id: updatedMessage.id.toString(),
        conversationId: updatedMessage.conversationId.toString(),
        senderId: updatedMessage.senderId.toString(),
        content: updatedMessage.content,
        messageType: updatedMessage.messageType,
        createdAt: updatedMessage.createdAt,
        updatedAt: updatedMessage.updatedAt,
        replyTo: updatedMessage.replyTo?.toString(),
        attachments: updatedMessage.attachments,
      } as MessageType;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error updating message: ${messageId}`,
        {
          source: MessageResolver.name,
          method: 'updateMessage',
          messageId,
        },
      );
      throw error;
    }
  }

  /**
   * Delete a message
   */
  @Mutation(() => DeleteMessageResponse, {
    name: 'deleteMessage',
    description: 'Delete a message',
  })
  async deleteMessage(
    @Args('messageId', { type: () => ID }) messageId: string,
    @Context() context: AuthenticatedRequest,
  ): Promise<DeleteMessageResponse> {
    try {
      this.loggingService.debug(
        `Deleting message: ${messageId}`,
        'deleteMessage',
        { messageId },
      );

      // Get current user from context
      const currentUserId = context.user?.sub || 'anonymous-user';

      await this.commandBus.execute(
        new DeleteMessageCommand(messageId, currentUserId),
      );

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error deleting message: ${messageId}`,
        {
          source: MessageResolver.name,
          method: 'deleteMessage',
          messageId,
        },
      );

      return {
        success: false,
        messageId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

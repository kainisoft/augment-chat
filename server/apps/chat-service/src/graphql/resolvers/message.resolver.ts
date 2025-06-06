import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Context,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import {
  MessageType,
  MessageTypeEnum,
  MessageConnection,
  SendMessageInput,
  UpdateMessageInput,
  DeleteMessageResponse,
  MarkMessageDeliveredInput,
  MarkMessageReadInput,
  MessageStatusUpdateResponse,
  StartTypingInput,
  StopTypingInput,
  TypingStatusResponse,
} from '../types';
import { SendMessageCommand } from '../../application/commands/send-message.command';
import { UpdateMessageCommand } from '../../application/commands/update-message.command';
import { DeleteMessageCommand } from '../../application/commands/delete-message.command';
import { MarkMessageDeliveredCommand } from '../../application/commands/mark-message-delivered.command';
import { MarkMessageReadCommand } from '../../application/commands/mark-message-read.command';
import { StartTypingCommand } from '../../application/commands/start-typing.command';
import { StopTypingCommand } from '../../application/commands/stop-typing.command';
import { GetMessageQuery } from '../../application/queries/get-message.query';
import { GetConversationMessagesQuery } from '../../application/queries/get-conversation-messages.query';
import { AuthenticatedRequest } from '@app/security';
import { MessageReadModel } from '../../domain/read-models/message.read-model';
import {
  SubscriptionService,
  MessageEvent,
  MessageStatusEvent,
} from '../services/subscription.service';

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
    private readonly subscriptionService: SubscriptionService,
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
        new GetConversationMessagesQuery(
          conversationId,
          currentUserId,
          limit,
          offset,
        ),
      );

      const messageTypes: MessageType[] = messages.map((message) => ({
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

      // Create the message response
      const messageResponse: MessageType = {
        id: `msg-${Date.now()}`,
        conversationId: input.conversationId,
        senderId: currentUserId,
        content: input.content,
        createdAt: new Date(),
        updatedAt: new Date(),
        messageType: input.messageType || MessageTypeEnum.TEXT,
        replyTo: input.replyTo,
        attachments:
          input.attachments?.map((attachment, index) => ({
            id: `att-${Date.now()}-${index}`,
            fileName: attachment,
            originalName: attachment,
            fileType: 'application/octet-stream',
            fileSize: 0,
            storageUrl: attachment,
            createdAt: new Date(),
          })) || [],
      };

      // Publish real-time event for subscribers
      try {
        await this.subscriptionService.publishMessageEvent({
          type: 'message.received',
          timestamp: Date.now(),
          source: 'chat-service',
          conversationId: input.conversationId,
          data: messageResponse,
        });

        this.loggingService.debug(
          `Published real-time message event for conversation: ${input.conversationId}`,
          'sendMessage',
        );
      } catch (eventError) {
        // Log the error but don't fail the message sending
        this.loggingService.error(
          `Failed to publish real-time event: ${eventError instanceof Error ? eventError.message : 'Unknown error'}`,
          'sendMessage',
        );
      }

      return messageResponse;
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

  /**
   * Mark message as delivered
   */
  @Mutation(() => MessageStatusUpdateResponse, {
    name: 'markMessageDelivered',
    description: 'Mark a message as delivered to the current user',
  })
  async markMessageDelivered(
    @Args('input') input: MarkMessageDeliveredInput,
    @Context() context: AuthenticatedRequest,
  ): Promise<MessageStatusUpdateResponse> {
    try {
      this.loggingService.debug(
        `Marking message as delivered: ${input.messageId}`,
        'markMessageDelivered',
        { messageId: input.messageId },
      );

      // Get current user from context
      const currentUserId = context.user?.sub || 'anonymous-user';

      await this.commandBus.execute(
        new MarkMessageDeliveredCommand(input.messageId, currentUserId),
      );

      return {
        success: true,
        messageId: input.messageId,
        statusType: 'delivered',
        userId: currentUserId,
      };
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error marking message as delivered: ${input.messageId}`,
        {
          source: MessageResolver.name,
          method: 'markMessageDelivered',
          messageId: input.messageId,
        },
      );

      return {
        success: false,
        messageId: input.messageId,
        statusType: 'delivered',
        userId: context.user?.sub || 'anonymous-user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Mark message as read
   */
  @Mutation(() => MessageStatusUpdateResponse, {
    name: 'markMessageRead',
    description: 'Mark a message as read by the current user',
  })
  async markMessageRead(
    @Args('input') input: MarkMessageReadInput,
    @Context() context: AuthenticatedRequest,
  ): Promise<MessageStatusUpdateResponse> {
    try {
      this.loggingService.debug(
        `Marking message as read: ${input.messageId}`,
        'markMessageRead',
        { messageId: input.messageId },
      );

      // Get current user from context
      const currentUserId = context.user?.sub || 'anonymous-user';

      await this.commandBus.execute(
        new MarkMessageReadCommand(input.messageId, currentUserId),
      );

      return {
        success: true,
        messageId: input.messageId,
        statusType: 'read',
        userId: currentUserId,
      };
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error marking message as read: ${input.messageId}`,
        {
          source: MessageResolver.name,
          method: 'markMessageRead',
          messageId: input.messageId,
        },
      );

      return {
        success: false,
        messageId: input.messageId,
        statusType: 'read',
        userId: context.user?.sub || 'anonymous-user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Start typing indicator
   */
  @Mutation(() => TypingStatusResponse, {
    name: 'startTyping',
    description: 'Start typing indicator in a conversation',
  })
  async startTyping(
    @Args('input') input: StartTypingInput,
    @Context() context: AuthenticatedRequest,
  ): Promise<TypingStatusResponse> {
    try {
      this.loggingService.debug(
        `Starting typing indicator for conversation: ${input.conversationId}`,
        'startTyping',
        { conversationId: input.conversationId },
      );

      // Get current user from context
      const currentUserId = context.user?.sub || 'anonymous-user';

      await this.commandBus.execute(
        new StartTypingCommand(input.conversationId, currentUserId),
      );

      return {
        success: true,
        conversationId: input.conversationId,
        userId: currentUserId,
        isTyping: true,
      };
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error starting typing indicator for conversation: ${input.conversationId}`,
        {
          source: MessageResolver.name,
          method: 'startTyping',
          conversationId: input.conversationId,
        },
      );

      return {
        success: false,
        conversationId: input.conversationId,
        userId: context.user?.sub || 'anonymous-user',
        isTyping: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Stop typing indicator
   */
  @Mutation(() => TypingStatusResponse, {
    name: 'stopTyping',
    description: 'Stop typing indicator in a conversation',
  })
  async stopTyping(
    @Args('input') input: StopTypingInput,
    @Context() context: AuthenticatedRequest,
  ): Promise<TypingStatusResponse> {
    try {
      this.loggingService.debug(
        `Stopping typing indicator for conversation: ${input.conversationId}`,
        'stopTyping',
        { conversationId: input.conversationId },
      );

      // Get current user from context
      const currentUserId = context.user?.sub || 'anonymous-user';

      await this.commandBus.execute(
        new StopTypingCommand(input.conversationId, currentUserId),
      );

      return {
        success: true,
        conversationId: input.conversationId,
        userId: currentUserId,
        isTyping: false,
      };
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error stopping typing indicator for conversation: ${input.conversationId}`,
        {
          source: MessageResolver.name,
          method: 'stopTyping',
          conversationId: input.conversationId,
        },
      );

      return {
        success: false,
        conversationId: input.conversationId,
        userId: context.user?.sub || 'anonymous-user',
        isTyping: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Resolve deliveredTo field
   */
  @ResolveField('deliveredTo', () => [String], { nullable: true })
  resolveDeliveredTo(@Parent() message: MessageReadModel): string[] | null {
    try {
      return message.deliveredTo
        ? message.deliveredTo.map((userId) => userId.toString())
        : null;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Error resolving deliveredTo field',
        {
          source: MessageResolver.name,
          method: 'resolveDeliveredTo',
          messageId: message.id.toString(),
        },
      );
      return null;
    }
  }

  /**
   * Resolve readBy field
   */
  @ResolveField('readBy', () => [String], { nullable: true })
  resolveReadBy(@Parent() message: MessageReadModel): string[] | null {
    try {
      return message.readBy
        ? message.readBy.map((userId) => userId.toString())
        : null;
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Error resolving readBy field',
        {
          source: MessageResolver.name,
          method: 'resolveReadBy',
          messageId: message.id.toString(),
        },
      );
      return null;
    }
  }
}

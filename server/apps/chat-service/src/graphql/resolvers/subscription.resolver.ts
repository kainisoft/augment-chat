import {
  Resolver,
  Subscription,
  Args,
  ID,
  Context,
} from '@nestjs/graphql';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import {
  MessageType,
  TypingStatusType,
  MessageStatusUpdateType,
} from '../types';
import { AuthenticatedRequest } from '@app/security';
import { SubscriptionService } from '../services/subscription.service';

/**
 * Subscription Resolver
 *
 * Handles GraphQL subscriptions for real-time chat features.
 */
@Resolver()
export class SubscriptionResolver {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(SubscriptionResolver.name);
  }

  /**
   * Subscribe to new messages in a conversation
   */
  @Subscription(() => MessageType, {
    name: 'messageReceived',
    description: 'Subscribe to new messages in a conversation',
    filter: (payload, variables, context) => {
      // Filter messages by conversation ID and user permissions
      return (
        payload.messageReceived &&
        payload.messageReceived.conversationId === variables.conversationId &&
        context.user
      );
    },
  })
  messageReceived(
    @Args('conversationId', { type: () => ID }) conversationId: string,
    @Context() context: AuthenticatedRequest,
  ) {
    try {
      this.loggingService.debug(
        `Setting up message subscription for conversation: ${conversationId}`,
        'messageReceived',
        {
          conversationId,
          userId: context.user?.sub,
        },
      );

      // Return an async iterator for the message channel
      return this.subscriptionService.createMessageSubscription(conversationId);
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error setting up message subscription for conversation: ${conversationId}`,
        {
          source: SubscriptionResolver.name,
          method: 'messageReceived',
          conversationId,
          userId: context.user?.sub,
        },
      );
      throw error;
    }
  }

  /**
   * Subscribe to typing status updates in a conversation
   */
  @Subscription(() => TypingStatusType, {
    name: 'typingStatus',
    description: 'Subscribe to typing status updates in a conversation',
    filter: (payload, variables, context) => {
      // Filter typing status by conversation ID and exclude own typing
      return (
        payload.typingStatus &&
        payload.typingStatus.conversationId === variables.conversationId &&
        context.user &&
        payload.typingStatus.userId !== context.user.sub
      );
    },
  })
  typingStatus(
    @Args('conversationId', { type: () => ID }) conversationId: string,
    @Context() context: AuthenticatedRequest,
  ) {
    try {
      this.loggingService.debug(
        `Setting up typing status subscription for conversation: ${conversationId}`,
        'typingStatus',
        {
          conversationId,
          userId: context.user?.sub,
        },
      );

      // Return an async iterator for the typing channel
      return this.subscriptionService.createTypingSubscription(conversationId);
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error setting up typing status subscription for conversation: ${conversationId}`,
        {
          source: SubscriptionResolver.name,
          method: 'typingStatus',
          conversationId,
          userId: context.user?.sub,
        },
      );
      throw error;
    }
  }

  /**
   * Subscribe to message status updates in a conversation
   */
  @Subscription(() => MessageStatusUpdateType, {
    name: 'messageStatusUpdated',
    description: 'Subscribe to message status updates (read receipts, delivery confirmations)',
    filter: (payload, variables, context) => {
      // Filter status updates by conversation ID
      return (
        payload.messageStatusUpdated &&
        payload.messageStatusUpdated.conversationId === variables.conversationId &&
        context.user
      );
    },
  })
  messageStatusUpdated(
    @Args('conversationId', { type: () => ID }) conversationId: string,
    @Context() context: AuthenticatedRequest,
  ) {
    try {
      this.loggingService.debug(
        `Setting up message status subscription for conversation: ${conversationId}`,
        'messageStatusUpdated',
        {
          conversationId,
          userId: context.user?.sub,
        },
      );

      // Return an async iterator for the status channel
      return this.subscriptionService.createMessageStatusSubscription(conversationId);
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error setting up message status subscription for conversation: ${conversationId}`,
        {
          source: SubscriptionResolver.name,
          method: 'messageStatusUpdated',
          conversationId,
          userId: context.user?.sub,
        },
      );
      throw error;
    }
  }
}

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { LoggingService } from '@app/logging';
import { BaseEvent, RedisEventPublisher, RedisService } from '@app/redis';
import { RedisPubSub } from 'graphql-redis-subscriptions';

/**
 * Chat Event Interface
 */
export interface ChatEvent extends BaseEvent {
  conversationId: string;
  userId?: string;
  data: any;
}

/**
 * Message Event Interface
 */
export interface MessageEvent extends ChatEvent {
  type: 'message.received' | 'message.updated' | 'message.deleted';
  data: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    messageType: string;
    createdAt: Date;
    updatedAt: Date;
    attachments?: any[];
    replyTo?: string;
  };
}

/**
 * Typing Event Interface
 */
export interface TypingEvent extends ChatEvent {
  type: 'typing.started' | 'typing.stopped';
  data: {
    conversationId: string;
    userId: string;
    displayName: string;
    isTyping: boolean;
    timestamp: Date;
  };
}

/**
 * Message Status Event Interface
 */
export interface MessageStatusEvent extends ChatEvent {
  type: 'message.delivered' | 'message.read';
  data: {
    messageId: string;
    conversationId: string;
    statusType: 'delivered' | 'read';
    userId: string;
    timestamp: Date;
  };
}

/**
 * Subscription Service
 *
 * Handles GraphQL subscriptions using Redis PubSub for real-time communication.
 */
@Injectable()
export class SubscriptionService implements OnModuleDestroy {
  private readonly pubSub: RedisPubSub;

  constructor(
    private readonly loggingService: LoggingService,
    private readonly eventPublisher: RedisEventPublisher,
    private readonly redisService: RedisService,
  ) {
    this.loggingService.setContext(SubscriptionService.name);

    // Create GraphQL Redis PubSub using standardized Redis clients
    const redisClient = this.redisService.getClient();

    this.pubSub = new RedisPubSub({
      publisher: redisClient.duplicate(),
      subscriber: redisClient.duplicate(),
    });

    this.loggingService.log(
      'Subscription service initialized with standardized Redis clients',
      'constructor',
    );
  }

  /**
   * Create an async iterator for message subscriptions
   */
  createMessageSubscription(conversationId: string) {
    const channel = `message.${conversationId}`;
    this.loggingService.debug(
      `Creating message subscription for channel: ${channel}`,
      'createMessageSubscription',
      { conversationId },
    );
    return this.pubSub.asyncIterator(channel);
  }

  /**
   * Create an async iterator for typing status subscriptions
   */
  createTypingSubscription(conversationId: string) {
    const channel = `typing.${conversationId}`;
    this.loggingService.debug(
      `Creating typing subscription for channel: ${channel}`,
      'createTypingSubscription',
      { conversationId },
    );
    return this.pubSub.asyncIterator(channel);
  }

  /**
   * Create an async iterator for message status subscriptions
   */
  createMessageStatusSubscription(conversationId: string) {
    const channel = `status.${conversationId}`;
    this.loggingService.debug(
      `Creating message status subscription for channel: ${channel}`,
      'createMessageStatusSubscription',
      { conversationId },
    );
    return this.pubSub.asyncIterator(channel);
  }

  /**
   * Publish a message event
   */
  async publishMessageEvent(event: MessageEvent): Promise<void> {
    try {
      const channel = `message.${event.conversationId}`;

      // Publish using standardized event publisher for microservice communication
      await this.eventPublisher.publish(channel, event);

      // Publish using GraphQL PubSub for GraphQL subscriptions
      await this.pubSub.publish(channel, { messageReceived: event.data });

      this.loggingService.debug(
        `Published message event to channel: ${channel}`,
        'publishMessageEvent',
        { conversationId: event.conversationId, messageId: event.data.id },
      );
    } catch (error) {
      this.loggingService.error(
        `Error publishing message event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'publishMessageEvent',
      );
      throw error;
    }
  }

  /**
   * Publish a typing event
   */
  async publishTypingEvent(event: TypingEvent): Promise<void> {
    try {
      const channel = `typing.${event.conversationId}`;

      // Publish using standardized event publisher for microservice communication
      await this.eventPublisher.publish(channel, event);

      // Publish using GraphQL PubSub for GraphQL subscriptions
      await this.pubSub.publish(channel, { typingStatus: event.data });

      this.loggingService.debug(
        `Published typing event to channel: ${channel}`,
        'publishTypingEvent',
        { conversationId: event.conversationId, userId: event.data.userId },
      );
    } catch (error) {
      this.loggingService.error(
        `Error publishing typing event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'publishTypingEvent',
      );
      throw error;
    }
  }

  /**
   * Publish a message status event
   */
  async publishMessageStatusEvent(event: MessageStatusEvent): Promise<void> {
    try {
      const channel = `status.${event.conversationId}`;

      // Publish using standardized event publisher for microservice communication
      await this.eventPublisher.publish(channel, event);

      // Publish using GraphQL PubSub for GraphQL subscriptions
      await this.pubSub.publish(channel, { messageStatusUpdated: event.data });

      this.loggingService.debug(
        `Published message status event to channel: ${channel}`,
        'publishMessageStatusEvent',
      );
    } catch (error) {
      this.loggingService.error(
        `Error publishing message status event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'publishMessageStatusEvent',
      );
      throw error;
    }
  }

  /**
   * Cleanup resources on module destroy
   */
  async onModuleDestroy() {
    this.loggingService.log(
      'Cleaning up subscription service',
      'onModuleDestroy',
    );

    try {
      // Close the GraphQL PubSub instance
      // This will automatically close the duplicated Redis clients used by RedisPubSub
      await this.pubSub.close();

      this.loggingService.log(
        'Subscription service cleanup completed successfully',
        'onModuleDestroy',
      );
    } catch (error) {
      this.loggingService.error(
        `Error during cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'onModuleDestroy',
      );
    }
  }
}

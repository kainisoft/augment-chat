import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { LoggingService } from '@app/logging';
import { BaseEvent } from '@app/redis';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

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
  private readonly redisPublisher: Redis;
  private readonly redisSubscriber: Redis;

  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext(SubscriptionService.name);

    // Create Redis clients for PubSub
    this.redisPublisher = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    this.redisSubscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    // Initialize GraphQL Redis PubSub
    this.pubSub = new RedisPubSub({
      publisher: this.redisPublisher,
      subscriber: this.redisSubscriber,
    });

    this.loggingService.log('Subscription service initialized', 'constructor');
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
      await this.pubSub.close();
      await this.redisPublisher.quit();
      await this.redisSubscriber.quit();
    } catch (error) {
      this.loggingService.error(
        `Error during cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'onModuleDestroy',
      );
    }
  }
}

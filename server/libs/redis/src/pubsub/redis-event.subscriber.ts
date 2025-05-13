import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { RedisService } from '../redis.service';
import {
  BaseEvent,
  EventHandler,
  EventSubscriber,
  EventSubscriberOptions,
  defaultEventSubscriberOptions,
} from './event.interfaces';
import { Cluster, Redis } from 'ioredis';

/**
 * Redis Event Subscriber
 *
 * This class provides a Redis implementation of the EventSubscriber interface.
 */
@Injectable()
export class RedisEventSubscriber implements EventSubscriber, OnModuleDestroy {
  private readonly logger = new Logger(RedisEventSubscriber.name);
  private readonly options: EventSubscriberOptions;
  private readonly subscriberClient: Redis | Cluster;
  private readonly psubscriberClient: Redis | Cluster;
  private readonly handlers: Map<string, EventHandler<any>[]> = new Map();
  private readonly patternHandlers: Map<string, EventHandler<any>[]> =
    new Map();

  constructor(
    private readonly redisService: RedisService,
    options: Partial<EventSubscriberOptions> = {},
  ) {
    this.options = { ...defaultEventSubscriberOptions, ...options };

    // Create dedicated clients for subscriptions
    // We need separate clients because once a client enters subscription mode,
    // it cannot issue other commands until it unsubscribes
    this.subscriberClient = this.redisService.getClient().duplicate();
    this.psubscriberClient = this.redisService.getClient().duplicate();

    // Set up message handlers
    this.setupMessageHandlers();
  }

  /**
   * Subscribe to a channel
   * @param channel Channel to subscribe to
   * @param handler Event handler
   * @returns Promise resolving to true if the subscription was successful
   */
  async subscribe<T extends BaseEvent>(
    channel: string,
    handler: EventHandler<T>,
  ): Promise<boolean> {
    try {
      const fullChannel = this.getChannelName(channel);

      // Add handler to the handlers map
      if (!this.handlers.has(fullChannel)) {
        this.handlers.set(fullChannel, []);
      }

      this.handlers.get(fullChannel)!.push(handler);

      // Subscribe to the channel
      await this.subscriberClient.subscribe(fullChannel);

      if (this.options.enableLogs) {
        this.logger.log(`Subscribed to channel ${fullChannel}`);
      }

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error subscribing to channel ${channel}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Subscribe to multiple channels
   * @param channels Channels to subscribe to
   * @param handler Event handler
   * @returns Promise resolving to true if the subscription was successful
   */
  async subscribeToMany<T extends BaseEvent>(
    channels: string[],
    handler: EventHandler<T>,
  ): Promise<boolean> {
    try {
      const fullChannels = channels.map((channel) =>
        this.getChannelName(channel),
      );

      // Add handler to the handlers map for each channel
      for (const channel of fullChannels) {
        if (!this.handlers.has(channel)) {
          this.handlers.set(channel, []);
        }

        this.handlers.get(channel)!.push(handler);
      }

      // Subscribe to all channels
      await this.subscriberClient.subscribe(...fullChannels);

      if (this.options.enableLogs) {
        this.logger.log(`Subscribed to ${channels.length} channels`);
      }

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error subscribing to multiple channels: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Subscribe to a channel pattern
   * @param pattern Channel pattern to subscribe to
   * @param handler Event handler
   * @returns Promise resolving to true if the subscription was successful
   */
  async psubscribe<T extends BaseEvent>(
    pattern: string,
    handler: EventHandler<T>,
  ): Promise<boolean> {
    try {
      const fullPattern = this.getChannelName(pattern);

      // Add handler to the pattern handlers map
      if (!this.patternHandlers.has(fullPattern)) {
        this.patternHandlers.set(fullPattern, []);
      }

      this.patternHandlers.get(fullPattern)!.push(handler);

      // Subscribe to the pattern
      await this.psubscriberClient.psubscribe(fullPattern);

      if (this.options.enableLogs) {
        this.logger.log(`Subscribed to pattern ${fullPattern}`);
      }

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error subscribing to pattern ${pattern}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Unsubscribe from a channel
   * @param channel Channel to unsubscribe from
   * @returns Promise resolving to true if the unsubscription was successful
   */
  async unsubscribe(channel: string): Promise<boolean> {
    try {
      const fullChannel = this.getChannelName(channel);

      // Unsubscribe from the channel
      await this.subscriberClient.unsubscribe(fullChannel);

      // Remove handlers for the channel
      this.handlers.delete(fullChannel);

      if (this.options.enableLogs) {
        this.logger.log(`Unsubscribed from channel ${fullChannel}`);
      }

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error unsubscribing from channel ${channel}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Unsubscribe from multiple channels
   * @param channels Channels to unsubscribe from
   * @returns Promise resolving to true if the unsubscription was successful
   */
  async unsubscribeFromMany(channels: string[]): Promise<boolean> {
    try {
      const fullChannels = channels.map((channel) =>
        this.getChannelName(channel),
      );

      // Unsubscribe from all channels
      await this.subscriberClient.unsubscribe(...fullChannels);

      // Remove handlers for all channels
      for (const channel of fullChannels) {
        this.handlers.delete(channel);
      }

      if (this.options.enableLogs) {
        this.logger.log(`Unsubscribed from ${channels.length} channels`);
      }

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error unsubscribing from multiple channels: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Unsubscribe from a channel pattern
   * @param pattern Channel pattern to unsubscribe from
   * @returns Promise resolving to true if the unsubscription was successful
   */
  async punsubscribe(pattern: string): Promise<boolean> {
    try {
      const fullPattern = this.getChannelName(pattern);

      // Unsubscribe from the pattern
      await this.psubscriberClient.punsubscribe(fullPattern);

      // Remove handlers for the pattern
      this.patternHandlers.delete(fullPattern);

      if (this.options.enableLogs) {
        this.logger.log(`Unsubscribed from pattern ${fullPattern}`);
      }

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error unsubscribing from pattern ${pattern}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Clean up resources when the module is destroyed
   */
  async onModuleDestroy() {
    try {
      // Unsubscribe from all channels and patterns
      await this.subscriberClient.unsubscribe();
      await this.psubscriberClient.punsubscribe();

      // Quit the clients
      await this.subscriberClient.quit();
      await this.psubscriberClient.quit();

      this.logger.log('Redis event subscriber cleaned up');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error cleaning up Redis event subscriber: ${errorMessage}`,
      );
    }
  }

  /**
   * Set up message handlers for the subscriber clients
   */
  private setupMessageHandlers() {
    // Handle regular channel messages
    this.subscriberClient.on('message', async (channel, message) => {
      try {
        const handlers = this.handlers.get(channel);

        if (!handlers || handlers.length === 0) {
          return;
        }

        const event = this.deserializeEvent(message);

        // Execute all handlers for the channel
        for (const handler of handlers) {
          await this.executeHandler(handler, event, channel);
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Error handling message from channel ${channel}: ${errorMessage}`,
        );
      }
    });

    // Handle pattern messages
    this.psubscriberClient.on('pmessage', async (pattern, channel, message) => {
      try {
        const handlers = this.patternHandlers.get(pattern);

        if (!handlers || handlers.length === 0) {
          return;
        }

        const event = this.deserializeEvent(message);

        // Execute all handlers for the pattern
        for (const handler of handlers) {
          await this.executeHandler(handler, event, channel, pattern);
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Error handling message from pattern ${pattern}, channel ${channel}: ${errorMessage}`,
        );
      }
    });
  }

  /**
   * Execute an event handler with retry logic
   * @param handler Event handler
   * @param event Event
   * @param channel Channel
   * @param pattern Pattern (optional)
   */
  private async executeHandler(
    handler: EventHandler<any>,
    event: BaseEvent,
    channel: string,
    pattern?: string,
  ) {
    let retries = 0;

    while (retries <= this.options.maxRetries!) {
      try {
        await handler(event);
        return;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        if (retries === this.options.maxRetries) {
          this.logger.error(
            `Failed to handle event ${event.type} after ${retries} retries: ${errorMessage}`,
          );
          return;
        }

        retries++;

        this.logger.warn(
          `Error handling event ${event.type}, retrying (${retries}/${this.options.maxRetries}): ${errorMessage}`,
        );

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 100 * retries));
      }
    }
  }

  /**
   * Get the full channel name
   * @param channel Channel name
   * @returns Full channel name
   */
  private getChannelName(channel: string): string {
    return `${this.options.channelPrefix}:${channel}`;
  }

  /**
   * Deserialize an event
   * @param data Serialized event
   * @returns Deserialized event
   */
  private deserializeEvent(data: string): BaseEvent {
    return JSON.parse(data) as BaseEvent;
  }
}

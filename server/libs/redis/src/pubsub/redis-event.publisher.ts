import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis.service';
import {
  BaseEvent,
  EventPublisher,
  EventPublisherOptions,
  defaultEventPublisherOptions,
} from './event.interfaces';
import { v4 as uuidv4 } from 'uuid';

/**
 * Redis Event Publisher
 *
 * This class provides a Redis implementation of the EventPublisher interface.
 */
@Injectable()
export class RedisEventPublisher implements EventPublisher {
  private readonly logger = new Logger(RedisEventPublisher.name);
  private readonly options: EventPublisherOptions;

  constructor(
    private readonly redisService: RedisService,
    options: Partial<EventPublisherOptions> = {},
  ) {
    this.options = { ...defaultEventPublisherOptions, ...options };
  }

  /**
   * Publish an event
   * @param channel Channel to publish to
   * @param event Event to publish
   * @returns Promise resolving to the number of clients that received the event
   */
  async publish<T extends BaseEvent>(
    channel: string,
    event: T,
  ): Promise<number> {
    try {
      // Ensure event has required fields
      const enrichedEvent = this.enrichEvent(event);

      // Get full channel name
      const fullChannel = this.getChannelName(channel);

      // Serialize event
      const serializedEvent = this.serializeEvent(enrichedEvent);

      // Publish event
      const result = await this.redisService
        .getClient()
        .publish(fullChannel, serializedEvent);

      if (this.options.enableLogs) {
        this.logger.log(
          `Published event ${enrichedEvent.type} to channel ${fullChannel}, received by ${result} clients`,
        );
      }

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error publishing event to channel ${channel}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Publish an event to multiple channels
   * @param channels Channels to publish to
   * @param event Event to publish
   * @returns Promise resolving to the number of clients that received the event
   */
  async publishToMany<T extends BaseEvent>(
    channels: string[],
    event: T,
  ): Promise<number> {
    try {
      // Ensure event has required fields
      const enrichedEvent = this.enrichEvent(event);

      // Serialize event
      const serializedEvent = this.serializeEvent(enrichedEvent);

      // Get full channel names
      const fullChannels = channels.map((channel) =>
        this.getChannelName(channel),
      );

      // Use pipeline for better performance
      const pipeline = this.redisService.getClient().pipeline();

      // Publish to all channels
      for (const channel of fullChannels) {
        pipeline.publish(channel, serializedEvent);
      }

      // Execute pipeline
      const results = await pipeline.exec();

      if (!Array.isArray(results)) {
        return 0;
      }

      // Count total number of clients that received the event
      const totalReceivers = results.reduce((total, [err, count]) => {
        if (err) {
          this.logger.error(`Error publishing to channel: ${err.message}`);
          return total;
        }
        return total + (count as number);
      }, 0);

      if (this.options.enableLogs) {
        this.logger.log(
          `Published event ${enrichedEvent.type} to ${channels.length} channels, received by ${totalReceivers} clients`,
        );
      }

      return totalReceivers;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error publishing event to multiple channels: ${errorMessage}`,
      );
      throw error;
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
   * Enrich an event with required fields
   * @param event Event to enrich
   * @returns Enriched event
   */
  private enrichEvent<T extends BaseEvent>(event: T): T {
    return {
      ...event,
      timestamp: event.timestamp || Date.now(),
      id: event.id || uuidv4(),
    };
  }

  /**
   * Serialize an event
   * @param event Event to serialize
   * @returns Serialized event
   */
  private serializeEvent<T extends BaseEvent>(event: T): string {
    return JSON.stringify(event);
  }
}

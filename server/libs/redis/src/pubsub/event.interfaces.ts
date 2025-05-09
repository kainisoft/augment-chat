/**
 * Base event interface
 *
 * This interface defines the base structure for all events.
 */
export interface BaseEvent {
  /**
   * Event type
   */
  type: string;

  /**
   * Event timestamp
   */
  timestamp: number;

  /**
   * Event source
   */
  source?: string;

  /**
   * Event ID
   */
  id?: string;
}

/**
 * Event handler function type
 */
export type EventHandler<T extends BaseEvent> = (
  event: T,
) => Promise<void> | void;

/**
 * Event publisher options
 */
export interface EventPublisherOptions {
  /**
   * Channel prefix
   * @default 'events'
   */
  channelPrefix?: string;

  /**
   * Whether to log event operations
   * @default false
   */
  enableLogs?: boolean;
}

/**
 * Event subscriber options
 */
export interface EventSubscriberOptions {
  /**
   * Channel prefix
   * @default 'events'
   */
  channelPrefix?: string;

  /**
   * Whether to log event operations
   * @default false
   */
  enableLogs?: boolean;

  /**
   * Whether to handle events in a separate process
   * @default false
   */
  separateProcess?: boolean;

  /**
   * Maximum number of retries for failed event handling
   * @default 3
   */
  maxRetries?: number;
}

/**
 * Default event publisher options
 */
export const defaultEventPublisherOptions: EventPublisherOptions = {
  channelPrefix: 'events',
  enableLogs: false,
};

/**
 * Default event subscriber options
 */
export const defaultEventSubscriberOptions: EventSubscriberOptions = {
  channelPrefix: 'events',
  enableLogs: false,
  separateProcess: false,
  maxRetries: 3,
};

/**
 * Event publisher interface
 *
 * This interface defines the methods that should be implemented by an event publisher.
 */
export interface EventPublisher {
  /**
   * Publish an event
   * @param channel Channel to publish to
   * @param event Event to publish
   * @returns Promise resolving to the number of clients that received the event
   */
  publish<T extends BaseEvent>(channel: string, event: T): Promise<number>;

  /**
   * Publish an event to multiple channels
   * @param channels Channels to publish to
   * @param event Event to publish
   * @returns Promise resolving to the number of clients that received the event
   */
  publishToMany<T extends BaseEvent>(
    channels: string[],
    event: T,
  ): Promise<number>;
}

/**
 * Event subscriber interface
 *
 * This interface defines the methods that should be implemented by an event subscriber.
 */
export interface EventSubscriber {
  /**
   * Subscribe to a channel
   * @param channel Channel to subscribe to
   * @param handler Event handler
   * @returns Promise resolving to true if the subscription was successful
   */
  subscribe<T extends BaseEvent>(
    channel: string,
    handler: EventHandler<T>,
  ): Promise<boolean>;

  /**
   * Subscribe to multiple channels
   * @param channels Channels to subscribe to
   * @param handler Event handler
   * @returns Promise resolving to true if the subscription was successful
   */
  subscribeToMany<T extends BaseEvent>(
    channels: string[],
    handler: EventHandler<T>,
  ): Promise<boolean>;

  /**
   * Subscribe to a channel pattern
   * @param pattern Channel pattern to subscribe to
   * @param handler Event handler
   * @returns Promise resolving to true if the subscription was successful
   */
  psubscribe<T extends BaseEvent>(
    pattern: string,
    handler: EventHandler<T>,
  ): Promise<boolean>;

  /**
   * Unsubscribe from a channel
   * @param channel Channel to unsubscribe from
   * @returns Promise resolving to true if the unsubscription was successful
   */
  unsubscribe(channel: string): Promise<boolean>;

  /**
   * Unsubscribe from multiple channels
   * @param channels Channels to unsubscribe from
   * @returns Promise resolving to true if the unsubscription was successful
   */
  unsubscribeFromMany(channels: string[]): Promise<boolean>;

  /**
   * Unsubscribe from a channel pattern
   * @param pattern Channel pattern to unsubscribe from
   * @returns Promise resolving to true if the unsubscription was successful
   */
  punsubscribe(pattern: string): Promise<boolean>;
}

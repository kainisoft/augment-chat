import { BaseEvent } from './event.interface';

/**
 * Kafka Message Interface
 *
 * Defines the structure for messages sent to Kafka.
 */
export interface KafkaMessage<T extends BaseEvent> {
  /**
   * Optional message key for partitioning
   */
  key?: string;

  /**
   * Message value (the event)
   */
  value: T;

  /**
   * Kafka topic
   */
  topic: string;

  /**
   * Optional partition number
   */
  partition?: number;

  /**
   * Optional message headers
   */
  headers?: Record<string, string>;
}

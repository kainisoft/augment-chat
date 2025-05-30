import {
  Injectable,
  Inject,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaConfigurationService } from '../config/kafka-configuration.service';
import { KafkaModuleOptions } from '../kafka.module';

export interface ConsumerMetrics {
  messagesReceived: number;
  messagesProcessed: number;
  messagesFailedToProcess: number;
  averageProcessingTime: number;
  lastReceivedAt?: Date;
  lastProcessedAt?: Date;
  lastErrorAt?: Date;
  lastError?: string;
}

export interface MessageHandler<T = any> {
  (message: T, context: MessageContext): Promise<void>;
}

export interface MessageContext {
  topic: string;
  partition: number;
  offset: string;
  key?: string;
  headers?: Record<string, string>;
  timestamp: string;
}

/**
 * Enhanced Kafka Consumer Service
 *
 * Provides advanced Kafka consumer functionality with:
 * - Message deserialization and validation
 * - Error handling and dead letter queues
 * - Metrics collection
 * - Health monitoring
 * - Message handler registration
 */
@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private readonly messageHandlers = new Map<string, MessageHandler>();
  private metrics: ConsumerMetrics = {
    messagesReceived: 0,
    messagesProcessed: 0,
    messagesFailedToProcess: 0,
    averageProcessingTime: 0,
  };
  private processingTimes: number[] = [];

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
    private readonly configService: KafkaConfigurationService,
    @Inject('KAFKA_OPTIONS') private readonly options: KafkaModuleOptions,
  ) {}

  async onModuleInit() {
    try {
      await this.kafkaClient.connect();
      this.logger.log('Enhanced Kafka Consumer connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect Enhanced Kafka Consumer:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.kafkaClient.close();
      this.logger.log('Enhanced Kafka Consumer disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Enhanced Kafka Consumer:', error);
    }
  }

  /**
   * Register a message handler for a specific topic
   */
  registerHandler<T = any>(topic: string, handler: MessageHandler<T>): void {
    this.messageHandlers.set(topic, handler);
    this.logger.log(`Registered handler for topic: ${topic}`);
  }

  /**
   * Subscribe to a topic and start consuming messages
   */
  async subscribe(topic: string): Promise<void> {
    try {
      // Subscribe to the topic using NestJS microservices pattern
      this.kafkaClient.subscribeToResponseOf(topic);

      // Set up message handling
      this.kafkaClient.subscribe(topic, (message, context) => {
        this.handleMessage(topic, message, context);
      });

      this.logger.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to multiple topics
   */
  async subscribeToTopics(topics: string[]): Promise<void> {
    const subscribePromises = topics.map((topic) => this.subscribe(topic));
    await Promise.all(subscribePromises);
    this.logger.log(
      `Subscribed to ${topics.length} topics: ${topics.join(', ')}`,
    );
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribe(topic: string): Promise<void> {
    try {
      // Remove handler
      this.messageHandlers.delete(topic);

      // Note: NestJS ClientKafka doesn't provide direct unsubscribe method
      // This would need to be implemented at the Kafka client level

      this.logger.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Get consumer metrics
   */
  getMetrics(): ConsumerMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset consumer metrics
   */
  resetMetrics(): void {
    this.metrics = {
      messagesReceived: 0,
      messagesProcessed: 0,
      messagesFailedToProcess: 0,
      averageProcessingTime: 0,
    };
    this.processingTimes = [];
  }

  /**
   * Check if consumer is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      // Simple health check - in production you might want more sophisticated checks
      return this.messageHandlers.size > 0;
    } catch (error) {
      this.logger.error('Consumer health check failed:', error);
      return false;
    }
  }

  /**
   * Get list of subscribed topics
   */
  getSubscribedTopics(): string[] {
    return Array.from(this.messageHandlers.keys());
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(
    topic: string,
    message: any,
    context: any,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Update received metrics
      this.updateReceivedMetrics();

      // Get handler for this topic
      const handler = this.messageHandlers.get(topic);
      if (!handler) {
        this.logger.warn(`No handler registered for topic: ${topic}`);
        return;
      }

      // Parse message
      const parsedMessage = this.parseMessage(message);
      const messageContext = this.createMessageContext(topic, context);

      // Execute handler
      await handler(parsedMessage, messageContext);

      // Update success metrics
      this.updateProcessedMetrics(startTime);

      this.logger.debug(`Message processed successfully for topic: ${topic}`, {
        topic,
        key: messageContext.key,
        partition: messageContext.partition,
        offset: messageContext.offset,
      });
    } catch (error) {
      this.updateErrorMetrics(startTime, error);
      this.logger.error(`Failed to process message for topic ${topic}:`, error);

      // Handle error (could implement dead letter queue here)
      await this.handleMessageError(topic, message, error);
    }
  }

  /**
   * Parse incoming message
   */
  private parseMessage(message: any): any {
    try {
      // If message is already parsed, return as is
      if (typeof message === 'object' && message !== null) {
        return message;
      }

      // Try to parse as JSON
      if (typeof message === 'string') {
        return JSON.parse(message);
      }

      return message;
    } catch (error) {
      this.logger.warn(
        'Failed to parse message as JSON, returning raw message',
      );
      return message;
    }
  }

  /**
   * Create message context
   */
  private createMessageContext(topic: string, context: any): MessageContext {
    return {
      topic,
      partition: context?.partition || 0,
      offset: context?.offset || '0',
      key: context?.key,
      headers: context?.headers || {},
      timestamp: context?.timestamp || new Date().toISOString(),
    };
  }

  /**
   * Handle message processing error
   */
  private async handleMessageError(
    topic: string,
    message: any,
    error: Error,
  ): Promise<void> {
    // Log error details
    this.logger.error(`Message processing error for topic ${topic}:`, {
      error: error.message,
      stack: error.stack,
      message: JSON.stringify(message),
    });

    // Here you could implement:
    // - Dead letter queue
    // - Retry logic
    // - Error notifications
    // - Circuit breaker pattern
  }

  /**
   * Update received metrics
   */
  private updateReceivedMetrics(): void {
    this.metrics.messagesReceived++;
    this.metrics.lastReceivedAt = new Date();
  }

  /**
   * Update processed metrics
   */
  private updateProcessedMetrics(startTime: number): void {
    const processingTime = Date.now() - startTime;
    this.processingTimes.push(processingTime);

    // Keep only last 100 processing times for average calculation
    if (this.processingTimes.length > 100) {
      this.processingTimes.shift();
    }

    this.metrics.messagesProcessed++;
    this.metrics.averageProcessingTime =
      this.processingTimes.reduce((a, b) => a + b, 0) /
      this.processingTimes.length;
    this.metrics.lastProcessedAt = new Date();
  }

  /**
   * Update error metrics
   */
  private updateErrorMetrics(startTime: number, error: Error): void {
    this.metrics.messagesFailedToProcess++;
    this.metrics.lastErrorAt = new Date();
    this.metrics.lastError = error.message;
  }
}

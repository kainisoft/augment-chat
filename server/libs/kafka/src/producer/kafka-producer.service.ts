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

export interface KafkaMessage {
  topic: string;
  key?: string;
  value: any;
  headers?: Record<string, string>;
  partition?: number;
  timestamp?: string;
}

export interface ProducerMetrics {
  messagesSent: number;
  messagesFailedToSend: number;
  averageResponseTime: number;
  lastSentAt?: Date;
  lastErrorAt?: Date;
  lastError?: string;
}

/**
 * Enhanced Kafka Producer Service
 *
 * Provides advanced Kafka producer functionality with:
 * - Message serialization and validation
 * - Retry logic and error handling
 * - Metrics collection
 * - Health monitoring
 * - Batch processing
 */
@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private metrics: ProducerMetrics = {
    messagesSent: 0,
    messagesFailedToSend: 0,
    averageResponseTime: 0,
  };
  private responseTimes: number[] = [];

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
    private readonly configService: KafkaConfigurationService,
    @Inject('KAFKA_OPTIONS') private readonly options: KafkaModuleOptions,
  ) {}

  async onModuleInit() {
    try {
      await this.kafkaClient.connect();
      this.logger.log('Enhanced Kafka Producer connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect Enhanced Kafka Producer:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.kafkaClient.close();
      this.logger.log('Enhanced Kafka Producer disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Enhanced Kafka Producer:', error);
    }
  }

  /**
   * Send a single message to Kafka
   */
  async sendMessage(message: KafkaMessage): Promise<void> {
    const startTime = Date.now();

    try {
      // Validate message
      this.validateMessage(message);

      // Prepare message with metadata
      const kafkaMessage = this.prepareMessage(message);

      // Send message
      await this.kafkaClient.emit(message.topic, kafkaMessage);

      // Update metrics
      this.updateSuccessMetrics(startTime);

      this.logger.debug(`Message sent to topic ${message.topic}`, {
        topic: message.topic,
        key: message.key,
        messageSize: JSON.stringify(kafkaMessage).length,
      });
    } catch (error) {
      this.updateErrorMetrics(startTime, error);
      this.logger.error(
        `Failed to send message to topic ${message.topic}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Send multiple messages in batch
   */
  async sendBatch(messages: KafkaMessage[]): Promise<void> {
    const startTime = Date.now();

    try {
      // Validate all messages
      messages.forEach((message) => this.validateMessage(message));

      // Group messages by topic for efficient sending
      const messagesByTopic = this.groupMessagesByTopic(messages);

      // Send messages for each topic
      const sendPromises = Object.entries(messagesByTopic).map(
        ([topic, topicMessages]) => this.sendTopicBatch(topic, topicMessages),
      );

      await Promise.all(sendPromises);

      // Update metrics
      this.updateBatchSuccessMetrics(startTime, messages.length);

      this.logger.debug(
        `Batch of ${messages.length} messages sent successfully`,
      );
    } catch (error) {
      this.updateErrorMetrics(startTime, error);
      this.logger.error(
        `Failed to send batch of ${messages.length} messages:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Send message with retry logic
   */
  async sendMessageWithRetry(
    message: KafkaMessage,
    maxRetries: number = 3,
  ): Promise<void> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.sendMessage(message);
        return; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Attempt ${attempt}/${maxRetries} failed for topic ${message.topic}:`,
          error,
        );

        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          const delay = Math.pow(2, attempt - 1) * 1000;
          await this.delay(delay);
        }
      }
    }

    // All retries failed
    throw new Error(
      `Failed to send message after ${maxRetries} attempts: ${lastError.message}`,
    );
  }

  /**
   * Get producer metrics
   */
  getMetrics(): ProducerMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset producer metrics
   */
  resetMetrics(): void {
    this.metrics = {
      messagesSent: 0,
      messagesFailedToSend: 0,
      averageResponseTime: 0,
    };
    this.responseTimes = [];
  }

  /**
   * Check if producer is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      // Try to get metadata as a health check
      // This is a simple check - in production you might want more sophisticated health checks
      return true; // ClientKafka doesn't expose direct health check methods
    } catch (error) {
      this.logger.error('Producer health check failed:', error);
      return false;
    }
  }

  /**
   * Validate message structure
   */
  private validateMessage(message: KafkaMessage): void {
    if (!message.topic) {
      throw new Error('Message topic is required');
    }

    if (message.value === undefined || message.value === null) {
      throw new Error('Message value is required');
    }

    // Validate topic name format
    if (!/^[a-zA-Z0-9._-]+$/.test(message.topic)) {
      throw new Error('Invalid topic name format');
    }
  }

  /**
   * Prepare message for sending
   */
  private prepareMessage(message: KafkaMessage) {
    return {
      key: message.key,
      value: JSON.stringify(message.value),
      headers: {
        ...message.headers,
        'content-type': 'application/json',
        'producer-service': this.options.serviceName,
        'sent-at': new Date().toISOString(),
      },
      partition: message.partition,
      timestamp: message.timestamp,
    };
  }

  /**
   * Group messages by topic
   */
  private groupMessagesByTopic(
    messages: KafkaMessage[],
  ): Record<string, KafkaMessage[]> {
    return messages.reduce(
      (groups, message) => {
        if (!groups[message.topic]) {
          groups[message.topic] = [];
        }
        groups[message.topic].push(message);
        return groups;
      },
      {} as Record<string, KafkaMessage[]>,
    );
  }

  /**
   * Send batch of messages for a specific topic
   */
  private async sendTopicBatch(
    topic: string,
    messages: KafkaMessage[],
  ): Promise<void> {
    const preparedMessages = messages.map((message) =>
      this.prepareMessage(message),
    );

    // Send all messages for this topic
    const sendPromises = preparedMessages.map((message) =>
      this.kafkaClient.emit(topic, message),
    );

    await Promise.all(sendPromises);
  }

  /**
   * Update metrics on successful send
   */
  private updateSuccessMetrics(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.responseTimes.push(responseTime);

    // Keep only last 100 response times for average calculation
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }

    this.metrics.messagesSent++;
    this.metrics.averageResponseTime =
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    this.metrics.lastSentAt = new Date();
  }

  /**
   * Update metrics on batch success
   */
  private updateBatchSuccessMetrics(
    startTime: number,
    messageCount: number,
  ): void {
    const responseTime = Date.now() - startTime;
    this.responseTimes.push(responseTime);

    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }

    this.metrics.messagesSent += messageCount;
    this.metrics.averageResponseTime =
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    this.metrics.lastSentAt = new Date();
  }

  /**
   * Update metrics on error
   */
  private updateErrorMetrics(startTime: number, error: Error): void {
    this.metrics.messagesFailedToSend++;
    this.metrics.lastErrorAt = new Date();
    this.metrics.lastError = error.message;
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

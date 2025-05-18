import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { Consumer, Kafka } from 'kafkajs';

/**
 * Kafka Consumer Service
 *
 * Handles consuming Kafka events for the Auth Service.
 */
@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private isConnected = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(KafkaConsumerService.name);

    // Initialize Kafka client
    this.kafka = new Kafka({
      clientId: 'auth-service-consumer',
      brokers: this.configService
        .get<string>('KAFKA_BROKERS', 'kafka:29092')
        .split(','),
    });

    // Initialize consumer
    this.consumer = this.kafka.consumer({
      groupId: 'auth-service-group',
    });
  }

  /**
   * Connect to Kafka and subscribe to topics when the module initializes
   */
  async onModuleInit() {
    try {
      await this.connect();
      this.loggingService.log('Kafka consumer connected successfully');

      // Subscribe to the user-events topic
      await this.consumer.subscribe({
        topic: 'user-events',
        fromBeginning: false,
      });
      this.loggingService.log('Subscribed to Kafka topic: user-events');

      // Start consuming messages
      await this.startConsuming();
      this.loggingService.log('Kafka consumer started successfully');
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to initialize Kafka consumer',
        { error: error instanceof Error ? error.stack : String(error) },
      );
      // Don't throw here to allow the service to start even if Kafka is not available
    }
  }

  /**
   * Disconnect from Kafka when the module is destroyed
   */
  async onModuleDestroy() {
    if (this.isConnected) {
      try {
        await this.consumer.disconnect();
        this.isConnected = false;
        this.loggingService.log('Kafka consumer disconnected');
      } catch (error) {
        this.errorLogger.error(
          error instanceof Error ? error : new Error(String(error)),
          'Error disconnecting Kafka consumer',
          { error: error instanceof Error ? error.stack : String(error) },
        );
      }
    }
  }

  /**
   * Connect to Kafka
   */
  private async connect() {
    if (!this.isConnected) {
      await this.consumer.connect();
      this.isConnected = true;
    }
  }

  /**
   * Start consuming messages from Kafka
   */
  private async startConsuming() {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (!message.value) {
            this.loggingService.warn(
              'Received Kafka message with no value',
              'startConsuming',
              { topic, partition },
            );
            return;
          }

          const messageStr = message.value.toString();
          const parsedMessage = JSON.parse(messageStr);

          this.loggingService.debug(
            `Received message from Kafka topic: ${topic}`,
            'startConsuming',
            {
              topic,
              partition,
              eventType: parsedMessage.type,
              key: message.key?.toString(),
            },
          );

          // Route the message to the appropriate handler based on the topic
          if (topic === 'user-events') {
            await this.handleUserEvent(parsedMessage);
          } else {
            this.loggingService.warn(
              `Unhandled Kafka topic: ${topic}`,
              'startConsuming',
              { topic },
            );
          }
        } catch (error) {
          this.errorLogger.error(
            error instanceof Error ? error : new Error(String(error)),
            `Error processing Kafka message from topic: ${topic}`,
            {
              topic,
              partition,
              error: error instanceof Error ? error.stack : String(error),
            },
          );
        }
      },
    });
  }

  /**
   * Handle user events
   * @param message - The parsed message
   */
  private async handleUserEvent(message: any) {
    this.loggingService.debug(
      `Handling user event: ${message.type}`,
      'handleUserEvent',
      { eventType: message.type },
    );

    // Route the event to the appropriate handler based on the event type
    // This will be implemented when we add user event handlers
    switch (message.type) {
      // Add cases for user events as needed
      default:
        this.loggingService.warn(
          `Unhandled user event type: ${message.type}`,
          'handleUserEvent',
          { eventType: message.type },
        );
    }
  }
}

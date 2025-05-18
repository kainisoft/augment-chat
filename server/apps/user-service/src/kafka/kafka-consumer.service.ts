import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { Consumer, Kafka } from 'kafkajs';
import { UserRegisteredHandler } from './handlers/auth/user-registered.handler';
import { UserDeletedHandler } from './handlers/auth/user-deleted.handler';
import { UserEmailChangedHandler } from './handlers/auth/user-email-changed.handler';

/**
 * Kafka Consumer Service
 *
 * Handles consuming Kafka events for the User Service.
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
    private readonly userRegisteredHandler: UserRegisteredHandler,
    private readonly userDeletedHandler: UserDeletedHandler,
    private readonly userEmailChangedHandler: UserEmailChangedHandler,
  ) {
    this.loggingService.setContext(KafkaConsumerService.name);

    // Initialize Kafka client
    this.kafka = new Kafka({
      clientId: 'user-service',
      brokers: this.configService
        .get<string>('KAFKA_BROKERS', 'kafka:29092')
        .split(','),
    });

    // Initialize consumer
    this.consumer = this.kafka.consumer({
      groupId: 'user-service-consumer',
      maxBytes: 1048576, // 1MB
    });
  }

  /**
   * Connect to Kafka and subscribe to topics when the module initializes
   */
  async onModuleInit() {
    try {
      await this.connect();
      this.loggingService.log('Kafka consumer connected successfully');

      // Subscribe to the auth-events topic
      await this.consumer.subscribe({
        topic: 'auth-events',
        fromBeginning: false,
      });
      this.loggingService.log('Subscribed to Kafka topic: auth-events');

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
              'Received message with no value',
              'startConsuming',
              {
                topic,
                partition,
                offset: message.offset,
              },
            );
            return;
          }

          const messageValue = message.value.toString();
          const parsedMessage = JSON.parse(messageValue);

          this.loggingService.debug(
            `Received Kafka message from topic: ${topic}`,
            'startConsuming',
            {
              topic,
              partition,
              offset: message.offset,
              key: message.key?.toString(),
              eventType: parsedMessage.type,
            },
          );

          // Handle the message based on the topic and event type
          if (topic === 'auth-events') {
            await this.handleAuthEvent(parsedMessage);
          }
        } catch (error) {
          this.errorLogger.error(
            error instanceof Error ? error : new Error(String(error)),
            'Error processing Kafka message',
            {
              topic,
              partition,
              offset: message.offset,
              key: message.key?.toString(),
              error: error instanceof Error ? error.stack : String(error),
            },
          );
        }
      },
    });
  }

  /**
   * Handle auth events
   * @param message - The parsed message
   */
  private async handleAuthEvent(message: any) {
    this.loggingService.debug(
      `Handling auth event: ${message.type}`,
      'handleAuthEvent',
      { eventType: message.type },
    );

    // Route the event to the appropriate handler based on the event type
    switch (message.type) {
      case 'UserRegistered':
        await this.userRegisteredHandler.handle(message.payload);
        break;
      case 'UserDeleted':
        await this.userDeletedHandler.handle(message.payload);
        break;
      case 'UserEmailChanged':
        await this.userEmailChangedHandler.handle(message.payload);
        break;
      default:
        this.loggingService.warn(
          `Unhandled auth event type: ${message.type}`,
          'handleAuthEvent',
          { eventType: message.type },
        );
    }
  }
}

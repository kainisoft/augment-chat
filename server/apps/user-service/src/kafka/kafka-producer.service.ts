import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { Kafka, Producer } from 'kafkajs';

/**
 * Kafka Producer Service
 *
 * Handles producing Kafka events for the User Service.
 */
@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private isConnected = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(KafkaProducerService.name);

    // Initialize Kafka client
    this.kafka = new Kafka({
      clientId: 'user-service-producer',
      brokers: this.configService
        .get<string>('KAFKA_BROKERS', 'kafka:29092')
        .split(','),
    });

    // Initialize producer
    this.producer = this.kafka.producer();
  }

  /**
   * Connect to Kafka when the module initializes
   */
  async onModuleInit() {
    try {
      await this.connect();
      this.loggingService.log('Kafka producer connected successfully');
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to initialize Kafka producer',
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
        await this.producer.disconnect();
        this.isConnected = false;
        this.loggingService.log('Kafka producer disconnected');
      } catch (error) {
        this.errorLogger.error(
          error instanceof Error ? error : new Error(String(error)),
          'Error disconnecting Kafka producer',
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
      await this.producer.connect();
      this.isConnected = true;
    }
  }

  /**
   * Send a message to a Kafka topic
   * @param topic - The topic to send the message to
   * @param message - The message to send
   * @param key - Optional message key
   */
  async send(topic: string, message: any, key?: string): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const messageValue = JSON.stringify(message);

      await this.producer.send({
        topic,
        messages: [
          {
            key: key ? key : undefined,
            value: messageValue,
          },
        ],
      });

      this.loggingService.debug(
        `Sent message to Kafka topic: ${topic}`,
        'send',
        {
          topic,
          eventType: message.type,
          key,
        },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Error sending message to Kafka topic: ${topic}`,
        {
          topic,
          eventType: message.type,
          key,
          error: error instanceof Error ? error.stack : String(error),
        },
      );
      throw error;
    }
  }
}

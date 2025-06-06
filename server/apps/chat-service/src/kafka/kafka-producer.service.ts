import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import { BaseEvent } from '@app/events';

/**
 * Chat Service Kafka Producer Service
 *
 * Handles publishing events to Kafka topics for inter-service communication.
 */
@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private isConnected = false;

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(KafkaProducerService.name);
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.connect();
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to initialize Kafka producer',
        {
          source: KafkaProducerService.name,
          method: 'onModuleInit',
        },
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.disconnect();
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to disconnect Kafka producer',
        {
          source: KafkaProducerService.name,
          method: 'onModuleDestroy',
        },
      );
    }
  }

  private async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await this.kafkaClient.connect();
      this.isConnected = true;
      this.loggingService.log(
        'Kafka producer connected successfully',
        'connect',
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to connect to Kafka',
        {
          source: KafkaProducerService.name,
          method: 'connect',
        },
      );
      throw error;
    }
  }

  private async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.kafkaClient.close();
      this.isConnected = false;
      this.loggingService.log(
        'Kafka producer disconnected successfully',
        'disconnect',
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        'Failed to disconnect from Kafka',
        {
          source: KafkaProducerService.name,
          method: 'disconnect',
        },
      );
      throw error;
    }
  }

  /**
   * Send a message to a Kafka topic
   * @param topic - The topic to send the message to
   * @param event - The event to send
   * @param key - Optional message key
   */
  async send<T extends BaseEvent>(
    topic: string,
    event: T,
    key?: string,
  ): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      this.loggingService.debug(
        `Sending message to Kafka topic: ${topic}`,
        'send',
        {
          topic,
          eventType: event.type,
          key,
        },
      );

      const messageValue = JSON.stringify(event);

      await this.kafkaClient.emit(topic, {
        key: key ? key : undefined,
        value: messageValue,
      });

      this.loggingService.debug(
        `Sent message to Kafka topic: ${topic}`,
        'send',
        {
          topic,
          eventType: event.type,
          key,
        },
      );
    } catch (error) {
      this.errorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        `Failed to send message to Kafka topic: ${topic}`,
        {
          source: KafkaProducerService.name,
          method: 'send',
          topic,
          eventType: event.type,
          key,
        },
      );
      throw error;
    }
  }
}

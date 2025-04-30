import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka, KafkaMessage } from 'kafkajs';
import { LogMessage } from './log-message.interface';
import { LogMessageValidator } from './log-message.validator';

/**
 * Service for consuming log messages from Kafka
 */
@Injectable()
export class LogConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LogConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;
  private isConnected = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly logMessageValidator: LogMessageValidator,
  ) {
    // Initialize Kafka client
    this.kafka = new Kafka({
      clientId: this.configService.get<string>(
        'KAFKA_CONSUMER_GROUP',
        'logging-service',
      ),
      brokers: this.getBrokers(),
    });

    // Initialize consumer
    this.consumer = this.kafka.consumer({
      groupId: this.configService.get<string>(
        'KAFKA_CONSUMER_GROUP',
        'logging-service',
      ),
      maxBytes: this.configService.get<number>('KAFKA_MAX_BYTES', 1048576),
    });
  }

  /**
   * Connect to Kafka and subscribe to the logs topic when the module initializes
   */
  async onModuleInit() {
    try {
      await this.connect();
      this.logger.log('Kafka consumer connected successfully');

      // Subscribe to the logs topic
      const topic = this.configService.get<string>('KAFKA_LOGS_TOPIC', 'logs');
      await this.consumer.subscribe({ topic, fromBeginning: false });
      this.logger.log(`Subscribed to Kafka topic: ${topic}`);

      // Start consuming messages
      await this.startConsuming();
      this.logger.log('Kafka consumer started successfully');
    } catch (error) {
      this.logger.error(
        `Failed to initialize Kafka consumer: ${error.message}`,
        error.stack,
      );
      // Don't throw here to allow the service to start even if Kafka is not available
      // The service will retry connecting in the background
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
        this.logger.log('Kafka consumer disconnected');
      } catch (error) {
        this.logger.error(
          `Error disconnecting Kafka consumer: ${error.message}`,
          error.stack,
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
          const parsedMessage = this.parseMessage(message);
          const validationResult =
            this.logMessageValidator.validate(parsedMessage);

          if (!validationResult.isValid) {
            this.logger.warn(`Invalid log message: ${validationResult.error}`, {
              topic,
              partition,
              offset: message.offset,
              key: message.key?.toString(),
            });
            return;
          }

          // Sanitize the message to ensure it has the correct format
          const sanitizedMessage =
            this.logMessageValidator.sanitize(parsedMessage);

          // Process the log message
          this.processLogMessage(sanitizedMessage);
        } catch (error) {
          this.logger.error(
            `Error processing Kafka message: ${error.message}`,
            error.stack,
          );
        }
      },
    });
  }

  /**
   * Parse a Kafka message into a log message
   * @param message The Kafka message to parse
   * @returns The parsed log message
   */
  private parseMessage(message: KafkaMessage): any {
    try {
      // Parse the message value
      const value = message.value?.toString();
      if (!value) {
        throw new Error('Empty message value');
      }

      // Parse the message key (service name)
      const key = message.key?.toString();

      // Parse headers
      const headers: Record<string, string> = {};
      if (message.headers) {
        for (const [headerKey, headerValue] of Object.entries(
          message.headers,
        )) {
          if (headerValue) {
            headers[headerKey] = headerValue.toString();
          }
        }
      }

      // Parse the message value as JSON
      const parsedValue = JSON.parse(value);

      // If the service is not specified in the message, use the key
      if (key && !parsedValue.service) {
        parsedValue.service = key;
      }

      return parsedValue;
    } catch (error) {
      throw new Error(`Failed to parse Kafka message: ${error.message}`);
    }
  }

  /**
   * Process a log message
   * This is a placeholder for now - in the next steps we'll add actual processing
   * @param logMessage The log message to process
   */
  private processLogMessage(logMessage: LogMessage) {
    // For now, just log the message to the console
    // In the next steps, we'll add actual processing and forwarding to Loki
    this.logger.debug(`Received log message: ${JSON.stringify(logMessage)}`);
  }

  /**
   * Get Kafka brokers from environment variables
   * @returns Array of Kafka broker addresses
   */
  private getBrokers(): string[] {
    const brokersStr = this.configService.get<string>(
      'KAFKA_BROKERS',
      'kafka:29092',
    );
    return brokersStr.split(',').map((broker) => broker.trim());
  }
}

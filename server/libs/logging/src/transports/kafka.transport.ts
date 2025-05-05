import * as Transport from 'winston-transport';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import {
  LogMessage,
  LogLevel,
  LogMetadata,
  BaseLogMetadata,
} from '../interfaces/log-message.interface';

/**
 * Options for the Kafka Winston transport
 */
export interface KafkaTransportOptions
  extends Transport.TransportStreamOptions {
  /**
   * Kafka broker addresses
   * @example ['localhost:9092']
   */
  brokers: string[];

  /**
   * Kafka client ID
   * @default 'winston-kafka-transport'
   */
  clientId?: string;

  /**
   * Kafka topic to send logs to
   * @default 'logs'
   */
  topic?: string;

  /**
   * Service name to include in log messages
   * @default 'application'
   */
  service: string;

  /**
   * Default context to include in log messages
   * @default 'Application'
   */
  defaultContext?: string;

  /**
   * Fields to redact from log messages
   * @example ['password', 'token', 'secret']
   */
  redactFields?: string[];

  /**
   * Whether to include metadata in log messages
   * @default true
   */
  includeMetadata?: boolean;
}

/**
 * Winston transport for sending logs to Kafka
 */
export class KafkaTransport extends Transport {
  private producer: Producer;
  private connected = false;
  private readonly topic: string;
  private readonly service: string;
  private readonly defaultContext: string;
  private readonly redactFields: string[];
  private readonly includeMetadata: boolean;
  private context?: string;
  private requestId?: string;
  private userId?: string;

  constructor(options: KafkaTransportOptions) {
    super(options);

    // Initialize options with defaults
    this.topic = options.topic || 'logs';
    this.service = options.service;
    this.defaultContext = options.defaultContext || 'Application';
    this.redactFields = options.redactFields || [];
    this.includeMetadata = options.includeMetadata !== false;

    // Initialize Kafka client
    const kafka = new Kafka({
      clientId: options.clientId || 'winston-kafka-transport',
      brokers: options.brokers,
    });

    // Initialize producer
    this.producer = kafka.producer();

    // Connect to Kafka
    this.connect().catch((err) => {
      console.error('Failed to connect to Kafka:', err);
    });
  }

  /**
   * Connect to Kafka
   */
  private async connect(): Promise<void> {
    if (!this.connected) {
      try {
        await this.producer.connect();
        this.connected = true;
      } catch (error) {
        console.error('Error connecting to Kafka:', error);
        throw error;
      }
    }
  }

  /**
   * Disconnect from Kafka
   */
  async close(): Promise<void> {
    if (this.connected) {
      try {
        await this.producer.disconnect();
        this.connected = false;
      } catch (error) {
        console.error('Error disconnecting from Kafka:', error);
      }
    }
  }

  /**
   * Set the context for log messages
   * @param context The context to set
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Set the request ID for log messages
   * @param requestId The request ID to set
   */
  setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  /**
   * Set the user ID for log messages
   * @param userId The user ID to set
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Log method called by Winston
   * @param info The log information
   * @param callback Callback function
   */
  async log(info: Record<string, any>, callback: () => void): Promise<void> {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // Ensure we're connected to Kafka
    if (!this.connected) {
      try {
        await this.connect();
      } catch (error) {
        console.error('Failed to connect to Kafka:', error);
        callback();
        return;
      }
    }

    try {
      // Format the log message
      const logMessage = this.formatLogMessage(info);

      // Send the log message to Kafka
      await this.sendToKafka(logMessage);

      callback();
    } catch (error) {
      console.error('Error sending log to Kafka:', error);
      callback();
    }
  }

  /**
   * Format the log message
   * @param info The log information
   * @returns The formatted log message
   */
  private formatLogMessage(info: Record<string, any>): LogMessage<LogMetadata> {
    // Extract log level
    const level = this.mapWinstonLevelToLogLevel(String(info.level || 'info'));

    // Extract message
    const message = String(info.message || '');

    // Extract stack trace for errors
    const stack = info.stack || info.meta?.stack || undefined;

    // Extract context
    const context = this.context || info.context || this.defaultContext;

    // Create the log message
    const logMessage: LogMessage<LogMetadata> = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
      context,
    };

    // Add request ID if available
    if (this.requestId || info.requestId) {
      logMessage.requestId = this.requestId || String(info.requestId);
    }

    // Add user ID if available
    if (this.userId || info.userId) {
      logMessage.userId = this.userId || String(info.userId);
    }

    // Add stack trace if available
    if (stack) {
      logMessage.stack = String(stack);
    }

    // Add error code if available
    if (info.code) {
      logMessage.code = info.code;
    }

    // Add metadata if enabled
    if (this.includeMetadata && (info.meta || info.metadata)) {
      const metaData = info.meta || info.metadata || {};
      logMessage.metadata = this.redactSensitiveData(metaData);
    }

    return logMessage;
  }

  /**
   * Map Winston log levels to our log levels
   * @param winstonLevel The Winston log level
   * @returns The corresponding log level
   */
  private mapWinstonLevelToLogLevel(winstonLevel: string): LogLevel {
    switch (winstonLevel.toLowerCase()) {
      case 'error':
        return LogLevel.ERROR;
      case 'warn':
        return LogLevel.WARN;
      case 'info':
        return LogLevel.INFO;
      case 'debug':
        return LogLevel.DEBUG;
      case 'verbose':
      case 'silly':
        return LogLevel.VERBOSE;
      default:
        return LogLevel.INFO;
    }
  }

  /**
   * Redact sensitive data from metadata
   * @param metadata The metadata to redact
   * @returns The redacted metadata
   */
  private redactSensitiveData(
    metadata: Record<string, any>,
  ): Record<string, any> {
    if (!metadata || typeof metadata !== 'object') {
      return metadata;
    }

    const redacted = { ...metadata };

    // Redact sensitive fields
    for (const field of this.redactFields) {
      if (field in redacted) {
        redacted[field] = '[REDACTED]';
      }
    }

    return redacted;
  }

  /**
   * Send a log message to Kafka
   * @param logMessage The log message to send
   */
  private async sendToKafka<T extends LogMetadata = BaseLogMetadata>(
    logMessage: LogMessage<T>,
  ): Promise<void> {
    // Create the Kafka message
    const record: ProducerRecord = {
      topic: this.topic,
      messages: [
        {
          // Use service name as key for partitioning
          key: logMessage.service,
          // Serialize the log message as JSON
          value: JSON.stringify(logMessage),
          // Add headers for additional metadata
          headers: {
            timestamp: logMessage.timestamp || new Date().toISOString(),
            level: logMessage.level,
          },
        },
      ],
    };

    // Send the message to Kafka
    await this.producer.send(record);
  }
}

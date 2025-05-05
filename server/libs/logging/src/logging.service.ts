import { Injectable, Inject, Optional } from '@nestjs/common';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';
import {
  KafkaTransport,
  KafkaTransportOptions,
} from './transports/kafka.transport';
import { LogLevel } from './interfaces/log-message.interface';

/**
 * Configuration options for the logging module
 */
export interface LoggingModuleOptions {
  /**
   * Service name to include in log messages
   */
  service: string;

  /**
   * Log level
   * @default 'info'
   */
  level?: LogLevel;

  /**
   * Kafka configuration
   */
  kafka?: {
    /**
     * Kafka topic to send logs to
     * @default 'logs'
     */
    topic?: string;

    /**
     * Kafka client ID
     * @default 'winston-kafka-transport'
     */
    clientId?: string;

    /**
     * Kafka broker addresses
     * @example ['localhost:9092']
     */
    brokers: string[];
  };

  /**
   * Whether to log to console
   * @default true
   */
  console?: boolean;

  /**
   * Fields to redact from log messages
   * @example ['password', 'token', 'secret']
   */
  redactFields?: string[];
}

/**
 * Service for logging messages to Kafka and console
 */
@Injectable()
export class LoggingService {
  private readonly logger: winston.Logger;
  private readonly kafkaTransport?: KafkaTransport;
  private context?: string;
  private requestId?: string;
  private userId?: string;

  constructor(
    @Optional() private readonly configService?: ConfigService,
    @Optional()
    @Inject('LOGGING_OPTIONS')
    private readonly options?: LoggingModuleOptions,
  ) {
    // Get options from config service or use provided options
    const service = this.getOption('service', 'application');
    const level = this.getOption('level', LogLevel.INFO);
    const redactFields = this.getOption('redactFields', []);
    const enableConsole = this.getOption('console', true);

    // Create transports array
    const transports: winston.transport[] = [];

    // Add console transport if enabled
    if (enableConsole) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(
              ({ timestamp, level, message, context, ...meta }) => {
                return `${timestamp} [${level}] [${context || this.context || 'Application'}] ${message} ${
                  Object.keys(meta).length ? JSON.stringify(meta) : ''
                }`;
              },
            ),
          ),
        }),
      );
    }

    // Add Kafka transport if configured
    const kafkaConfig = this.getOption('kafka', undefined);
    if (kafkaConfig && kafkaConfig.brokers && kafkaConfig.brokers.length > 0) {
      const kafkaOptions: KafkaTransportOptions = {
        brokers: kafkaConfig.brokers,
        clientId: kafkaConfig.clientId || 'winston-kafka-transport',
        topic: kafkaConfig.topic || 'logs',
        service,
        level,
        redactFields,
      };

      this.kafkaTransport = new KafkaTransport(kafkaOptions);
      transports.push(this.kafkaTransport);
    }

    // Create Winston logger
    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      defaultMeta: {
        service,
      },
      transports,
    });
  }

  /**
   * Get an option from config service or options object
   * @param key The option key
   * @param defaultValue The default value
   * @returns The option value
   */
  private getOption<T>(key: string, defaultValue: T): T {
    if (this.options && key in this.options) {
      return this.options[key as keyof LoggingModuleOptions] as unknown as T;
    }

    if (this.configService) {
      const value = this.configService.get<T>(`logging.${key}`);
      if (value !== undefined) {
        return value;
      }
    }

    return defaultValue;
  }

  /**
   * Set the context for log messages
   * @param context The context to set
   */
  setContext(context: string): void {
    this.context = context;
    if (this.kafkaTransport) {
      this.kafkaTransport.setContext(context);
    }
  }

  /**
   * Set the request ID for log messages
   * @param requestId The request ID to set
   */
  setRequestId(requestId: string): void {
    this.requestId = requestId;
    if (this.kafkaTransport) {
      this.kafkaTransport.setRequestId(requestId);
    }
  }

  /**
   * Set the user ID for log messages
   * @param userId The user ID to set
   */
  setUserId(userId: string): void {
    this.userId = userId;
    if (this.kafkaTransport) {
      this.kafkaTransport.setUserId(userId);
    }
  }

  /**
   * Log a message at the 'info' level
   * @param message The message to log
   * @param context The context of the message
   * @param metadata Additional metadata
   */
  log(message: string, context?: string, metadata?: Record<string, any>): void {
    this.logger.info(message, {
      context: context || this.context,
      requestId: this.requestId,
      userId: this.userId,
      ...metadata,
    });
  }

  /**
   * Log a message at the 'error' level
   * @param message The message to log
   * @param trace The error stack trace
   * @param context The context of the message
   * @param metadata Additional metadata
   */
  error(
    message: string,
    trace?: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    this.logger.error(message, {
      stack: trace,
      context: context || this.context,
      requestId: this.requestId,
      userId: this.userId,
      ...metadata,
    });
  }

  /**
   * Log a message at the 'warn' level
   * @param message The message to log
   * @param context The context of the message
   * @param metadata Additional metadata
   */
  warn(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    this.logger.warn(message, {
      context: context || this.context,
      requestId: this.requestId,
      userId: this.userId,
      ...metadata,
    });
  }

  /**
   * Log a message at the 'debug' level
   * @param message The message to log
   * @param context The context of the message
   * @param metadata Additional metadata
   */
  debug(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    this.logger.debug(message, {
      context: context || this.context,
      requestId: this.requestId,
      userId: this.userId,
      ...metadata,
    });
  }

  /**
   * Log a message at the 'verbose' level
   * @param message The message to log
   * @param context The context of the message
   * @param metadata Additional metadata
   */
  verbose(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    this.logger.verbose(message, {
      context: context || this.context,
      requestId: this.requestId,
      userId: this.userId,
      ...metadata,
    });
  }

  /**
   * Close the logger and its transports
   */
  async close(): Promise<void> {
    if (this.kafkaTransport) {
      await this.kafkaTransport.close();
    }
  }
}

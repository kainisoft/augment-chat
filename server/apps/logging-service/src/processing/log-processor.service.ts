import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogMessage, LogLevel } from '../kafka/log-message.interface';
import { LogFilterService } from './log-filter.service';
import { LogBatchService } from './log-batch.service';

/**
 * Service for processing and enriching log messages
 */
@Injectable()
export class LogProcessorService {
  private readonly logger = new Logger(LogProcessorService.name);
  private readonly defaultCorrelationIdPrefix = 'corr-';

  constructor(
    private readonly configService: ConfigService,
    private readonly logFilterService: LogFilterService,
    private readonly logBatchService: LogBatchService,
  ) {}

  /**
   * Process a log message
   * @param logMessage The log message to process
   * @returns The processed log message, or null if the message should be filtered out
   */
  processLogMessage(logMessage: LogMessage): LogMessage | null {
    try {
      // Step 1: Apply filtering
      if (!this.logFilterService.shouldProcessLog(logMessage)) {
        return null;
      }

      // Step 2: Enrich the log message
      const enrichedLog = this.enrichLogMessage(logMessage);

      // Step 3: Add to batch for efficient processing
      this.logBatchService.addToBatch(enrichedLog);

      return enrichedLog;
    } catch (error) {
      this.logger.error(
        `Error processing log message: ${error.message}`,
        error.stack,
      );
      // Return the original message in case of error to ensure it's not lost
      return logMessage;
    }
  }

  /**
   * Enrich a log message with additional metadata
   * @param logMessage The log message to enrich
   * @returns The enriched log message
   */
  private enrichLogMessage(logMessage: LogMessage): LogMessage {
    const enriched = { ...logMessage };

    // Add timestamp if missing
    if (!enriched.timestamp) {
      enriched.timestamp = new Date().toISOString();
    }

    // Add correlation ID if missing but request ID exists
    if (!enriched.traceId && enriched.requestId) {
      enriched.traceId = `${this.defaultCorrelationIdPrefix}${enriched.requestId}`;
    }

    // Add or enhance metadata
    enriched.metadata = {
      ...enriched.metadata,
      processedAt: new Date().toISOString(),
      loggingService: {
        version: this.configService.get<string>('SERVICE_VERSION', '1.0.0'),
        environment: this.configService.get<string>('NODE_ENV', 'development'),
      },
    };

    // Add normalized error information for error logs
    if (enriched.level === LogLevel.ERROR && enriched.stack) {
      enriched.metadata = {
        ...enriched.metadata,
        error: {
          stack: enriched.stack,
          code: enriched.code || 'UNKNOWN_ERROR',
        },
      };
    }

    return enriched;
  }

  /**
   * Process a batch of log messages
   * @param logMessages The log messages to process
   * @returns The processed log messages
   */
  processBatch(logMessages: LogMessage[]): LogMessage[] {
    return logMessages
      .map((message) => this.processLogMessage(message))
      .filter((message) => message !== null) as LogMessage[];
  }
}

import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogMessage } from '../kafka/log-message.interface';

/**
 * Service for batching log messages for efficient processing
 */
@Injectable()
export class LogBatchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LogBatchService.name);
  private batch: LogMessage[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly defaultBatchSize = 100;
  private readonly defaultBatchWaitMs = 1000;
  private batchProcessors: Array<(batch: LogMessage[]) => Promise<void>> = [];

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initialize the batch timer when the module is initialized
   */
  onModuleInit() {
    this.startBatchTimer();
  }

  /**
   * Clear the batch timer when the module is destroyed
   */
  onModuleDestroy() {
    this.stopBatchTimer();
  }

  /**
   * Add a log message to the current batch
   * @param logMessage The log message to add
   */
  addToBatch(logMessage: LogMessage): void {
    this.batch.push(logMessage);

    // If batch size threshold is reached, process the batch
    if (this.batch.length >= this.getBatchSize()) {
      this.processBatch();
    }
  }

  /**
   * Register a batch processor function
   * @param processor Function that processes a batch of log messages
   */
  registerBatchProcessor(
    processor: (batch: LogMessage[]) => Promise<void>,
  ): void {
    this.batchProcessors.push(processor);
  }

  /**
   * Process the current batch of log messages
   */
  async processBatch(): Promise<void> {
    if (this.batch.length === 0) {
      return;
    }

    const currentBatch = [...this.batch];
    this.batch = [];

    try {
      this.logger.debug(
        `Processing batch of ${currentBatch.length} log messages`,
      );

      // Call all registered batch processors
      for (const processor of this.batchProcessors) {
        await processor(currentBatch);
      }
    } catch (error) {
      this.logger.error(
        `Error processing batch: ${error.message}`,
        error.stack,
      );

      // In case of error, add the logs back to the batch to retry
      // But limit the batch size to avoid memory issues
      const maxBatchSize = this.getBatchSize() * 2;
      this.batch = [...this.batch, ...currentBatch].slice(-maxBatchSize);
    }
  }

  /**
   * Start the batch timer to periodically process batches
   */
  private startBatchTimer(): void {
    if (this.batchTimer) {
      this.stopBatchTimer();
    }

    const batchWaitMs = this.getBatchWaitMs();
    this.batchTimer = setInterval(() => {
      this.processBatch();
    }, batchWaitMs);
  }

  /**
   * Stop the batch timer
   */
  private stopBatchTimer(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Get the configured batch size
   * @returns The batch size
   */
  private getBatchSize(): number {
    return this.configService.get<number>(
      'LOKI_BATCH_SIZE',
      this.defaultBatchSize,
    );
  }

  /**
   * Get the configured batch wait time in milliseconds
   * @returns The batch wait time
   */
  private getBatchWaitMs(): number {
    return this.configService.get<number>(
      'LOKI_BATCH_WAIT_MS',
      this.defaultBatchWaitMs,
    );
  }
}

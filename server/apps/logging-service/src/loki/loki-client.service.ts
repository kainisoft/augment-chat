import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogMessage } from '../kafka/log-message.interface';
import { LokiLabelService } from './loki-label.service';
import {
  LokiPushRequest,
  LokiStream,
  LokiErrorResponse,
} from './loki-push.interface';

/**
 * Service for sending logs to Loki
 */
@Injectable()
export class LokiClientService implements OnModuleInit {
  private readonly logger = new Logger(LokiClientService.name);
  private readonly defaultLokiUrl = 'http://loki:3100';
  private readonly pushEndpoint = '/loki/api/v1/push';
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 1000;
  private lokiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly lokiLabelService: LokiLabelService,
  ) {
    this.lokiUrl = this.configService.get<string>(
      'LOKI_URL',
      this.defaultLokiUrl,
    );
  }

  /**
   * Initialize the Loki client
   */
  async onModuleInit() {
    this.logger.log(`Loki client initialized with URL: ${this.lokiUrl}`);

    // Test connection to Loki
    try {
      const isAvailable = await this.checkLokiAvailability();
      if (isAvailable) {
        this.logger.log('Successfully connected to Loki');
      } else {
        this.logger.warn(
          'Could not connect to Loki. Will retry on first log submission.',
        );
      }
    } catch (error: any) {
      this.logger.warn(`Error connecting to Loki: ${error.message}`);
    }
  }

  /**
   * Send logs to Loki
   * @param logMessages The log messages to send
   * @returns A promise that resolves when the logs are sent
   */
  async sendLogs(logMessages: LogMessage[]): Promise<void> {
    if (logMessages.length === 0) {
      return;
    }

    try {
      // Group logs by labels for efficient batching
      const groupedLogs = this.lokiLabelService.groupByLabels(logMessages);

      // Create streams for each group
      const streams: LokiStream[] = [];

      for (const [labelKey, messages] of groupedLogs.entries()) {
        // Parse the label key back into a record
        const labels = this.parseLabelsFromString(labelKey);

        // Create values array for this stream
        const values = messages.map((message) => {
          // Convert timestamp to Loki format (nanoseconds since epoch)
          const timestamp = this.getTimestampForLoki(message.timestamp);

          // Stringify the log message for Loki
          const logContent = JSON.stringify(message);

          return [timestamp, logContent];
        });

        // Add the stream
        streams.push({
          stream: labels,
          values,
        });
      }

      // Create the push request
      const pushRequest: LokiPushRequest = { streams };

      // Send to Loki with retry logic
      await this.pushToLoki(pushRequest);

      this.logger.debug(`Successfully sent ${logMessages.length} logs to Loki`);
    } catch (error: any) {
      this.logger.error(
        `Error sending logs to Loki: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Push logs to Loki with retry logic
   * @param pushRequest The Loki push request
   * @returns A promise that resolves when the logs are sent
   */
  private async pushToLoki(pushRequest: LokiPushRequest): Promise<void> {
    let retries = 0;
    let lastError: Error | null = null;

    while (retries < this.maxRetries) {
      try {
        const response = await fetch(`${this.lokiUrl}${this.pushEndpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pushRequest),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as LokiErrorResponse;
          throw new Error(
            `Loki API error: ${errorData.message || response.statusText}`,
          );
        }

        // Success
        return;
      } catch (error: any) {
        lastError = error;
        retries++;

        if (retries < this.maxRetries) {
          this.logger.warn(
            `Retrying Loki push (${retries}/${this.maxRetries}): ${error.message}`,
          );
          await this.delay(this.retryDelayMs * retries);
        }
      }
    }

    // If we get here, all retries failed
    throw new Error(
      `Failed to push logs to Loki after ${this.maxRetries} attempts: ${lastError?.message}`,
    );
  }

  /**
   * Check if Loki is available
   * @returns A promise that resolves to true if Loki is available
   */
  private async checkLokiAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.lokiUrl}/ready`, {
        method: 'GET',
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert a timestamp to Loki format (nanoseconds since epoch)
   * @param timestamp The timestamp to convert (ISO string or Date)
   * @returns The timestamp in Loki format
   */
  private getTimestampForLoki(timestamp?: string | Date): string {
    const date = timestamp
      ? typeof timestamp === 'string'
        ? new Date(timestamp)
        : timestamp
      : new Date();

    // Convert to nanoseconds (Loki expects nanoseconds)
    const timestampNs = date.getTime() * 1000000;

    return timestampNs.toString();
  }

  /**
   * Parse labels from a string representation
   * @param labelString The string representation of labels
   * @returns A record of labels
   */
  private parseLabelsFromString(labelString: string): Record<string, string> {
    const labels: Record<string, string> = {};

    labelString.split(',').forEach((pair) => {
      const [key, value] = pair.split('=');
      if (key && value) {
        labels[key] = value;
      }
    });

    return labels;
  }

  /**
   * Delay execution for a specified time
   * @param ms The number of milliseconds to delay
   * @returns A promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

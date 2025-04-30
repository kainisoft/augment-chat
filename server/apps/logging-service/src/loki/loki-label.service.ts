import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogMessage } from '../kafka/log-message.interface';
import { LokiLabel } from './loki-push.interface';

/**
 * Service for managing Loki labels
 */
@Injectable()
export class LokiLabelService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Generate Loki labels for a log message
   * @param logMessage The log message to generate labels for
   * @returns A record of labels
   */
  generateLabels(logMessage: LogMessage): Record<string, string> {
    const labels: Record<string, string> = {};

    // Add required labels
    labels[LokiLabel.SERVICE] = logMessage.service;
    labels[LokiLabel.LEVEL] = logMessage.level;

    // Add environment label
    labels[LokiLabel.ENVIRONMENT] = this.configService.get<string>(
      'NODE_ENV',
      'development',
    );

    // Add optional labels if they exist
    if (logMessage.context) {
      labels[LokiLabel.CONTEXT] = this.sanitizeLabel(logMessage.context);
    }

    if (logMessage.requestId) {
      labels[LokiLabel.REQUEST_ID] = this.sanitizeLabel(logMessage.requestId);
    }

    if (logMessage.userId) {
      labels[LokiLabel.USER_ID] = this.sanitizeLabel(logMessage.userId);
    }

    if (logMessage.traceId) {
      labels[LokiLabel.TRACE_ID] = this.sanitizeLabel(logMessage.traceId);
    }

    return labels;
  }

  /**
   * Group log messages by their labels
   * This helps to efficiently batch logs with the same labels
   * @param logMessages The log messages to group
   * @returns A map of label strings to log messages
   */
  groupByLabels(logMessages: LogMessage[]): Map<string, LogMessage[]> {
    const groups = new Map<string, LogMessage[]>();

    for (const message of logMessages) {
      // Generate labels for the message
      const labels = this.generateLabels(message);
      
      // Create a key from the labels
      const key = this.labelsToString(labels);
      
      // Add the message to the appropriate group
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(message);
    }

    return groups;
  }

  /**
   * Convert labels to a string for use as a map key
   * @param labels The labels to convert
   * @returns A string representation of the labels
   */
  private labelsToString(labels: Record<string, string>): string {
    return Object.entries(labels)
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join(',');
  }

  /**
   * Sanitize a label value to ensure it's valid for Loki
   * @param value The label value to sanitize
   * @returns The sanitized label value
   */
  private sanitizeLabel(value: string): string {
    // Replace characters that might cause issues in Loki queries
    return value
      .replace(/[\\"\n\r\t]/g, '_') // Replace newlines, tabs, quotes, backslashes
      .replace(/\s+/g, '_')         // Replace whitespace with underscores
      .substring(0, 100);           // Limit length to avoid issues
  }
}

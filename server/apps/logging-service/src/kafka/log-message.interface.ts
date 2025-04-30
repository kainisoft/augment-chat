/**
 * Interface for log messages received from Kafka
 */
export interface LogMessage {
  // Basic log information
  level: LogLevel;
  message: string;
  timestamp?: string; // ISO string format

  // Context information
  service: string;
  context?: string;

  // Additional metadata
  requestId?: string;
  userId?: string;
  traceId?: string;

  // Error specific fields
  stack?: string;
  code?: string | number;

  // Additional metadata as key-value pairs
  metadata?: Record<string, any>;
}

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

/**
 * Raw Kafka message format
 */
export interface KafkaLogMessage {
  key: string; // Service name (for partitioning)
  value: string; // JSON stringified LogMessage
  headers?: Record<string, string>; // Optional Kafka headers
  partition?: number;
  offset?: string;
  timestamp?: string;
}

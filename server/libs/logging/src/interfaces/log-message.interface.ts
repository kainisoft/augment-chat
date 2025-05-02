/**
 * Interface for log messages sent to Kafka
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

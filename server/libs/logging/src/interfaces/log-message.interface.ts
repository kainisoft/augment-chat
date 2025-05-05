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
 * Base metadata interface that all service-specific metadata should extend
 */
export interface BaseLogMetadata {
  requestId?: string;
  correlationId?: string;
  duration?: number;
  [key: string]: any; // Allow additional properties but with type safety for known ones
}

/**
 * HTTP-specific metadata
 */
export interface HttpLogMetadata extends BaseLogMetadata {
  method: string;
  url: string;
  statusCode?: number;
  ip?: string;
  userAgent?: string;
}

/**
 * Auth-specific metadata
 */
export interface AuthLogMetadata extends BaseLogMetadata {
  userId?: string;
  username?: string;
  action: string;
  success?: boolean;
}

/**
 * User-specific metadata
 */
export interface UserLogMetadata extends BaseLogMetadata {
  userId: string;
  action: string;
  fields?: string[];
}

/**
 * Chat-specific metadata
 */
export interface ChatLogMetadata extends BaseLogMetadata {
  userId?: string;
  roomId?: string;
  messageId?: string;
  action: string;
}

/**
 * Notification-specific metadata
 */
export interface NotificationLogMetadata extends BaseLogMetadata {
  userId?: string;
  notificationType: string;
  notificationId?: string;
  channel?: string;
  success?: boolean;
}

/**
 * Database-specific metadata
 */
export interface DatabaseLogMetadata extends BaseLogMetadata {
  operation: string;
  table?: string;
  collection?: string;
  duration: number;
  recordCount?: number;
}

/**
 * Error-specific metadata
 */
export interface ErrorLogMetadata extends BaseLogMetadata {
  errorName?: string;
  errorCode?: string | number;
  stack?: string;
}

/**
 * Union type of all metadata types
 */
export type LogMetadata =
  | BaseLogMetadata
  | HttpLogMetadata
  | AuthLogMetadata
  | UserLogMetadata
  | ChatLogMetadata
  | NotificationLogMetadata
  | DatabaseLogMetadata
  | ErrorLogMetadata;

/**
 * Type guard to check if metadata is HttpLogMetadata
 */
export function isHttpLogMetadata(
  metadata: LogMetadata,
): metadata is HttpLogMetadata {
  return 'method' in metadata && 'url' in metadata;
}

/**
 * Type guard to check if metadata is AuthLogMetadata
 */
export function isAuthLogMetadata(
  metadata: LogMetadata,
): metadata is AuthLogMetadata {
  return 'action' in metadata && 'username' in metadata;
}

/**
 * Type guard to check if metadata is UserLogMetadata
 */
export function isUserLogMetadata(
  metadata: LogMetadata,
): metadata is UserLogMetadata {
  return 'userId' in metadata && 'action' in metadata && 'fields' in metadata;
}

/**
 * Type guard to check if metadata is ChatLogMetadata
 */
export function isChatLogMetadata(
  metadata: LogMetadata,
): metadata is ChatLogMetadata {
  return 'action' in metadata && 'roomId' in metadata;
}

/**
 * Type guard to check if metadata is NotificationLogMetadata
 */
export function isNotificationLogMetadata(
  metadata: LogMetadata,
): metadata is NotificationLogMetadata {
  return 'notificationType' in metadata;
}

/**
 * Type guard to check if metadata is DatabaseLogMetadata
 */
export function isDatabaseLogMetadata(
  metadata: LogMetadata,
): metadata is DatabaseLogMetadata {
  return 'operation' in metadata && 'duration' in metadata;
}

/**
 * Type guard to check if metadata is ErrorLogMetadata
 */
export function isErrorLogMetadata(
  metadata: LogMetadata,
): metadata is ErrorLogMetadata {
  return (
    'errorName' in metadata || 'errorCode' in metadata || 'stack' in metadata
  );
}

/**
 * Interface for log messages sent to Kafka
 */
export interface LogMessage<T extends LogMetadata = BaseLogMetadata> {
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

  // Typed metadata
  metadata?: T;
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

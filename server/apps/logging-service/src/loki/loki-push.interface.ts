/**
 * Interface for Loki Push API
 * Based on the Loki API documentation: https://grafana.com/docs/loki/latest/api/#push-log-entries-to-loki
 */

/**
 * Loki Push Request format
 */
export interface LokiPushRequest {
  streams: LokiStream[];
}

/**
 * Loki Stream format
 */
export interface LokiStream {
  stream: Record<string, string>; // Labels for the log stream
  values: Array<[string, string]>; // Log entries [timestamp, log content]
}

/**
 * Loki Push Response format
 */
export interface LokiPushResponse {
  status?: string;
  message?: string;
}

/**
 * Loki Error Response format
 */
export interface LokiErrorResponse {
  status: string;
  message: string;
  error?: string;
}

/**
 * Loki Label format
 * Common labels used for efficient querying
 */
export enum LokiLabel {
  SERVICE = 'service',
  LEVEL = 'level',
  CONTEXT = 'context',
  REQUEST_ID = 'requestId',
  USER_ID = 'userId',
  TRACE_ID = 'traceId',
  ENVIRONMENT = 'environment',
}

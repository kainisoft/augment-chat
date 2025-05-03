import { randomUUID } from 'crypto';

/**
 * Utility for generating and managing request IDs
 */
export class RequestIdUtil {
  private static readonly REQUEST_ID_HEADER = 'X-Request-ID';
  private static readonly CORRELATION_ID_HEADER = 'X-Correlation-ID';

  /**
   * Generate a new request ID
   * @returns A new UUID v4 request ID
   */
  static generateRequestId(): string {
    return `req-${randomUUID()}`;
  }

  /**
   * Extract request ID from headers
   * @param headers The request headers
   * @returns The request ID from headers or a new one if not found
   */
  static extractRequestId(headers: Record<string, any>): string {
    // Try to get the request ID from headers (case-insensitive)
    const headerKeys = Object.keys(headers);
    const requestIdKey = headerKeys.find(
      (key) => key.toLowerCase() === this.REQUEST_ID_HEADER.toLowerCase(),
    );

    // Return the existing request ID or generate a new one
    return requestIdKey ? headers[requestIdKey] : this.generateRequestId();
  }

  /**
   * Extract correlation ID from headers
   * @param headers The request headers
   * @param requestId The request ID to use as fallback
   * @returns The correlation ID from headers or the request ID if not found
   */
  static extractCorrelationId(
    headers: Record<string, any>,
    requestId: string,
  ): string {
    // Try to get the correlation ID from headers (case-insensitive)
    const headerKeys = Object.keys(headers);
    const correlationIdKey = headerKeys.find(
      (key) => key.toLowerCase() === this.CORRELATION_ID_HEADER.toLowerCase(),
    );

    // Return the existing correlation ID or the request ID
    return correlationIdKey ? headers[correlationIdKey] : requestId;
  }
}

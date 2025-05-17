import { Injectable } from '@nestjs/common';
import { RedisService } from '@app/redis';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import {
  SecurityEvent,
  SecurityEventType,
} from './interfaces/security-event.interface';

/**
 * Security Logging Repository
 *
 * Repository for retrieving security logs from Redis
 */
@Injectable()
export class SecurityLoggingRepository {
  private readonly keyPrefix: string = 'security:logs:';

  constructor(
    private readonly redisService: RedisService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
  ) {
    this.loggingService.setContext(SecurityLoggingRepository.name);
  }

  /**
   * Get security logs for a user
   * @param userId User ID
   * @param limit Maximum number of logs to return
   * @param offset Offset for pagination
   * @param eventTypes Optional array of event types to filter by
   * @param startTime Optional start time for filtering (timestamp in ms)
   * @param endTime Optional end time for filtering (timestamp in ms)
   * @returns Promise resolving to an array of security events
   */
  async getUserLogs(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    eventTypes?: SecurityEventType[],
    startTime?: number,
    endTime?: number,
  ): Promise<SecurityEvent[]> {
    try {
      // Get all keys for this user
      const pattern = `${this.keyPrefix}${userId}:*`;
      const keys = await this.redisService.keys(pattern);

      // Sort keys by timestamp (descending)
      keys.sort((a, b) => {
        const timestampA = parseInt(a.split(':').pop() || '0', 10);
        const timestampB = parseInt(b.split(':').pop() || '0', 10);
        return timestampB - timestampA;
      });

      // Get values for keys
      const allEvents: SecurityEvent[] = [];
      for (const key of keys) {
        const data = await this.redisService.get(key);
        if (data) {
          allEvents.push(JSON.parse(data));
        }
      }

      // Apply filters
      let filteredEvents = allEvents;

      // Filter by event type
      if (eventTypes && eventTypes.length > 0) {
        filteredEvents = filteredEvents.filter((event) =>
          eventTypes.includes(event.type),
        );
      }

      // Filter by time range
      if (startTime) {
        filteredEvents = filteredEvents.filter(
          (event) => event.timestamp >= startTime,
        );
      }

      if (endTime) {
        filteredEvents = filteredEvents.filter(
          (event) => event.timestamp <= endTime,
        );
      }

      // Apply pagination
      const paginatedEvents = filteredEvents.slice(offset, offset + limit);

      return paginatedEvents;
    } catch (error) {
      this.errorLogger.error(error, 'Failed to get user security logs', {
        source: SecurityLoggingRepository.name,
        method: 'getUserLogs',
        userId,
      });
      return [];
    }
  }

  /**
   * Get all security logs
   * @param limit Maximum number of logs to return
   * @param offset Offset for pagination
   * @param eventTypes Optional array of event types to filter by
   * @param startTime Optional start time for filtering (timestamp in ms)
   * @param endTime Optional end time for filtering (timestamp in ms)
   * @returns Promise resolving to an array of security events
   */
  async getAllLogs(
    limit: number = 100,
    offset: number = 0,
    eventTypes?: SecurityEventType[],
    startTime?: number,
    endTime?: number,
  ): Promise<SecurityEvent[]> {
    try {
      // Get all security log keys
      const pattern = `${this.keyPrefix}*`;
      const keys = await this.redisService.keys(pattern);

      // Sort keys by timestamp (descending)
      keys.sort((a, b) => {
        const timestampA = parseInt(a.split(':').pop() || '0', 10);
        const timestampB = parseInt(b.split(':').pop() || '0', 10);
        return timestampB - timestampA;
      });

      // Get values for keys
      const allEvents: SecurityEvent[] = [];
      for (const key of keys) {
        const data = await this.redisService.get(key);
        if (data) {
          allEvents.push(JSON.parse(data));
        }
      }

      // Apply filters
      let filteredEvents = allEvents;

      // Filter by event type
      if (eventTypes && eventTypes.length > 0) {
        filteredEvents = filteredEvents.filter((event) =>
          eventTypes.includes(event.type),
        );
      }

      // Filter by time range
      if (startTime) {
        filteredEvents = filteredEvents.filter(
          (event) => event.timestamp >= startTime,
        );
      }

      if (endTime) {
        filteredEvents = filteredEvents.filter(
          (event) => event.timestamp <= endTime,
        );
      }

      // Apply pagination
      const paginatedEvents = filteredEvents.slice(offset, offset + limit);

      return paginatedEvents;
    } catch (error) {
      this.errorLogger.error(error, 'Failed to get all security logs', {
        source: SecurityLoggingRepository.name,
        method: 'getAllLogs',
      });
      return [];
    }
  }

  /**
   * Get security event counts by type
   * @param userId Optional user ID to filter by
   * @param startTime Optional start time for filtering (timestamp in ms)
   * @param endTime Optional end time for filtering (timestamp in ms)
   * @returns Promise resolving to a map of event types to counts
   */
  async getEventCounts(
    userId?: string,
    startTime?: number,
    endTime?: number,
  ): Promise<Record<SecurityEventType, number>> {
    try {
      // Initialize counts
      const counts: Record<SecurityEventType, number> = {} as Record<
        SecurityEventType,
        number
      >;
      Object.values(SecurityEventType).forEach((type) => {
        counts[type] = 0;
      });

      // Get pattern based on whether userId is provided
      const pattern = userId
        ? `${this.keyPrefix}${userId}:*`
        : `${this.keyPrefix}*`;

      const keys = await this.redisService.keys(pattern);

      // Get values and count by type
      for (const key of keys) {
        const data = await this.redisService.get(key);
        if (data) {
          const event = JSON.parse(data) as SecurityEvent;

          // Apply time filters
          if (
            (!startTime || event.timestamp >= startTime) &&
            (!endTime || event.timestamp <= endTime)
          ) {
            counts[event.type]++;
          }
        }
      }

      return counts;
    } catch (error) {
      this.errorLogger.error(error, 'Failed to get security event counts', {
        source: SecurityLoggingRepository.name,
        method: 'getEventCounts',
        userId,
      });

      // Return empty counts
      const counts: Record<SecurityEventType, number> = {} as Record<
        SecurityEventType,
        number
      >;
      Object.values(SecurityEventType).forEach((type) => {
        counts[type] = 0;
      });
      return counts;
    }
  }
}

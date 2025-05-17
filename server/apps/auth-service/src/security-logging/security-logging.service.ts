import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@app/redis';
import { LoggingService, ErrorLoggerService } from '@app/logging';
import {
  SecurityEvent,
  SecurityEventType,
  SecurityEventSeverity,
  BaseSecurityEventData,
  AuthenticationEventData,
  TokenEventData,
  AccountEventData,
  PasswordEventData,
  SessionEventData,
  AccessEventData,
} from './interfaces/security-event.interface';

/**
 * Security Logging Service
 *
 * Service for logging security-related events and storing them in Redis
 */
@Injectable()
export class SecurityLoggingService {
  private readonly keyPrefix: string = 'security:logs:';
  private readonly defaultTtl: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly loggingService: LoggingService,
    private readonly errorLogger: ErrorLoggerService,
    private readonly configService: ConfigService,
  ) {
    this.loggingService.setContext(SecurityLoggingService.name);
    // Get log retention period from config (default: 90 days)
    this.defaultTtl = this.configService.get<number>(
      'SECURITY_LOG_TTL',
      7776000,
    ); // 90 days in seconds
  }

  /**
   * Log a security event
   * @param type Event type
   * @param severity Event severity
   * @param data Event data
   * @returns Promise resolving to true if the event was logged successfully
   */
  async logSecurityEvent(
    type: SecurityEventType,
    severity: SecurityEventSeverity,
    data: BaseSecurityEventData,
  ): Promise<boolean> {
    try {
      const timestamp = Date.now();
      const event: SecurityEvent = {
        type,
        severity,
        timestamp,
        data,
      };

      // Create Redis key
      const userId = data.userId || 'anonymous';
      const key = `${this.keyPrefix}${userId}:${timestamp}`;

      // Store event in Redis with TTL
      await this.redisService.set(key, JSON.stringify(event), this.defaultTtl);

      // Also log to the centralized logging system
      this.logToLoggingService(event);

      return true;
    } catch (error) {
      this.errorLogger.error(error, 'Failed to log security event', {
        source: SecurityLoggingService.name,
        method: 'logSecurityEvent',
        eventType: type,
        userId: data.userId,
      });
      return false;
    }
  }

  /**
   * Log authentication event
   * @param type Event type
   * @param data Event data
   * @returns Promise resolving to true if the event was logged successfully
   */
  async logAuthenticationEvent(
    type: SecurityEventType,
    data: AuthenticationEventData,
  ): Promise<boolean> {
    // Determine severity based on event type and success
    let severity = SecurityEventSeverity.INFO;

    if (type === SecurityEventType.LOGIN_FAILURE) {
      severity = SecurityEventSeverity.WARNING;
    } else if (type === SecurityEventType.UNAUTHORIZED_ACCESS) {
      severity = SecurityEventSeverity.ERROR;
    }

    return this.logSecurityEvent(type, severity, data);
  }

  /**
   * Log token event
   * @param type Event type
   * @param data Event data
   * @returns Promise resolving to true if the event was logged successfully
   */
  async logTokenEvent(
    type: SecurityEventType,
    data: TokenEventData,
  ): Promise<boolean> {
    // Determine severity based on event type
    const severity =
      type === SecurityEventType.TOKEN_REVOKED
        ? SecurityEventSeverity.WARNING
        : SecurityEventSeverity.INFO;

    return this.logSecurityEvent(type, severity, data);
  }

  /**
   * Log account event
   * @param type Event type
   * @param data Event data
   * @returns Promise resolving to true if the event was logged successfully
   */
  async logAccountEvent(
    type: SecurityEventType,
    data: AccountEventData,
  ): Promise<boolean> {
    // Determine severity based on event type
    let severity = SecurityEventSeverity.INFO;

    if (type === SecurityEventType.ACCOUNT_LOCKED) {
      severity = SecurityEventSeverity.WARNING;
    }

    return this.logSecurityEvent(type, severity, data);
  }

  /**
   * Log password event
   * @param type Event type
   * @param data Event data
   * @returns Promise resolving to true if the event was logged successfully
   */
  async logPasswordEvent(
    type: SecurityEventType,
    data: PasswordEventData,
  ): Promise<boolean> {
    // Password events are always important
    const severity = SecurityEventSeverity.WARNING;
    return this.logSecurityEvent(type, severity, data);
  }

  /**
   * Log session event
   * @param type Event type
   * @param data Event data
   * @returns Promise resolving to true if the event was logged successfully
   */
  async logSessionEvent(
    type: SecurityEventType,
    data: SessionEventData,
  ): Promise<boolean> {
    // Session termination might be suspicious
    const severity =
      type === SecurityEventType.ALL_SESSIONS_TERMINATED
        ? SecurityEventSeverity.WARNING
        : SecurityEventSeverity.INFO;

    return this.logSecurityEvent(type, severity, data);
  }

  /**
   * Log access event
   * @param type Event type
   * @param data Event data
   * @returns Promise resolving to true if the event was logged successfully
   */
  async logAccessEvent(
    type: SecurityEventType,
    data: AccessEventData,
  ): Promise<boolean> {
    // Access violations are serious
    const severity =
      type === SecurityEventType.PERMISSION_VIOLATION
        ? SecurityEventSeverity.ERROR
        : SecurityEventSeverity.WARNING;

    return this.logSecurityEvent(type, severity, data);
  }

  /**
   * Get security logs for a user
   * @param userId User ID
   * @param limit Maximum number of logs to return
   * @param offset Offset for pagination
   * @returns Promise resolving to an array of security events
   */
  async getUserSecurityLogs(
    userId: string,
    limit: number = 50,
    offset: number = 0,
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

      // Apply pagination
      const paginatedKeys = keys.slice(offset, offset + limit);

      // Get values for keys
      const events: SecurityEvent[] = [];
      for (const key of paginatedKeys) {
        const data = await this.redisService.get(key);
        if (data) {
          events.push(JSON.parse(data));
        }
      }

      return events;
    } catch (error) {
      this.errorLogger.error(error, 'Failed to get user security logs', {
        source: SecurityLoggingService.name,
        method: 'getUserSecurityLogs',
        userId,
      });
      return [];
    }
  }

  /**
   * Log to the centralized logging service
   * @param event Security event
   */
  private logToLoggingService(event: SecurityEvent): void {
    // Map severity to log level
    switch (event.severity) {
      case SecurityEventSeverity.CRITICAL:
      case SecurityEventSeverity.ERROR:
        this.loggingService.error(
          `Security event: ${event.type}`,
          'logSecurityEvent',
          {
            securityEvent: event.type,
            userId: event.data.userId,
            ip: event.data.ip,
            timestamp: event.timestamp,
            ...event.data,
          },
        );
        break;
      case SecurityEventSeverity.WARNING:
        this.loggingService.warn(
          `Security event: ${event.type}`,
          'logSecurityEvent',
          {
            securityEvent: event.type,
            userId: event.data.userId,
            ip: event.data.ip,
            timestamp: event.timestamp,
            ...event.data,
          },
        );
        break;
      default:
        this.loggingService.log(
          `Security event: ${event.type}`,
          'logSecurityEvent',
          {
            securityEvent: event.type,
            userId: event.data.userId,
            ip: event.data.ip,
            timestamp: event.timestamp,
            ...event.data,
          },
        );
    }
  }
}

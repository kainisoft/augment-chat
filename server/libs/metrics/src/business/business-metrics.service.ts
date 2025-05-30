import { Injectable, Inject, Logger } from '@nestjs/common';
import { MetricsService } from '../metrics.service';
import { MetricsModuleOptions } from '../metrics.module';

export interface BusinessEvent {
  name: string;
  value?: number;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
}

export interface BusinessMetricsSummary {
  totalEvents: number;
  uniqueUsers: number;
  topEvents: Array<{ name: string; count: number }>;
  timeRange: {
    start: Date;
    end: Date;
  };
}

/**
 * Business Metrics Service
 *
 * Tracks business-specific metrics and events such as user actions,
 * feature usage, conversion rates, and other business KPIs.
 */
@Injectable()
export class BusinessMetricsService {
  private readonly logger = new Logger(BusinessMetricsService.name);
  private readonly events: BusinessEvent[] = [];
  private readonly userSessions = new Set<string>();

  constructor(
    private readonly metricsService: MetricsService,
    @Inject('METRICS_OPTIONS') private readonly options: MetricsModuleOptions,
  ) {}

  /**
   * Track a business event
   */
  trackEvent(
    name: string,
    value?: number,
    properties?: Record<string, any>,
    userId?: string,
    sessionId?: string,
  ): void {
    const event: BusinessEvent = {
      name,
      value,
      properties,
      userId,
      sessionId,
      timestamp: new Date(),
    };

    this.events.push(event);

    // Keep only last 10000 events to prevent memory issues
    if (this.events.length > 10000) {
      this.events.shift();
    }

    // Track user sessions
    if (userId) {
      this.userSessions.add(userId);
    }

    // Record metrics
    this.metricsService.counter(
      'business_events_total',
      'Total business events tracked',
      1,
      { event_name: name },
    );

    if (value !== undefined) {
      this.metricsService.histogram(
        'business_event_value',
        'Business event values',
        value,
        { event_name: name },
      );
    }

    this.logger.debug(`Business event tracked: ${name}`, {
      name,
      value,
      userId,
      sessionId,
      properties,
    });
  }

  /**
   * Track user registration
   */
  trackUserRegistration(
    userId: string,
    properties?: Record<string, any>,
  ): void {
    this.trackEvent('user_registration', 1, properties, userId);
    this.metricsService.counter(
      'users_registered_total',
      'Total user registrations',
    );
  }

  /**
   * Track user login
   */
  trackUserLogin(userId: string, properties?: Record<string, any>): void {
    this.trackEvent('user_login', 1, properties, userId);
    this.metricsService.counter('user_logins_total', 'Total user logins');
  }

  /**
   * Track user logout
   */
  trackUserLogout(userId: string, sessionDuration?: number): void {
    this.trackEvent('user_logout', sessionDuration, undefined, userId);
    this.metricsService.counter('user_logouts_total', 'Total user logouts');

    if (sessionDuration) {
      this.metricsService.histogram(
        'user_session_duration_seconds',
        'User session duration in seconds',
        sessionDuration,
      );
    }
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(
    featureName: string,
    userId?: string,
    properties?: Record<string, any>,
  ): void {
    this.trackEvent(
      'feature_usage',
      1,
      { feature: featureName, ...properties },
      userId,
    );
    this.metricsService.counter(
      'feature_usage_total',
      'Total feature usage',
      1,
      { feature: featureName },
    );
  }

  /**
   * Track API endpoint usage
   */
  trackApiUsage(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    userId?: string,
  ): void {
    this.trackEvent(
      'api_request',
      responseTime,
      {
        endpoint,
        method,
        statusCode,
      },
      userId,
    );

    this.metricsService.counter('api_requests_total', 'Total API requests', 1, {
      endpoint,
      method,
      status: statusCode.toString(),
    });

    this.metricsService.histogram(
      'api_response_time_ms',
      'API response time in milliseconds',
      responseTime,
      { endpoint, method },
    );
  }

  /**
   * Track error occurrence
   */
  trackError(
    errorType: string,
    errorMessage: string,
    userId?: string,
    properties?: Record<string, any>,
  ): void {
    this.trackEvent(
      'error_occurred',
      1,
      {
        error_type: errorType,
        error_message: errorMessage,
        ...properties,
      },
      userId,
    );

    this.metricsService.counter('errors_total', 'Total errors occurred', 1, {
      error_type: errorType,
    });
  }

  /**
   * Track conversion event
   */
  trackConversion(
    conversionType: string,
    value?: number,
    userId?: string,
    properties?: Record<string, any>,
  ): void {
    this.trackEvent(
      'conversion',
      value,
      {
        conversion_type: conversionType,
        ...properties,
      },
      userId,
    );

    this.metricsService.counter('conversions_total', 'Total conversions', 1, {
      conversion_type: conversionType,
    });

    if (value) {
      this.metricsService.histogram(
        'conversion_value',
        'Conversion value',
        value,
        { conversion_type: conversionType },
      );
    }
  }

  /**
   * Get business metrics summary
   */
  getBusinessMetricsSummary(timeRange?: {
    start: Date;
    end: Date;
  }): BusinessMetricsSummary {
    let filteredEvents = this.events;

    if (timeRange) {
      filteredEvents = this.events.filter(
        (event) =>
          event.timestamp >= timeRange.start &&
          event.timestamp <= timeRange.end,
      );
    }

    // Count events by name
    const eventCounts = new Map<string, number>();
    const uniqueUsers = new Set<string>();

    for (const event of filteredEvents) {
      eventCounts.set(event.name, (eventCounts.get(event.name) || 0) + 1);
      if (event.userId) {
        uniqueUsers.add(event.userId);
      }
    }

    // Get top events
    const topEvents = Array.from(eventCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: filteredEvents.length,
      uniqueUsers: uniqueUsers.size,
      topEvents,
      timeRange: timeRange || {
        start: filteredEvents[0]?.timestamp || new Date(),
        end: filteredEvents[filteredEvents.length - 1]?.timestamp || new Date(),
      },
    };
  }

  /**
   * Get events by user
   */
  getUserEvents(userId: string, limit: number = 100): BusinessEvent[] {
    return this.events.filter((event) => event.userId === userId).slice(-limit);
  }

  /**
   * Get events by name
   */
  getEventsByName(eventName: string, limit: number = 100): BusinessEvent[] {
    return this.events
      .filter((event) => event.name === eventName)
      .slice(-limit);
  }

  /**
   * Calculate conversion rate
   */
  calculateConversionRate(
    fromEvent: string,
    toEvent: string,
    timeWindow: number = 3600000, // 1 hour in milliseconds
  ): number {
    const fromEvents = this.events.filter((event) => event.name === fromEvent);
    const toEvents = this.events.filter((event) => event.name === toEvent);

    let conversions = 0;

    for (const fromEvent of fromEvents) {
      const hasConversion = toEvents.some(
        (toEvent) =>
          toEvent.userId === fromEvent.userId &&
          toEvent.timestamp.getTime() - fromEvent.timestamp.getTime() <=
            timeWindow &&
          toEvent.timestamp >= fromEvent.timestamp,
      );

      if (hasConversion) {
        conversions++;
      }
    }

    return fromEvents.length > 0 ? (conversions / fromEvents.length) * 100 : 0;
  }

  /**
   * Get active users count
   */
  getActiveUsersCount(timeRange: { start: Date; end: Date }): number {
    const activeUsers = new Set<string>();

    for (const event of this.events) {
      if (
        event.userId &&
        event.timestamp >= timeRange.start &&
        event.timestamp <= timeRange.end
      ) {
        activeUsers.add(event.userId);
      }
    }

    return activeUsers.size;
  }

  /**
   * Export business events
   */
  exportEvents(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      let csv = 'name,value,userId,sessionId,timestamp,properties\n';
      for (const event of this.events) {
        const properties = event.properties
          ? JSON.stringify(event.properties)
          : '';
        csv += `${event.name},${event.value || ''},${event.userId || ''},${event.sessionId || ''},${event.timestamp.toISOString()},"${properties}"\n`;
      }
      return csv;
    }

    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Clear old events
   */
  clearOldEvents(olderThan: Date): number {
    const initialLength = this.events.length;

    // Remove events older than the specified date
    for (let i = this.events.length - 1; i >= 0; i--) {
      if (this.events[i].timestamp < olderThan) {
        this.events.splice(i, 1);
      }
    }

    const removedCount = initialLength - this.events.length;
    this.logger.log(`Cleared ${removedCount} old business events`);

    return removedCount;
  }
}

import { Injectable, Inject, Logger } from '@nestjs/common';
import { MetricsService } from '../metrics.service';
import { MetricsModuleOptions } from '../metrics.module';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  score: number; // 0-100
  components: {
    [key: string]: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      score: number;
      message?: string;
      lastCheck: Date;
    };
  };
  lastUpdated: Date;
}

export interface HealthCheck {
  name: string;
  check: () => Promise<{ healthy: boolean; score: number; message?: string }>;
  weight: number; // 1-10, higher means more important
  timeout: number; // milliseconds
}

/**
 * Health Metrics Service
 *
 * Monitors and tracks health metrics for various system components
 * including databases, external services, and application health.
 */
@Injectable()
export class HealthMetricsService {
  private readonly logger = new Logger(HealthMetricsService.name);
  private readonly healthChecks = new Map<string, HealthCheck>();
  private currentHealthStatus: HealthStatus = {
    status: 'healthy',
    score: 100,
    components: {},
    lastUpdated: new Date(),
  };

  constructor(
    private readonly metricsService: MetricsService,
    @Inject('METRICS_OPTIONS') private readonly options: MetricsModuleOptions,
  ) {}

  /**
   * Register a health check
   */
  registerHealthCheck(healthCheck: HealthCheck): void {
    this.healthChecks.set(healthCheck.name, healthCheck);
    this.logger.log(`Health check registered: ${healthCheck.name}`);
  }

  /**
   * Unregister a health check
   */
  unregisterHealthCheck(name: string): boolean {
    const removed = this.healthChecks.delete(name);
    if (removed) {
      this.logger.log(`Health check unregistered: ${name}`);
    }
    return removed;
  }

  /**
   * Run all health checks
   */
  async runHealthChecks(): Promise<HealthStatus> {
    const components: HealthStatus['components'] = {};
    let totalScore = 0;
    let totalWeight = 0;

    for (const [name, healthCheck] of this.healthChecks) {
      try {
        const result = await this.runSingleHealthCheck(healthCheck);

        components[name] = {
          status: result.healthy ? 'healthy' : 'unhealthy',
          score: result.score,
          message: result.message,
          lastCheck: new Date(),
        };

        totalScore += result.score * healthCheck.weight;
        totalWeight += healthCheck.weight;

        // Record metrics
        this.metricsService.gauge(
          `health_check_score`,
          `Health check score for ${name}`,
          result.score,
          { component: name },
        );

        this.metricsService.counter(
          `health_check_total`,
          `Total health checks for ${name}`,
          1,
          { component: name, status: result.healthy ? 'success' : 'failure' },
        );
      } catch (error) {
        this.logger.error(`Health check failed for ${name}:`, error);

        components[name] = {
          status: 'unhealthy',
          score: 0,
          message: error.message,
          lastCheck: new Date(),
        };

        totalWeight += healthCheck.weight;

        this.metricsService.counter(
          `health_check_total`,
          `Total health checks for ${name}`,
          1,
          { component: name, status: 'error' },
        );
      }
    }

    // Calculate overall health score
    const overallScore =
      totalWeight > 0 ? Math.round(totalScore / totalWeight) : 100;

    // Determine overall status
    let overallStatus: HealthStatus['status'] = 'healthy';
    if (overallScore < 50) {
      overallStatus = 'unhealthy';
    } else if (overallScore < 80) {
      overallStatus = 'degraded';
    }

    this.currentHealthStatus = {
      status: overallStatus,
      score: overallScore,
      components,
      lastUpdated: new Date(),
    };

    // Record overall health metrics
    this.metricsService.gauge(
      'overall_health_score',
      'Overall system health score',
      overallScore,
    );

    this.metricsService.gauge(
      'health_components_total',
      'Total number of health components',
      this.healthChecks.size,
    );

    const healthyComponents = Object.values(components).filter(
      (c) => c.status === 'healthy',
    ).length;
    this.metricsService.gauge(
      'health_components_healthy',
      'Number of healthy components',
      healthyComponents,
    );

    return this.currentHealthStatus;
  }

  /**
   * Get current health status
   */
  getCurrentHealthStatus(): HealthStatus {
    return { ...this.currentHealthStatus };
  }

  /**
   * Check if system is healthy
   */
  isHealthy(): boolean {
    return this.currentHealthStatus.status === 'healthy';
  }

  /**
   * Get health summary
   */
  getHealthSummary(): {
    status: string;
    score: number;
    totalComponents: number;
    healthyComponents: number;
    lastCheck: Date;
  } {
    const healthyComponents = Object.values(
      this.currentHealthStatus.components,
    ).filter((c) => c.status === 'healthy').length;

    return {
      status: this.currentHealthStatus.status,
      score: this.currentHealthStatus.score,
      totalComponents: Object.keys(this.currentHealthStatus.components).length,
      healthyComponents,
      lastCheck: this.currentHealthStatus.lastUpdated,
    };
  }

  /**
   * Get component health details
   */
  getComponentHealth(
    componentName: string,
  ): HealthStatus['components'][string] | undefined {
    return this.currentHealthStatus.components[componentName];
  }

  /**
   * Record custom health metric
   */
  recordHealthMetric(
    name: string,
    value: number,
    labels?: Record<string, string>,
  ): void {
    this.metricsService.gauge(
      `health_${name}`,
      `Health metric: ${name}`,
      value,
      labels,
    );
  }

  /**
   * Record health event
   */
  recordHealthEvent(event: string, component?: string): void {
    this.metricsService.counter(
      'health_events_total',
      'Total health events',
      1,
      { event, component: component || 'system' },
    );
  }

  /**
   * Run a single health check with timeout
   */
  private async runSingleHealthCheck(
    healthCheck: HealthCheck,
  ): Promise<{ healthy: boolean; score: number; message?: string }> {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(`Health check timeout after ${healthCheck.timeout}ms`),
        );
      }, healthCheck.timeout);

      try {
        const result = await healthCheck.check();
        clearTimeout(timeout);
        resolve(result);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Create standard database health check
   */
  createDatabaseHealthCheck(
    name: string,
    checkFunction: () => Promise<boolean>,
    weight: number = 8,
  ): HealthCheck {
    return {
      name: `database_${name}`,
      check: async () => {
        const healthy = await checkFunction();
        return {
          healthy,
          score: healthy ? 100 : 0,
          message: healthy
            ? 'Database connection healthy'
            : 'Database connection failed',
        };
      },
      weight,
      timeout: 5000,
    };
  }

  /**
   * Create standard external service health check
   */
  createExternalServiceHealthCheck(
    name: string,
    checkFunction: () => Promise<{ available: boolean; responseTime: number }>,
    weight: number = 5,
  ): HealthCheck {
    return {
      name: `external_${name}`,
      check: async () => {
        const result = await checkFunction();
        const score = result.available
          ? Math.max(0, 100 - result.responseTime / 10)
          : 0;
        return {
          healthy: result.available && result.responseTime < 5000,
          score: Math.round(score),
          message: result.available
            ? `Service available (${result.responseTime}ms)`
            : 'Service unavailable',
        };
      },
      weight,
      timeout: 10000,
    };
  }

  /**
   * Create memory usage health check
   */
  createMemoryHealthCheck(weight: number = 6): HealthCheck {
    return {
      name: 'memory_usage',
      check: async () => {
        const memoryUsage = process.memoryUsage();
        const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
        const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
        const usagePercent = (heapUsedMB / heapTotalMB) * 100;

        const healthy = usagePercent < 90;
        const score = Math.max(0, 100 - usagePercent);

        return {
          healthy,
          score: Math.round(score),
          message: `Memory usage: ${Math.round(usagePercent)}% (${Math.round(heapUsedMB)}MB)`,
        };
      },
      weight,
      timeout: 1000,
    };
  }
}

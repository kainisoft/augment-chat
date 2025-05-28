import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { MetricsService } from '../metrics.service';
import { MetricsModuleOptions } from '../metrics.module';

export interface PerformanceMetrics {
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    free: number;
    total: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  eventLoop: {
    delay: number;
    utilization: number;
  };
  gc: {
    collections: number;
    duration: number;
  };
  uptime: number;
}

/**
 * Performance Monitor Service
 *
 * Monitors system and application performance metrics
 * including CPU, memory, event loop, and garbage collection.
 */
@Injectable()
export class PerformanceMonitorService implements OnModuleInit {
  private readonly logger = new Logger(PerformanceMonitorService.name);
  private monitoringInterval?: NodeJS.Timeout;
  private gcStats = { collections: 0, duration: 0 };

  constructor(
    private readonly metricsService: MetricsService,
    @Inject('METRICS_OPTIONS') private readonly options: MetricsModuleOptions,
  ) {}

  async onModuleInit() {
    if (this.options.enablePerformanceMonitoring) {
      this.startMonitoring();
    }
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    const interval = this.options.collectionInterval || 60000;

    this.monitoringInterval = setInterval(() => {
      this.collectPerformanceMetrics();
    }, interval);

    // Setup GC monitoring if available
    this.setupGCMonitoring();

    this.logger.log(
      `Performance monitoring started with ${interval}ms interval`,
    );
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      this.logger.log('Performance monitoring stopped');
    }
  }

  /**
   * Get current performance metrics
   */
  async getCurrentMetrics(): Promise<PerformanceMetrics> {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      cpu: {
        usage: this.calculateCPUUsage(cpuUsage),
        loadAverage: require('os').loadavg(),
      },
      memory: {
        used: memoryUsage.rss,
        free: require('os').freemem(),
        total: require('os').totalmem(),
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
      },
      eventLoop: {
        delay: await this.measureEventLoopDelay(),
        utilization: await this.measureEventLoopUtilization(),
      },
      gc: {
        collections: this.gcStats.collections,
        duration: this.gcStats.duration,
      },
      uptime: process.uptime(),
    };
  }

  /**
   * Collect and record performance metrics
   */
  private async collectPerformanceMetrics(): Promise<void> {
    try {
      const metrics = await this.getCurrentMetrics();

      // CPU metrics
      this.metricsService.gauge(
        'cpu_usage_percent',
        'CPU usage percentage',
        metrics.cpu.usage,
      );

      this.metricsService.gauge(
        'cpu_load_average_1m',
        'CPU load average (1 minute)',
        metrics.cpu.loadAverage[0],
      );

      // Memory metrics
      this.metricsService.gauge(
        'memory_rss_bytes',
        'Resident Set Size memory usage',
        metrics.memory.used,
      );

      this.metricsService.gauge(
        'memory_heap_used_bytes',
        'Heap memory used',
        metrics.memory.heapUsed,
      );

      this.metricsService.gauge(
        'memory_heap_total_bytes',
        'Total heap memory',
        metrics.memory.heapTotal,
      );

      this.metricsService.gauge(
        'memory_external_bytes',
        'External memory usage',
        metrics.memory.external,
      );

      // Event loop metrics
      this.metricsService.gauge(
        'event_loop_delay_ms',
        'Event loop delay in milliseconds',
        metrics.eventLoop.delay,
      );

      this.metricsService.gauge(
        'event_loop_utilization_percent',
        'Event loop utilization percentage',
        metrics.eventLoop.utilization * 100,
      );

      // GC metrics
      this.metricsService.counter(
        'gc_collections_total',
        'Total garbage collection cycles',
        metrics.gc.collections,
      );

      this.metricsService.gauge(
        'gc_duration_ms',
        'Garbage collection duration',
        metrics.gc.duration,
      );

      // Uptime
      this.metricsService.gauge(
        'process_uptime_seconds',
        'Process uptime in seconds',
        metrics.uptime,
      );

      this.logger.debug('Performance metrics collected', {
        cpu: metrics.cpu.usage,
        memory: Math.round(metrics.memory.heapUsed / 1024 / 1024),
        eventLoopDelay: metrics.eventLoop.delay,
      });
    } catch (error) {
      this.logger.error('Failed to collect performance metrics:', error);
    }
  }

  /**
   * Calculate CPU usage percentage
   */
  private calculateCPUUsage(cpuUsage: NodeJS.CpuUsage): number {
    // This is a simplified calculation
    // In a real implementation, you'd want to track changes over time
    const totalUsage = cpuUsage.user + cpuUsage.system;
    return Math.min(100, (totalUsage / 1000000) * 100); // Convert microseconds to percentage
  }

  /**
   * Measure event loop delay
   */
  private async measureEventLoopDelay(): Promise<number> {
    return new Promise((resolve) => {
      const start = process.hrtime.bigint();
      setImmediate(() => {
        const delay = Number(process.hrtime.bigint() - start) / 1000000; // Convert to milliseconds
        resolve(delay);
      });
    });
  }

  /**
   * Measure event loop utilization
   */
  private async measureEventLoopUtilization(): Promise<number> {
    // This is a simplified implementation
    // Node.js 14+ has perf_hooks.performance.eventLoopUtilization()
    try {
      const { performance } = require('perf_hooks');
      if (performance.eventLoopUtilization) {
        const utilization = performance.eventLoopUtilization();
        return utilization.utilization || 0;
      }
    } catch (error) {
      // Fallback for older Node.js versions
    }
    return 0;
  }

  /**
   * Setup garbage collection monitoring
   */
  private setupGCMonitoring(): void {
    try {
      const { performance, PerformanceObserver } = require('perf_hooks');

      const obs = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.entryType === 'gc') {
            this.gcStats.collections++;
            this.gcStats.duration = entry.duration;
          }
        }
      });

      obs.observe({ entryTypes: ['gc'] });
      this.logger.debug('GC monitoring enabled');
    } catch (error) {
      this.logger.warn('GC monitoring not available:', error.message);
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
    const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;

    if (heapUsagePercent > 90) {
      issues.push('High memory usage detected');
      recommendations.push(
        'Consider optimizing memory usage or increasing heap size',
      );
    }

    // Check uptime
    const uptimeHours = process.uptime() / 3600;
    if (uptimeHours > 24 * 7) {
      // More than a week
      recommendations.push(
        'Consider restarting the service for optimal performance',
      );
    }

    const status = issues.length > 0 ? 'warning' : 'healthy';

    return {
      status,
      issues,
      recommendations,
    };
  }
}

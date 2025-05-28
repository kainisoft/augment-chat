import {
  Injectable,
  Inject,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { MetricsService } from '../metrics.service';
import { PerformanceMonitorService } from '../performance/performance-monitor.service';
import { HealthMetricsService } from '../health/health-metrics.service';
import { BusinessMetricsService } from '../business/business-metrics.service';
import { MetricsModuleOptions } from '../metrics.module';

export interface CollectorReport {
  timestamp: Date;
  serviceName: string;
  performance: any;
  health: any;
  business: any;
  metrics: any;
}

/**
 * Metrics Collector Service
 *
 * Orchestrates the collection of all metrics from different services
 * and provides unified reporting and export capabilities.
 */
@Injectable()
export class MetricsCollectorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MetricsCollectorService.name);
  private collectionInterval?: NodeJS.Timeout;
  private isCollecting = false;

  constructor(
    private readonly metricsService: MetricsService,
    @Inject('METRICS_OPTIONS') private readonly options: MetricsModuleOptions,
    private readonly performanceMonitor?: PerformanceMonitorService,
    private readonly healthMetrics?: HealthMetricsService,
    private readonly businessMetrics?: BusinessMetricsService,
  ) {}

  async onModuleInit() {
    if (this.options.collectionInterval) {
      this.startCollection();
    }
  }

  async onModuleDestroy() {
    this.stopCollection();
  }

  /**
   * Start automatic metrics collection
   */
  startCollection(): void {
    if (this.isCollecting) {
      this.logger.warn('Metrics collection is already running');
      return;
    }

    const interval = this.options.collectionInterval || 60000;

    this.collectionInterval = setInterval(async () => {
      await this.collectAllMetrics();
    }, interval);

    this.isCollecting = true;
    this.logger.log(`Metrics collection started with ${interval}ms interval`);
  }

  /**
   * Stop automatic metrics collection
   */
  stopCollection(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = undefined;
    }

    this.isCollecting = false;
    this.logger.log('Metrics collection stopped');
  }

  /**
   * Collect all metrics from all services
   */
  async collectAllMetrics(): Promise<CollectorReport> {
    const timestamp = new Date();

    try {
      const report: CollectorReport = {
        timestamp,
        serviceName: this.options.serviceName,
        performance: null,
        health: null,
        business: null,
        metrics: null,
      };

      // Collect performance metrics
      if (this.performanceMonitor && this.options.enablePerformanceMonitoring) {
        try {
          report.performance =
            await this.performanceMonitor.getCurrentMetrics();
        } catch (error) {
          this.logger.error('Failed to collect performance metrics:', error);
        }
      }

      // Collect health metrics
      if (this.healthMetrics && this.options.enableHealthMetrics) {
        try {
          report.health = await this.healthMetrics.runHealthChecks();
        } catch (error) {
          this.logger.error('Failed to collect health metrics:', error);
        }
      }

      // Collect business metrics
      if (this.businessMetrics && this.options.enableBusinessMetrics) {
        try {
          report.business = this.businessMetrics.getBusinessMetricsSummary();
        } catch (error) {
          this.logger.error('Failed to collect business metrics:', error);
        }
      }

      // Collect core metrics
      try {
        report.metrics = this.metricsService.getSnapshot();
      } catch (error) {
        this.logger.error('Failed to collect core metrics:', error);
      }

      // Record collection metrics
      this.metricsService.counter(
        'metrics_collection_total',
        'Total metrics collections performed',
      );

      this.metricsService.gauge(
        'metrics_collection_timestamp',
        'Timestamp of last metrics collection',
        timestamp.getTime(),
      );

      this.logger.debug('Metrics collection completed', {
        timestamp,
        hasPerformance: !!report.performance,
        hasHealth: !!report.health,
        hasBusiness: !!report.business,
        hasMetrics: !!report.metrics,
      });

      return report;
    } catch (error) {
      this.logger.error('Failed to collect metrics:', error);

      this.metricsService.counter(
        'metrics_collection_errors_total',
        'Total metrics collection errors',
      );

      throw error;
    }
  }

  /**
   * Get comprehensive metrics report
   */
  async getComprehensiveReport(): Promise<CollectorReport> {
    return this.collectAllMetrics();
  }

  /**
   * Export all metrics in specified format
   */
  async exportAllMetrics(
    format: 'json' | 'prometheus' | 'csv' = 'json',
  ): Promise<string> {
    const report = await this.collectAllMetrics();

    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      case 'prometheus':
        return this.exportPrometheusFormat(report);
      case 'csv':
        return this.exportCSVFormat(report);
      default:
        return JSON.stringify(report, null, 2);
    }
  }

  /**
   * Get collection status
   */
  getCollectionStatus(): {
    isCollecting: boolean;
    interval?: number;
    lastCollection?: Date;
    totalCollections: number;
  } {
    const totalCollections = this.metricsService.getMetric(
      'metrics_collection_total',
    );
    const lastCollectionMetric = this.metricsService.getMetric(
      'metrics_collection_timestamp',
    );

    return {
      isCollecting: this.isCollecting,
      interval: this.options.collectionInterval,
      lastCollection:
        lastCollectionMetric?.values[lastCollectionMetric.values.length - 1]
          ?.timestamp,
      totalCollections:
        totalCollections?.values[totalCollections.values.length - 1]?.value ||
        0,
    };
  }

  /**
   * Reset all metrics
   */
  resetAllMetrics(): void {
    this.metricsService.clearMetrics();

    if (this.performanceMonitor) {
      // Performance monitor doesn't have a reset method, but we can restart monitoring
    }

    if (this.healthMetrics) {
      this.healthMetrics.resetMetrics?.();
    }

    if (this.businessMetrics) {
      // Business metrics doesn't have a reset method in our implementation
    }

    this.logger.log('All metrics have been reset');
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): {
    totalMetrics: number;
    performanceMetrics: number;
    healthChecks: number;
    businessEvents: number;
    lastCollection?: Date;
  } {
    const snapshot = this.metricsService.getSnapshot();
    const status = this.getCollectionStatus();

    return {
      totalMetrics: snapshot.summary.totalMetrics,
      performanceMetrics: snapshot.metrics.filter(
        (m) => m.name.includes('cpu_') || m.name.includes('memory_'),
      ).length,
      healthChecks: snapshot.metrics.filter((m) => m.name.includes('health_'))
        .length,
      businessEvents: snapshot.metrics.filter((m) =>
        m.name.includes('business_'),
      ).length,
      lastCollection: status.lastCollection,
    };
  }

  /**
   * Export metrics in Prometheus format
   */
  private exportPrometheusFormat(report: CollectorReport): string {
    let output = '';

    // Add service info
    output += `# HELP service_info Service information\n`;
    output += `# TYPE service_info gauge\n`;
    output += `service_info{service="${report.serviceName}",timestamp="${report.timestamp.toISOString()}"} 1\n\n`;

    // Add core metrics
    if (report.metrics) {
      output += this.metricsService.exportMetrics('prometheus');
    }

    return output;
  }

  /**
   * Export metrics in CSV format
   */
  private exportCSVFormat(report: CollectorReport): string {
    let csv = 'service,timestamp,metric_type,metric_name,value,labels\n';

    if (report.metrics) {
      for (const metric of report.metrics.metrics) {
        for (const value of metric.values) {
          const labels = value.labels ? JSON.stringify(value.labels) : '';
          csv += `${report.serviceName},${report.timestamp.toISOString()},${metric.type},${metric.name},${value.value},"${labels}"\n`;
        }
      }
    }

    return csv;
  }

  /**
   * Schedule metrics export
   */
  scheduleExport(
    interval: number,
    format: 'json' | 'prometheus' | 'csv' = 'json',
    callback: (data: string) => Promise<void>,
  ): NodeJS.Timeout {
    return setInterval(async () => {
      try {
        const data = await this.exportAllMetrics(format);
        await callback(data);

        this.metricsService.counter(
          'metrics_export_total',
          'Total metrics exports performed',
        );
      } catch (error) {
        this.logger.error('Failed to export metrics:', error);

        this.metricsService.counter(
          'metrics_export_errors_total',
          'Total metrics export errors',
        );
      }
    }, interval);
  }
}

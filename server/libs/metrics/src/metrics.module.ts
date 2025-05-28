import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MetricsService } from './metrics.service';
import { PerformanceMonitorService } from './performance/performance-monitor.service';
import { HealthMetricsService } from './health/health-metrics.service';
import { BusinessMetricsService } from './business/business-metrics.service';
import { MetricsCollectorService } from './collector/metrics-collector.service';

export interface MetricsModuleOptions {
  /**
   * Service name for metrics identification
   */
  serviceName: string;

  /**
   * Enable performance monitoring
   * @default true
   */
  enablePerformanceMonitoring?: boolean;

  /**
   * Enable health metrics
   * @default true
   */
  enableHealthMetrics?: boolean;

  /**
   * Enable business metrics
   * @default true
   */
  enableBusinessMetrics?: boolean;

  /**
   * Metrics collection interval in milliseconds
   * @default 60000 (1 minute)
   */
  collectionInterval?: number;

  /**
   * Enable metrics export
   * @default false
   */
  enableExport?: boolean;

  /**
   * Export configuration
   */
  exportConfig?: {
    endpoint?: string;
    format?: 'prometheus' | 'json' | 'influxdb';
    interval?: number;
  };
}

/**
 * Metrics Module
 *
 * Provides comprehensive metrics collection and monitoring utilities
 * for microservices including performance, health, and business metrics.
 *
 * This module includes:
 * - Performance monitoring and metrics
 * - Health status tracking
 * - Business metrics collection
 * - Metrics aggregation and export
 * - Real-time monitoring capabilities
 */
@Module({})
export class MetricsModule {
  /**
   * Register the Metrics module for a specific service
   */
  static forRoot(options: MetricsModuleOptions): DynamicModule {
    const {
      serviceName,
      enablePerformanceMonitoring = true,
      enableHealthMetrics = true,
      enableBusinessMetrics = true,
      collectionInterval = 60000,
      enableExport = false,
    } = options;

    const providers = [
      {
        provide: 'METRICS_OPTIONS',
        useValue: options,
      },
      MetricsService,
      MetricsCollectorService,
    ];

    const exports = [MetricsService, MetricsCollectorService];

    // Add performance monitoring if enabled
    if (enablePerformanceMonitoring) {
      providers.push(PerformanceMonitorService);
      exports.push(PerformanceMonitorService);
    }

    // Add health metrics if enabled
    if (enableHealthMetrics) {
      providers.push(HealthMetricsService);
      exports.push(HealthMetricsService);
    }

    // Add business metrics if enabled
    if (enableBusinessMetrics) {
      providers.push(BusinessMetricsService);
      exports.push(BusinessMetricsService);
    }

    return {
      module: MetricsModule,
      imports: [ConfigModule],
      providers,
      exports,
    };
  }

  /**
   * Register the Metrics module for feature modules
   */
  static forFeature(): DynamicModule {
    return {
      module: MetricsModule,
      providers: [MetricsService],
      exports: [MetricsService],
    };
  }
}

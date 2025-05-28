/**
 * Metrics Library
 *
 * This module exports comprehensive metrics collection and monitoring
 * utilities for microservices including performance, health, and business metrics.
 *
 * Features:
 * - Core metrics service with counter, gauge, histogram, and summary support
 * - Performance monitoring (CPU, memory, event loop, GC)
 * - Health metrics and monitoring
 * - Business metrics and event tracking
 * - Metrics collection and export capabilities
 * - Multiple export formats (JSON, Prometheus, CSV)
 */

// Core module
export { MetricsModule, MetricsModuleOptions } from './metrics.module';

// Core metrics service
export {
  MetricsService,
  MetricValue,
  Metric,
  MetricsSnapshot,
} from './metrics.service';

// Performance monitoring
export {
  PerformanceMonitorService,
  PerformanceMetrics,
} from './performance/performance-monitor.service';

// Health metrics
export {
  HealthMetricsService,
  HealthStatus,
  HealthCheck,
} from './health/health-metrics.service';

// Business metrics
export {
  BusinessMetricsService,
  BusinessEvent,
  BusinessMetricsSummary,
} from './business/business-metrics.service';

// Metrics collector
export {
  MetricsCollectorService,
  CollectorReport,
} from './collector/metrics-collector.service';

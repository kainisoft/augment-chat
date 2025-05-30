import { Injectable, Inject, Logger } from '@nestjs/common';
import { MetricsModuleOptions } from './metrics.module';

export interface MetricValue {
  value: number;
  timestamp: Date;
  labels?: Record<string, string>;
}

export interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  description: string;
  unit?: string;
  values: MetricValue[];
  labels?: Record<string, string>;
}

export interface MetricsSnapshot {
  serviceName: string;
  timestamp: Date;
  metrics: Metric[];
  summary: {
    totalMetrics: number;
    counters: number;
    gauges: number;
    histograms: number;
    summaries: number;
  };
}

/**
 * Metrics Service
 *
 * Core service for collecting, storing, and managing metrics
 * across microservices with support for different metric types.
 */
@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly metrics = new Map<string, Metric>();

  constructor(
    @Inject('METRICS_OPTIONS') private readonly options: MetricsModuleOptions,
  ) {}

  /**
   * Create or update a counter metric
   */
  counter(
    name: string,
    description: string,
    value: number = 1,
    labels?: Record<string, string>,
  ): void {
    const metric = this.getOrCreateMetric(name, 'counter', description);

    // For counters, we add to the existing value
    const lastValue = this.getLastValue(metric);
    const newValue = lastValue + value;

    this.addValue(metric, newValue, labels);

    this.logger.debug(`Counter ${name} incremented by ${value} to ${newValue}`);
  }

  /**
   * Set a gauge metric value
   */
  gauge(
    name: string,
    description: string,
    value: number,
    labels?: Record<string, string>,
  ): void {
    const metric = this.getOrCreateMetric(name, 'gauge', description);
    this.addValue(metric, value, labels);

    this.logger.debug(`Gauge ${name} set to ${value}`);
  }

  /**
   * Record a histogram value
   */
  histogram(
    name: string,
    description: string,
    value: number,
    labels?: Record<string, string>,
  ): void {
    const metric = this.getOrCreateMetric(name, 'histogram', description);
    this.addValue(metric, value, labels);

    this.logger.debug(`Histogram ${name} recorded value ${value}`);
  }

  /**
   * Record a summary value
   */
  summary(
    name: string,
    description: string,
    value: number,
    labels?: Record<string, string>,
  ): void {
    const metric = this.getOrCreateMetric(name, 'summary', description);
    this.addValue(metric, value, labels);

    this.logger.debug(`Summary ${name} recorded value ${value}`);
  }

  /**
   * Get a specific metric
   */
  getMetric(name: string): Metric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Metric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics snapshot
   */
  getSnapshot(): MetricsSnapshot {
    const metrics = this.getAllMetrics();

    return {
      serviceName: this.options.serviceName,
      timestamp: new Date(),
      metrics,
      summary: {
        totalMetrics: metrics.length,
        counters: metrics.filter((m) => m.type === 'counter').length,
        gauges: metrics.filter((m) => m.type === 'gauge').length,
        histograms: metrics.filter((m) => m.type === 'histogram').length,
        summaries: metrics.filter((m) => m.type === 'summary').length,
      },
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.logger.log('All metrics cleared');
  }

  /**
   * Clear a specific metric
   */
  clearMetric(name: string): boolean {
    const deleted = this.metrics.delete(name);
    if (deleted) {
      this.logger.log(`Metric ${name} cleared`);
    }
    return deleted;
  }

  /**
   * Get metric statistics
   */
  getMetricStats(name: string):
    | {
        count: number;
        min: number;
        max: number;
        avg: number;
        sum: number;
      }
    | undefined {
    const metric = this.metrics.get(name);
    if (!metric || metric.values.length === 0) {
      return undefined;
    }

    const values = metric.values.map((v) => v.value);

    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      sum: values.reduce((a, b) => a + b, 0),
    };
  }

  /**
   * Export metrics in different formats
   */
  exportMetrics(format: 'json' | 'prometheus' | 'csv' = 'json'): string {
    const snapshot = this.getSnapshot();

    switch (format) {
      case 'json':
        return JSON.stringify(snapshot, null, 2);
      case 'prometheus':
        return this.exportPrometheus(snapshot);
      case 'csv':
        return this.exportCSV(snapshot);
      default:
        return JSON.stringify(snapshot, null, 2);
    }
  }

  /**
   * Record timing for a function execution
   */
  async time<T>(
    name: string,
    description: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.histogram(`${name}_duration_ms`, description, duration);
      this.counter(`${name}_total`, `Total executions of ${name}`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.histogram(`${name}_duration_ms`, description, duration);
      this.counter(`${name}_errors_total`, `Total errors in ${name}`);
      throw error;
    }
  }

  /**
   * Get or create a metric
   */
  private getOrCreateMetric(
    name: string,
    type: Metric['type'],
    description: string,
  ): Metric {
    let metric = this.metrics.get(name);

    if (!metric) {
      metric = {
        name,
        type,
        description,
        values: [],
      };
      this.metrics.set(name, metric);
    }

    return metric;
  }

  /**
   * Add a value to a metric
   */
  private addValue(
    metric: Metric,
    value: number,
    labels?: Record<string, string>,
  ): void {
    const metricValue: MetricValue = {
      value,
      timestamp: new Date(),
      labels,
    };

    metric.values.push(metricValue);

    // Keep only last 1000 values to prevent memory issues
    if (metric.values.length > 1000) {
      metric.values.shift();
    }
  }

  /**
   * Get the last value of a metric
   */
  private getLastValue(metric: Metric): number {
    if (metric.values.length === 0) {
      return 0;
    }
    return metric.values[metric.values.length - 1].value;
  }

  /**
   * Export metrics in Prometheus format
   */
  private exportPrometheus(snapshot: MetricsSnapshot): string {
    let output = '';

    for (const metric of snapshot.metrics) {
      output += `# HELP ${metric.name} ${metric.description}\n`;
      output += `# TYPE ${metric.name} ${metric.type}\n`;

      for (const value of metric.values) {
        const labels = value.labels
          ? Object.entries(value.labels)
              .map(([k, v]) => `${k}="${v}"`)
              .join(',')
          : '';
        const labelStr = labels ? `{${labels}}` : '';
        output += `${metric.name}${labelStr} ${value.value} ${value.timestamp.getTime()}\n`;
      }
      output += '\n';
    }

    return output;
  }

  /**
   * Export metrics in CSV format
   */
  private exportCSV(snapshot: MetricsSnapshot): string {
    let output = 'metric_name,type,description,value,timestamp,labels\n';

    for (const metric of snapshot.metrics) {
      for (const value of metric.values) {
        const labels = value.labels ? JSON.stringify(value.labels) : '';
        output += `${metric.name},${metric.type},"${metric.description}",${value.value},${value.timestamp.toISOString()},"${labels}"\n`;
      }
    }

    return output;
  }
}

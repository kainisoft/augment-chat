import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ValidationPerformanceUtils } from '@app/validation';
import { MemoizationUtils } from '../utils/memoization.util';
import {
  MemoryOptimizedOps,
  GlobalMemoryOptimizer,
} from '../utils/memory-optimization.util';

/**
 * Performance Integration Service
 *
 * Centralizes performance monitoring and optimization across all shared modules.
 * Provides unified metrics, cleanup, and optimization strategies.
 */

interface PerformanceMetrics {
  timestamp: string;
  validation: {
    cacheStats: ReturnType<typeof ValidationPerformanceUtils.getCacheStats>;
    efficiencyMetrics: ReturnType<
      typeof ValidationPerformanceUtils.getEfficiencyMetrics
    >;
  };
  memoization: {
    globalStats: ReturnType<typeof MemoizationUtils.getGlobalStats>;
    memoryUsage: ReturnType<typeof MemoizationUtils.getMemoryUsage>;
  };
  memory: {
    usage: NodeJS.MemoryUsage;
    poolStats: ReturnType<typeof MemoryOptimizedOps.getMemoryStats>;
  };
  performance: {
    uptime: number;
    loadAverage: number[];
    cpuUsage: NodeJS.CpuUsage;
  };
}

interface OptimizationRecommendations {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  score: number;
}

@Injectable()
export class PerformanceIntegrationService
  implements OnModuleInit, OnModuleDestroy
{
  private monitoringInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;
  private metricsHistory: PerformanceMetrics[] = [];
  private readonly maxHistorySize = 100;

  async onModuleInit() {
    console.log('🚀 Performance Integration Service initialized');

    // Warm up caches
    await this.warmUpCaches();

    // Start monitoring
    this.startPerformanceMonitoring();

    // Start cleanup tasks
    this.startCleanupTasks();
  }

  async onModuleDestroy() {
    console.log('🛑 Performance Integration Service shutting down');

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Final cleanup
    await this.performCleanup();
  }

  /**
   * Get comprehensive performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      validation: {
        cacheStats: ValidationPerformanceUtils.getCacheStats(),
        efficiencyMetrics: ValidationPerformanceUtils.getEfficiencyMetrics(),
      },
      memoization: {
        globalStats: MemoizationUtils.getGlobalStats(),
        memoryUsage: MemoizationUtils.getMemoryUsage(),
      },
      memory: {
        usage: process.memoryUsage(),
        poolStats: MemoryOptimizedOps.getMemoryStats(),
      },
      performance: {
        uptime: process.uptime(),
        loadAverage: require('os').loadavg(),
        cpuUsage: process.cpuUsage(),
      },
    };

    // Store in history
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }

    return metrics;
  }

  /**
   * Get performance trends over time
   */
  getPerformanceTrends() {
    if (this.metricsHistory.length < 2) {
      return null;
    }

    const latest = this.metricsHistory[this.metricsHistory.length - 1];
    const previous = this.metricsHistory[this.metricsHistory.length - 2];

    return {
      memoryTrend: {
        heapUsedChange:
          latest.memory.usage.heapUsed - previous.memory.usage.heapUsed,
        heapTotalChange:
          latest.memory.usage.heapTotal - previous.memory.usage.heapTotal,
        rssChange: latest.memory.usage.rss - previous.memory.usage.rss,
      },
      validationTrend: {
        hitRateChange:
          latest.validation.efficiencyMetrics.overallHitRate -
          previous.validation.efficiencyMetrics.overallHitRate,
        totalHitsChange:
          latest.validation.efficiencyMetrics.totalHits -
          previous.validation.efficiencyMetrics.totalHits,
      },
      memoizationTrend: {
        hitRateChange:
          latest.memoization.memoryUsage.overallHitRate -
          previous.memoization.memoryUsage.overallHitRate,
        cacheSizeChange:
          latest.memoization.memoryUsage.totalCacheSize -
          previous.memoization.memoryUsage.totalCacheSize,
      },
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(): OptimizationRecommendations {
    const metrics = this.getPerformanceMetrics();
    const trends = this.getPerformanceTrends();

    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];
    let score = 100;

    // Memory analysis
    const heapUsedMB = metrics.memory.usage.heapUsed / (1024 * 1024);
    if (heapUsedMB > 200) {
      immediate.push('High memory usage detected - consider memory cleanup');
      score -= 20;
    } else if (heapUsedMB > 100) {
      shortTerm.push('Monitor memory usage - approaching high levels');
      score -= 10;
    }

    // Validation cache analysis
    if (metrics.validation.efficiencyMetrics.overallHitRate < 0.7) {
      shortTerm.push(
        'Validation cache hit rate is low - consider increasing cache size or TTL',
      );
      score -= 15;
    }

    // Memoization analysis
    if (metrics.memoization.memoryUsage.overallHitRate < 0.6) {
      shortTerm.push(
        'Memoization hit rate is low - review memoization strategies',
      );
      score -= 10;
    }

    // Trend analysis
    if (trends) {
      if (trends.memoryTrend.heapUsedChange > 10 * 1024 * 1024) {
        // > 10MB growth
        immediate.push(
          'Memory usage is growing rapidly - investigate memory leaks',
        );
        score -= 25;
      }

      if (trends.validationTrend.hitRateChange < -0.1) {
        shortTerm.push('Validation cache performance is declining');
        score -= 10;
      }
    }

    // CPU analysis
    const loadAvg = metrics.performance.loadAverage[0];
    if (loadAvg > 2) {
      immediate.push(
        'High CPU load detected - consider performance optimization',
      );
      score -= 15;
    }

    // General recommendations
    if (immediate.length === 0 && shortTerm.length === 0) {
      longTerm.push('Performance is optimal - consider advanced optimizations');
      longTerm.push('Implement performance regression testing');
      longTerm.push('Consider micro-optimizations for hot paths');
    }

    return {
      immediate,
      shortTerm,
      longTerm,
      score: Math.max(0, score),
    };
  }

  /**
   * Perform automatic optimizations
   */
  async performAutomaticOptimizations(): Promise<{
    performed: string[];
    skipped: string[];
    results: any;
  }> {
    const performed: string[] = [];
    const skipped: string[] = [];
    const results: any = {};

    try {
      // Cleanup expired cache entries
      ValidationPerformanceUtils.cleanupCaches();
      performed.push('Cleaned up validation caches');

      // Cleanup memoization caches
      const cleanedMemo = MemoizationUtils.cleanupAllGlobal();
      results.memoizationCleanup = cleanedMemo;
      performed.push('Cleaned up memoization caches');

      // Clear memory pools if they're getting large
      const memStats = MemoryOptimizedOps.getMemoryStats();
      if (
        memStats.bufferPool.totalBuffers > 100 ||
        memStats.arrayPool.totalArrays > 100
      ) {
        MemoryOptimizedOps.clearPools();
        performed.push('Cleared memory pools');
      } else {
        skipped.push('Memory pools are within acceptable limits');
      }

      // Force garbage collection if memory usage is high
      const memUsage = process.memoryUsage();
      if (memUsage.heapUsed > 200 * 1024 * 1024) {
        // > 200MB
        if (GlobalMemoryOptimizer.forceGC()) {
          performed.push('Forced garbage collection');
        } else {
          skipped.push('Garbage collection not available');
        }
      } else {
        skipped.push('Memory usage is acceptable');
      }
    } catch (error) {
      console.error('Error during automatic optimizations:', error);
    }

    return { performed, skipped, results };
  }

  /**
   * Get performance health score
   */
  getHealthScore(): {
    overall: number;
    breakdown: {
      memory: number;
      validation: number;
      memoization: number;
      cpu: number;
    };
  } {
    const metrics = this.getPerformanceMetrics();

    // Memory score (0-100)
    const heapUsedMB = metrics.memory.usage.heapUsed / (1024 * 1024);
    const memoryScore = Math.max(0, 100 - heapUsedMB / 2); // Penalty after 200MB

    // Validation score (0-100)
    const validationScore =
      metrics.validation.efficiencyMetrics.overallHitRate * 100;

    // Memoization score (0-100)
    const memoizationScore =
      metrics.memoization.memoryUsage.overallHitRate * 100;

    // CPU score (0-100)
    const loadAvg = metrics.performance.loadAverage[0];
    const cpuScore = Math.max(0, 100 - loadAvg * 25); // Penalty for high load

    const overall =
      (memoryScore + validationScore + memoizationScore + cpuScore) / 4;

    return {
      overall,
      breakdown: {
        memory: memoryScore,
        validation: validationScore,
        memoization: memoizationScore,
        cpu: cpuScore,
      },
    };
  }

  /**
   * Warm up caches with common values
   */
  private async warmUpCaches(): Promise<void> {
    console.log('🔥 Warming up performance caches...');

    try {
      // Warm up validation caches
      ValidationPerformanceUtils.warmUpCaches();

      console.log('✅ Cache warm-up completed');
    } catch (error) {
      console.error('❌ Cache warm-up failed:', error);
    }
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      const metrics = this.getPerformanceMetrics();
      const healthScore = this.getHealthScore();

      // Log performance summary
      console.debug('Performance Summary:', {
        healthScore: healthScore.overall.toFixed(1),
        memoryUsage: `${Math.round(metrics.memory.usage.heapUsed / 1024 / 1024)}MB`,
        validationHitRate: `${(metrics.validation.efficiencyMetrics.overallHitRate * 100).toFixed(1)}%`,
        memoizationHitRate: `${(metrics.memoization.memoryUsage.overallHitRate * 100).toFixed(1)}%`,
      });

      // Auto-optimize if health score is low
      if (healthScore.overall < 70) {
        console.warn(
          '⚠️ Performance health score is low, running automatic optimizations...',
        );
        this.performAutomaticOptimizations().then((results) => {
          console.log('🔧 Automatic optimizations completed:', results);
        });
      }
    }, 60000); // Every minute
  }

  /**
   * Start cleanup tasks
   */
  private startCleanupTasks(): void {
    this.cleanupInterval = setInterval(
      () => {
        this.performCleanup();
      },
      5 * 60 * 1000,
    ); // Every 5 minutes
  }

  /**
   * Perform cleanup tasks
   */
  private async performCleanup(): Promise<void> {
    try {
      // Cleanup validation caches
      ValidationPerformanceUtils.cleanupCaches();

      // Cleanup memoization caches
      MemoizationUtils.cleanupAllGlobal();

      console.debug('🧹 Periodic cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }

  /**
   * Export performance data for analysis
   */
  exportPerformanceData() {
    return {
      timestamp: new Date().toISOString(),
      currentMetrics: this.getPerformanceMetrics(),
      trends: this.getPerformanceTrends(),
      recommendations: this.generateOptimizationRecommendations(),
      healthScore: this.getHealthScore(),
      history: this.metricsHistory.slice(-10), // Last 10 entries
    };
  }
}

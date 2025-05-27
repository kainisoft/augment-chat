#!/usr/bin/env ts-node

/**
 * Memory Usage Tracker
 *
 * Monitors memory consumption patterns of shared modules during runtime.
 * Provides insights into memory leaks, garbage collection patterns, and optimization opportunities.
 */

import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';

interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
}

interface MemoryProfile {
  serviceName: string;
  startTime: number;
  endTime: number;
  duration: number;
  snapshots: MemorySnapshot[];
  statistics: {
    averageHeapUsed: number;
    peakHeapUsed: number;
    averageRSS: number;
    peakRSS: number;
    memoryGrowthRate: number;
    gcEvents: number;
    memoryLeakSuspected: boolean;
  };
  sharedModuleImpact: {
    [moduleName: string]: {
      estimatedMemoryUsage: number;
      allocationCount: number;
      deallocationCount: number;
    };
  };
}

interface ValidationPerformanceMetrics {
  decoratorName: string;
  executionCount: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  memoryAllocated: number;
  cacheHitRate?: number;
}

class MemoryTracker {
  private snapshots: MemorySnapshot[] = [];
  private startTime: number = 0;
  private intervalId?: NodeJS.Timeout;
  private validationMetrics: Map<string, ValidationPerformanceMetrics> = new Map();
  private gcEventCount = 0;

  /**
   * Start memory tracking
   */
  startTracking(intervalMs: number = 1000): void {
    console.log('🔍 Starting memory tracking...');

    this.startTime = performance.now();
    this.snapshots = [];
    this.gcEventCount = 0;

    // Monitor garbage collection events
    if (global.gc) {
      const originalGC = global.gc;
      global.gc = (() => {
        this.gcEventCount++;
        return originalGC();
      }) as any;
    }

    // Take initial snapshot
    this.takeSnapshot();

    // Start periodic snapshots
    this.intervalId = setInterval(() => {
      this.takeSnapshot();
    }, intervalMs);

    console.log(`✅ Memory tracking started (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop memory tracking
   */
  stopTracking(): MemoryProfile {
    console.log('🛑 Stopping memory tracking...');

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    const endTime = performance.now();
    const duration = endTime - this.startTime;

    const profile: MemoryProfile = {
      serviceName: 'shared-modules-test',
      startTime: this.startTime,
      endTime,
      duration,
      snapshots: this.snapshots,
      statistics: this.calculateStatistics(),
      sharedModuleImpact: this.analyzeSharedModuleImpact()
    };

    console.log('✅ Memory tracking stopped');
    return profile;
  }

  /**
   * Take a memory snapshot
   */
  private takeSnapshot(): void {
    const memUsage = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      timestamp: performance.now(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      arrayBuffers: memUsage.arrayBuffers
    };

    this.snapshots.push(snapshot);
  }

  /**
   * Calculate memory statistics
   */
  private calculateStatistics() {
    if (this.snapshots.length === 0) {
      return {
        averageHeapUsed: 0,
        peakHeapUsed: 0,
        averageRSS: 0,
        peakRSS: 0,
        memoryGrowthRate: 0,
        gcEvents: this.gcEventCount,
        memoryLeakSuspected: false
      };
    }

    const heapUsedValues = this.snapshots.map(s => s.heapUsed);
    const rssValues = this.snapshots.map(s => s.rss);

    const averageHeapUsed = heapUsedValues.reduce((sum, val) => sum + val, 0) / heapUsedValues.length;
    const peakHeapUsed = Math.max(...heapUsedValues);
    const averageRSS = rssValues.reduce((sum, val) => sum + val, 0) / rssValues.length;
    const peakRSS = Math.max(...rssValues);

    // Calculate memory growth rate (bytes per second)
    const firstSnapshot = this.snapshots[0];
    const lastSnapshot = this.snapshots[this.snapshots.length - 1];
    const timeDiff = (lastSnapshot.timestamp - firstSnapshot.timestamp) / 1000; // Convert to seconds
    const memoryDiff = lastSnapshot.heapUsed - firstSnapshot.heapUsed;
    const memoryGrowthRate = timeDiff > 0 ? memoryDiff / timeDiff : 0;

    // Detect potential memory leaks (consistent growth over time)
    const memoryLeakSuspected = memoryGrowthRate > 1024 * 1024; // > 1MB/s growth

    return {
      averageHeapUsed,
      peakHeapUsed,
      averageRSS,
      peakRSS,
      memoryGrowthRate,
      gcEvents: this.gcEventCount,
      memoryLeakSuspected
    };
  }

  /**
   * Analyze shared module memory impact
   */
  private analyzeSharedModuleImpact() {
    // This is a simplified estimation based on module usage patterns
    // In a real implementation, you would use more sophisticated profiling

    return {
      '@app/validation': {
        estimatedMemoryUsage: this.estimateValidationMemoryUsage(),
        allocationCount: this.validationMetrics.size * 10, // Estimated
        deallocationCount: this.validationMetrics.size * 8  // Estimated
      },
      '@app/dtos': {
        estimatedMemoryUsage: this.estimateDtosMemoryUsage(),
        allocationCount: 50, // Estimated based on DTO instantiations
        deallocationCount: 45
      },
      '@app/security': {
        estimatedMemoryUsage: this.estimateSecurityMemoryUsage(),
        allocationCount: 20, // Estimated based on security operations
        deallocationCount: 18
      },
      '@app/testing': {
        estimatedMemoryUsage: this.estimateTestingMemoryUsage(),
        allocationCount: 100, // Estimated based on mock creations
        deallocationCount: 95
      }
    };
  }

  /**
   * Estimate validation module memory usage
   */
  private estimateValidationMemoryUsage(): number {
    // Base memory for validation decorators and class-validator
    let baseMemory = 512 * 1024; // 512KB base

    // Add memory for each validation metric tracked
    this.validationMetrics.forEach(metric => {
      baseMemory += metric.memoryAllocated;
    });

    return baseMemory;
  }

  /**
   * Estimate DTOs module memory usage
   */
  private estimateDtosMemoryUsage(): number {
    // DTOs are typically lightweight, mainly class definitions
    return 256 * 1024; // 256KB estimated
  }

  /**
   * Estimate security module memory usage
   */
  private estimateSecurityMemoryUsage(): number {
    // Security utilities, rate limiting data structures
    return 1024 * 1024; // 1MB estimated (rate limiting can use more memory)
  }

  /**
   * Estimate testing module memory usage
   */
  private estimateTestingMemoryUsage(): number {
    // Mock factories and test data
    return 2 * 1024 * 1024; // 2MB estimated (mocks can be memory-intensive)
  }

  /**
   * Track validation decorator performance
   */
  trackValidationPerformance(decoratorName: string, executionTime: number, memoryDelta: number): void {
    const existing = this.validationMetrics.get(decoratorName);

    if (existing) {
      existing.executionCount++;
      existing.totalExecutionTime += executionTime;
      existing.averageExecutionTime = existing.totalExecutionTime / existing.executionCount;
      existing.memoryAllocated += memoryDelta;
    } else {
      this.validationMetrics.set(decoratorName, {
        decoratorName,
        executionCount: 1,
        totalExecutionTime: executionTime,
        averageExecutionTime: executionTime,
        memoryAllocated: memoryDelta
      });
    }
  }

  /**
   * Simulate shared module usage for testing
   */
  async simulateSharedModuleUsage(): Promise<void> {
    console.log('🧪 Simulating shared module usage...');

    // Simulate validation operations
    await this.simulateValidationUsage();

    // Simulate DTO operations
    await this.simulateDtoUsage();

    // Simulate security operations
    await this.simulateSecurityUsage();

    // Simulate testing operations
    await this.simulateTestingUsage();

    console.log('✅ Simulation complete');
  }

  /**
   * Simulate validation module usage
   */
  private async simulateValidationUsage(): Promise<void> {
    const decorators = ['IsEmailField', 'IsStrongPasswordField', 'IsUUIDField', 'IsUsernameField'];

    for (let i = 0; i < 100; i++) {
      const decorator = decorators[i % decorators.length];
      const startTime = performance.now();
      const startMemory = process.memoryUsage().heapUsed;

      // Simulate validation work
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10));

      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;

      this.trackValidationPerformance(
        decorator,
        endTime - startTime,
        endMemory - startMemory
      );
    }
  }

  /**
   * Simulate DTO operations
   */
  private async simulateDtoUsage(): Promise<void> {
    // Simulate DTO instantiation and serialization
    for (let i = 0; i < 50; i++) {
      const dto = {
        email: `user${i}@example.com`,
        password: 'Password123',
        username: `user${i}`
      };

      // Simulate serialization/deserialization
      JSON.stringify(dto);
      await new Promise(resolve => setTimeout(resolve, 1));
    }
  }

  /**
   * Simulate security operations
   */
  private async simulateSecurityUsage(): Promise<void> {
    // Simulate rate limiting and security checks
    for (let i = 0; i < 30; i++) {
      // Simulate rate limit check
      const rateLimitData = new Map();
      rateLimitData.set(`user${i}`, { count: i, lastReset: Date.now() });

      await new Promise(resolve => setTimeout(resolve, 5));
    }
  }

  /**
   * Simulate testing operations
   */
  private async simulateTestingUsage(): Promise<void> {
    // Simulate mock creation and cleanup
    for (let i = 0; i < 20; i++) {
      const mockData = {
        users: Array.from({ length: 10 }, (_, idx) => ({
          id: `user-${idx}`,
          email: `user${idx}@example.com`,
          username: `user${idx}`
        })),
        requests: Array.from({ length: 5 }, (_, idx) => ({
          id: `req-${idx}`,
          method: 'GET',
          url: `/api/test${idx}`
        }))
      };

      // Simulate mock usage
      JSON.stringify(mockData);
      await new Promise(resolve => setTimeout(resolve, 2));
    }
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generate memory report
   */
  generateReport(profile: MemoryProfile): void {
    console.log('\n💾 MEMORY USAGE ANALYSIS REPORT');
    console.log('===============================\n');

    // Basic Statistics
    console.log('📊 Memory Statistics:');
    console.log(`   Duration: ${(profile.duration / 1000).toFixed(2)}s`);
    console.log(`   Snapshots Taken: ${profile.snapshots.length}`);
    console.log(`   Average Heap Used: ${this.formatBytes(profile.statistics.averageHeapUsed)}`);
    console.log(`   Peak Heap Used: ${this.formatBytes(profile.statistics.peakHeapUsed)}`);
    console.log(`   Average RSS: ${this.formatBytes(profile.statistics.averageRSS)}`);
    console.log(`   Peak RSS: ${this.formatBytes(profile.statistics.peakRSS)}`);
    console.log(`   Memory Growth Rate: ${this.formatBytes(profile.statistics.memoryGrowthRate)}/s`);
    console.log(`   GC Events: ${profile.statistics.gcEvents}`);
    console.log(`   Memory Leak Suspected: ${profile.statistics.memoryLeakSuspected ? '⚠️  Yes' : '✅ No'}`);

    // Shared Module Impact
    console.log('\n🔬 Shared Module Memory Impact:');
    Object.entries(profile.sharedModuleImpact).forEach(([module, impact]) => {
      console.log(`   ${module}:`);
      console.log(`     Estimated Usage: ${this.formatBytes(impact.estimatedMemoryUsage)}`);
      console.log(`     Allocations: ${impact.allocationCount}`);
      console.log(`     Deallocations: ${impact.deallocationCount}`);
      console.log(`     Net Allocations: ${impact.allocationCount - impact.deallocationCount}`);
    });

    // Validation Performance
    if (this.validationMetrics.size > 0) {
      console.log('\n⚡ Validation Performance:');
      this.validationMetrics.forEach(metric => {
        console.log(`   ${metric.decoratorName}:`);
        console.log(`     Executions: ${metric.executionCount}`);
        console.log(`     Avg Execution Time: ${metric.averageExecutionTime.toFixed(2)}ms`);
        console.log(`     Memory Allocated: ${this.formatBytes(metric.memoryAllocated)}`);
      });
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (profile.statistics.memoryLeakSuspected) {
      console.log('   ⚠️  Investigate potential memory leak - consistent memory growth detected');
    }

    if (profile.statistics.gcEvents < 5) {
      console.log('   ℹ️  Low GC activity - consider manual garbage collection for better performance');
    }

    const totalSharedModuleMemory = Object.values(profile.sharedModuleImpact)
      .reduce((sum, impact) => sum + impact.estimatedMemoryUsage, 0);

    if (totalSharedModuleMemory > 5 * 1024 * 1024) { // > 5MB
      console.log('   ⚠️  High shared module memory usage - consider optimization');
    }

    console.log('\n✅ Memory analysis complete!\n');
  }

  /**
   * Save memory profile to file
   */
  async saveProfile(profile: MemoryProfile): Promise<void> {
    const outputDir = path.join(process.cwd(), 'performance-reports');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `memory-profile-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(profile, null, 2));

    console.log(`💾 Memory profile saved to: ${filepath}`);
  }
}

// Main execution
async function main() {
  const tracker = new MemoryTracker();

  try {
    // Start tracking
    tracker.startTracking(500); // Take snapshot every 500ms

    // Simulate shared module usage
    await tracker.simulateSharedModuleUsage();

    // Let it run for a bit more to capture patterns
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Stop tracking and generate report
    const profile = tracker.stopTracking();
    await tracker.saveProfile(profile);
    tracker.generateReport(profile);

  } catch (error) {
    console.error('❌ Memory tracking failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { MemoryTracker, MemoryProfile };

#!/usr/bin/env ts-node

/**
 * Response Time Analyzer
 *
 * Measures the performance impact of validation decorators, security utilities,
 * and testing mock factories on response times and overall application performance.
 */

import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';

interface ResponseTimeMetrics {
  operation: string;
  category: 'validation' | 'security' | 'testing' | 'dto';
  executionTimes: number[];
  statistics: {
    min: number;
    max: number;
    average: number;
    median: number;
    p95: number;
    p99: number;
    standardDeviation: number;
  };
  throughput: {
    operationsPerSecond: number;
    totalOperations: number;
    totalDuration: number;
  };
  memoryImpact: {
    averageMemoryDelta: number;
    peakMemoryDelta: number;
  };
}

interface PerformanceBenchmark {
  timestamp: string;
  testDuration: number;
  metrics: ResponseTimeMetrics[];
  summary: {
    totalOperations: number;
    averageResponseTime: number;
    slowestOperation: string;
    fastestOperation: string;
    memoryEfficiency: number;
    performanceScore: number;
  };
  recommendations: string[];
}

class ResponseTimeAnalyzer {
  private metrics: Map<string, ResponseTimeMetrics> = new Map();
  private startTime: number = 0;

  /**
   * Start performance benchmarking
   */
  startBenchmark(): void {
    console.log('🚀 Starting response time analysis...');
    this.startTime = performance.now();
    this.metrics.clear();
  }

  /**
   * Measure operation performance
   */
  async measureOperation<T>(
    operationName: string,
    category: ResponseTimeMetrics['category'],
    operation: () => Promise<T> | T
  ): Promise<T> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      const result = await operation();

      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;
      const executionTime = endTime - startTime;
      const memoryDelta = endMemory - startMemory;

      this.recordMetric(operationName, category, executionTime, memoryDelta);

      return result;
    } catch (error) {
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Record failed operations too
      this.recordMetric(operationName, category, executionTime, 0);
      throw error;
    }
  }

  /**
   * Record performance metric
   */
  private recordMetric(
    operationName: string,
    category: ResponseTimeMetrics['category'],
    executionTime: number,
    memoryDelta: number
  ): void {
    const existing = this.metrics.get(operationName);

    if (existing) {
      existing.executionTimes.push(executionTime);

      // Update memory impact
      const avgMemoryDelta = existing.memoryImpact.averageMemoryDelta;
      const count = existing.executionTimes.length;
      existing.memoryImpact.averageMemoryDelta =
        (avgMemoryDelta * (count - 1) + memoryDelta) / count;
      existing.memoryImpact.peakMemoryDelta =
        Math.max(existing.memoryImpact.peakMemoryDelta, memoryDelta);
    } else {
      this.metrics.set(operationName, {
        operation: operationName,
        category,
        executionTimes: [executionTime],
        statistics: {
          min: 0,
          max: 0,
          average: 0,
          median: 0,
          p95: 0,
          p99: 0,
          standardDeviation: 0
        },
        throughput: {
          operationsPerSecond: 0,
          totalOperations: 0,
          totalDuration: 0
        },
        memoryImpact: {
          averageMemoryDelta: memoryDelta,
          peakMemoryDelta: memoryDelta
        }
      });
    }
  }

  /**
   * Run comprehensive performance tests
   */
  async runPerformanceTests(): Promise<PerformanceBenchmark> {
    console.log('🧪 Running performance tests...\n');

    this.startBenchmark();

    // Test validation decorators
    await this.testValidationPerformance();

    // Test security utilities
    await this.testSecurityPerformance();

    // Test DTO operations
    await this.testDtoPerformance();

    // Test testing utilities
    await this.testTestingPerformance();

    const endTime = performance.now();
    const testDuration = endTime - this.startTime;

    // Calculate final statistics
    this.calculateStatistics();

    const benchmark: PerformanceBenchmark = {
      timestamp: new Date().toISOString(),
      testDuration,
      metrics: Array.from(this.metrics.values()),
      summary: this.generateSummary(),
      recommendations: this.generateRecommendations()
    };

    console.log('✅ Performance tests completed\n');
    return benchmark;
  }

  /**
   * Test validation decorator performance
   */
  private async testValidationPerformance(): Promise<void> {
    console.log('⚡ Testing validation performance...');

    const testData = [
      { email: 'user@example.com', valid: true },
      { email: 'invalid-email', valid: false },
      { email: 'test.user+tag@domain.co.uk', valid: true },
      { email: '', valid: false }
    ];

    // Test email validation
    for (let i = 0; i < 1000; i++) {
      const data = testData[i % testData.length];
      await this.measureOperation('EmailValidation', 'validation', async () => {
        // Simulate email validation logic
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(data.email);
      });
    }

    // Test password validation
    const passwords = ['Password123!', 'weak', 'StrongP@ssw0rd', '123456'];
    for (let i = 0; i < 500; i++) {
      const password = passwords[i % passwords.length];
      await this.measureOperation('PasswordValidation', 'validation', async () => {
        // Simulate strong password validation
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);
        const isLongEnough = password.length >= 8;

        return hasUpper && hasLower && hasNumber && hasSpecial && isLongEnough;
      });
    }

    // Test UUID validation
    const uuids = [
      '123e4567-e89b-12d3-a456-426614174000',
      'invalid-uuid',
      '550e8400-e29b-41d4-a716-446655440000',
      'not-a-uuid-at-all'
    ];

    for (let i = 0; i < 300; i++) {
      const uuid = uuids[i % uuids.length];
      await this.measureOperation('UUIDValidation', 'validation', async () => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
      });
    }

    console.log('  ✅ Validation tests completed');
  }

  /**
   * Test security utility performance
   */
  private async testSecurityPerformance(): Promise<void> {
    console.log('🔒 Testing security performance...');

    // Test rate limiting
    const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

    for (let i = 0; i < 500; i++) {
      const clientId = `client-${i % 10}`;
      await this.measureOperation('RateLimitCheck', 'security', async () => {
        const now = Date.now();
        const windowMs = 60000; // 1 minute
        const maxRequests = 100;

        const existing = rateLimitStore.get(clientId);
        if (!existing || now > existing.resetTime) {
          rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
          return true;
        }

        if (existing.count >= maxRequests) {
          return false;
        }

        existing.count++;
        return true;
      });
    }

    // Test password hashing simulation
    for (let i = 0; i < 100; i++) {
      const password = `password${i}`;
      await this.measureOperation('PasswordHashing', 'security', async () => {
        // Simulate bcrypt hashing (simplified)
        let hash = password;
        for (let j = 0; j < 10; j++) { // Reduced iterations to prevent string overflow
          hash = Buffer.from(hash.slice(0, 100)).toString('base64'); // Limit string length
        }
        return hash;
      });
    }

    // Test token generation
    for (let i = 0; i < 200; i++) {
      await this.measureOperation('TokenGeneration', 'security', async () => {
        // Simulate JWT token generation
        const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
        const payload = Buffer.from(JSON.stringify({
          sub: `user-${i}`,
          iat: Date.now(),
          exp: Date.now() + 3600000
        })).toString('base64');
        const signature = Buffer.from(`${header}.${payload}.secret`).toString('base64');

        return `${header}.${payload}.${signature}`;
      });
    }

    console.log('  ✅ Security tests completed');
  }

  /**
   * Test DTO operation performance
   */
  private async testDtoPerformance(): Promise<void> {
    console.log('📋 Testing DTO performance...');

    // Test DTO serialization
    for (let i = 0; i < 1000; i++) {
      const dto = {
        id: `user-${i}`,
        email: `user${i}@example.com`,
        username: `user${i}`,
        displayName: `User ${i}`,
        isActive: i % 2 === 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await this.measureOperation('DTOSerialization', 'dto', async () => {
        return JSON.stringify(dto);
      });
    }

    // Test DTO deserialization
    const sampleJson = JSON.stringify({
      email: 'test@example.com',
      password: 'Password123!',
      username: 'testuser'
    });

    for (let i = 0; i < 1000; i++) {
      await this.measureOperation('DTODeserialization', 'dto', async () => {
        return JSON.parse(sampleJson);
      });
    }

    // Test DTO validation
    for (let i = 0; i < 500; i++) {
      const dto = {
        email: i % 3 === 0 ? 'invalid-email' : `user${i}@example.com`,
        password: i % 4 === 0 ? 'weak' : 'StrongPassword123!',
        username: i % 5 === 0 ? '' : `user${i}`
      };

      await this.measureOperation('DTOValidation', 'dto', async () => {
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email);
        const passwordValid = dto.password.length >= 8;
        const usernameValid = dto.username.length >= 3;

        return emailValid && passwordValid && usernameValid;
      });
    }

    console.log('  ✅ DTO tests completed');
  }

  /**
   * Test testing utility performance
   */
  private async testTestingPerformance(): Promise<void> {
    console.log('🧪 Testing mock factory performance...');

    // Test mock user creation
    for (let i = 0; i < 300; i++) {
      await this.measureOperation('MockUserCreation', 'testing', async () => {
        return {
          id: `user-${i}`,
          email: `user${i}@example.com`,
          username: `user${i}`,
          displayName: `User ${i}`,
          isActive: true,
          isVerified: i % 2 === 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          profile: {
            bio: `Bio for user ${i}`,
            avatarUrl: `https://example.com/avatar${i}.jpg`,
            location: `City ${i}`
          }
        };
      });
    }

    // Test mock request creation
    for (let i = 0; i < 200; i++) {
      await this.measureOperation('MockRequestCreation', 'testing', async () => {
        return {
          method: ['GET', 'POST', 'PUT', 'DELETE'][i % 4],
          url: `/api/test/${i}`,
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer token-${i}`,
            'user-agent': 'test-agent'
          },
          body: i % 2 === 0 ? { data: `test-data-${i}` } : undefined,
          params: { id: i.toString() },
          query: { page: Math.floor(i / 10).toString() }
        };
      });
    }

    // Test mock response creation
    for (let i = 0; i < 200; i++) {
      await this.measureOperation('MockResponseCreation', 'testing', async () => {
        return {
          status: [200, 201, 400, 404, 500][i % 5],
          data: {
            success: i % 5 < 2,
            message: `Response message ${i}`,
            data: Array.from({ length: 10 }, (_, idx) => ({ id: idx, value: `item-${idx}` }))
          },
          headers: {
            'content-type': 'application/json',
            'x-request-id': `req-${i}`
          }
        };
      });
    }

    console.log('  ✅ Testing utility tests completed');
  }

  /**
   * Calculate statistics for all metrics
   */
  private calculateStatistics(): void {
    this.metrics.forEach(metric => {
      const times = metric.executionTimes.sort((a, b) => a - b);
      const count = times.length;

      if (count === 0) return;

      // Basic statistics
      metric.statistics.min = times[0];
      metric.statistics.max = times[count - 1];
      metric.statistics.average = times.reduce((sum, time) => sum + time, 0) / count;
      metric.statistics.median = count % 2 === 0
        ? (times[count / 2 - 1] + times[count / 2]) / 2
        : times[Math.floor(count / 2)];

      // Percentiles
      metric.statistics.p95 = times[Math.floor(count * 0.95)];
      metric.statistics.p99 = times[Math.floor(count * 0.99)];

      // Standard deviation
      const variance = times.reduce((sum, time) => {
        return sum + Math.pow(time - metric.statistics.average, 2);
      }, 0) / count;
      metric.statistics.standardDeviation = Math.sqrt(variance);

      // Throughput
      const totalDuration = times.reduce((sum, time) => sum + time, 0);
      metric.throughput.totalOperations = count;
      metric.throughput.totalDuration = totalDuration;
      metric.throughput.operationsPerSecond = count / (totalDuration / 1000);
    });
  }

  /**
   * Generate performance summary
   */
  private generateSummary() {
    const allMetrics = Array.from(this.metrics.values());
    const totalOperations = allMetrics.reduce((sum, metric) => sum + metric.executionTimes.length, 0);

    const averageResponseTime = allMetrics.reduce((sum, metric) => {
      return sum + metric.statistics.average * metric.executionTimes.length;
    }, 0) / totalOperations;

    const slowestMetric = allMetrics.reduce((slowest, current) =>
      current.statistics.max > slowest.statistics.max ? current : slowest
    );

    const fastestMetric = allMetrics.reduce((fastest, current) =>
      current.statistics.min < fastest.statistics.min ? current : fastest
    );

    // Calculate memory efficiency (lower memory delta per operation is better)
    const memoryEfficiency = allMetrics.reduce((sum, metric) => {
      return sum + (1 / (metric.memoryImpact.averageMemoryDelta + 1));
    }, 0) / allMetrics.length;

    // Calculate overall performance score (0-100)
    const performanceScore = Math.max(0, Math.min(100,
      100 - (averageResponseTime / 10) // Penalty for slow operations
    ));

    return {
      totalOperations,
      averageResponseTime,
      slowestOperation: slowestMetric.operation,
      fastestOperation: fastestMetric.operation,
      memoryEfficiency,
      performanceScore
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const allMetrics = Array.from(this.metrics.values());

    // Check for slow operations
    const slowOperations = allMetrics.filter(metric => metric.statistics.average > 10);
    if (slowOperations.length > 0) {
      recommendations.push(`Optimize slow operations: ${slowOperations.map(op => op.operation).join(', ')}`);
    }

    // Check for high memory usage
    const memoryIntensiveOps = allMetrics.filter(metric => metric.memoryImpact.averageMemoryDelta > 1024 * 1024);
    if (memoryIntensiveOps.length > 0) {
      recommendations.push(`Reduce memory usage for: ${memoryIntensiveOps.map(op => op.operation).join(', ')}`);
    }

    // Check for high variance
    const inconsistentOps = allMetrics.filter(metric =>
      metric.statistics.standardDeviation > metric.statistics.average * 0.5
    );
    if (inconsistentOps.length > 0) {
      recommendations.push(`Improve consistency for: ${inconsistentOps.map(op => op.operation).join(', ')}`);
    }

    // General recommendations
    if (allMetrics.some(metric => metric.category === 'validation' && metric.statistics.average > 5)) {
      recommendations.push('Consider caching validation results for frequently validated data');
    }

    if (allMetrics.some(metric => metric.category === 'security' && metric.statistics.average > 20)) {
      recommendations.push('Consider optimizing security operations or implementing async processing');
    }

    return recommendations;
  }

  /**
   * Format time to human readable format
   */
  private formatTime(ms: number): string {
    if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  /**
   * Generate detailed report
   */
  generateReport(benchmark: PerformanceBenchmark): void {
    console.log('\n⚡ RESPONSE TIME ANALYSIS REPORT');
    console.log('================================\n');

    // Summary
    console.log('📊 Performance Summary:');
    console.log(`   Test Duration: ${this.formatTime(benchmark.testDuration)}`);
    console.log(`   Total Operations: ${benchmark.summary.totalOperations}`);
    console.log(`   Average Response Time: ${this.formatTime(benchmark.summary.averageResponseTime)}`);
    console.log(`   Slowest Operation: ${benchmark.summary.slowestOperation}`);
    console.log(`   Fastest Operation: ${benchmark.summary.fastestOperation}`);
    console.log(`   Performance Score: ${benchmark.summary.performanceScore.toFixed(1)}/100`);
    console.log(`   Memory Efficiency: ${benchmark.summary.memoryEfficiency.toFixed(2)}`);

    // Category breakdown
    const categories = ['validation', 'security', 'dto', 'testing'] as const;
    categories.forEach(category => {
      const categoryMetrics = benchmark.metrics.filter(m => m.category === category);
      if (categoryMetrics.length > 0) {
        console.log(`\n🔬 ${category.toUpperCase()} Performance:`);
        categoryMetrics.forEach(metric => {
          console.log(`   ${metric.operation}:`);
          console.log(`     Operations: ${metric.executionTimes.length}`);
          console.log(`     Avg: ${this.formatTime(metric.statistics.average)}`);
          console.log(`     P95: ${this.formatTime(metric.statistics.p95)}`);
          console.log(`     P99: ${this.formatTime(metric.statistics.p99)}`);
          console.log(`     Throughput: ${metric.throughput.operationsPerSecond.toFixed(0)} ops/s`);
        });
      }
    });

    // Recommendations
    if (benchmark.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      benchmark.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }

    console.log('\n✅ Response time analysis complete!\n');
  }

  /**
   * Save benchmark results
   */
  async saveBenchmark(benchmark: PerformanceBenchmark): Promise<void> {
    const outputDir = path.join(process.cwd(), 'performance-reports');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `response-time-benchmark-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(benchmark, null, 2));

    console.log(`⚡ Response time benchmark saved to: ${filepath}`);
  }
}

// Main execution
async function main() {
  const analyzer = new ResponseTimeAnalyzer();

  try {
    const benchmark = await analyzer.runPerformanceTests();
    await analyzer.saveBenchmark(benchmark);
    analyzer.generateReport(benchmark);
  } catch (error) {
    console.error('❌ Response time analysis failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { ResponseTimeAnalyzer, PerformanceBenchmark };

#!/usr/bin/env ts-node

/**
 * Performance Baseline Establishment
 * 
 * Comprehensive performance analysis that runs all monitoring utilities
 * to establish a baseline for shared infrastructure modules performance.
 */

import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';
import { PerformanceMonitor, PerformanceMetrics } from './performance-monitor';
import { BundleAnalyzer } from './bundle-analyzer';
import { MemoryTracker, MemoryProfile } from './memory-tracker';
import { ResponseTimeAnalyzer, PerformanceBenchmark } from './response-time-analyzer';

interface BaselineReport {
  timestamp: string;
  version: string;
  environment: {
    nodeVersion: string;
    platform: string;
    arch: string;
    totalMemory: number;
    cpuCount: number;
  };
  performanceMetrics: PerformanceMetrics;
  bundleAnalysis: Awaited<ReturnType<BundleAnalyzer['analyzeBundles']>>;
  memoryProfile: MemoryProfile;
  responseTimeBenchmark: PerformanceBenchmark;
  summary: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    criticalIssues: string[];
    optimizationPriorities: Array<{
      priority: 'high' | 'medium' | 'low';
      area: string;
      description: string;
      estimatedImpact: string;
    }>;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

class BaselineEstablisher {
  private readonly outputDir = path.join(process.cwd(), 'performance-reports');

  /**
   * Establish comprehensive performance baseline
   */
  async establishBaseline(): Promise<BaselineReport> {
    console.log('🎯 ESTABLISHING PERFORMANCE BASELINE');
    console.log('====================================\n');
    
    const startTime = performance.now();
    
    // Ensure output directory exists
    this.ensureOutputDirectory();
    
    // Gather environment information
    const environment = this.gatherEnvironmentInfo();
    console.log('📋 Environment Information:');
    console.log(`   Node.js: ${environment.nodeVersion}`);
    console.log(`   Platform: ${environment.platform} (${environment.arch})`);
    console.log(`   Memory: ${this.formatBytes(environment.totalMemory)}`);
    console.log(`   CPUs: ${environment.cpuCount}\n`);
    
    // Run performance monitoring
    console.log('1️⃣ Running Performance Monitor...');
    const performanceMonitor = new PerformanceMonitor();
    const performanceMetrics = await performanceMonitor.runAnalysis();
    console.log('✅ Performance monitoring complete\n');
    
    // Run bundle analysis
    console.log('2️⃣ Running Bundle Analyzer...');
    const bundleAnalyzer = new BundleAnalyzer();
    const bundleAnalysis = await bundleAnalyzer.analyzeBundles();
    console.log('✅ Bundle analysis complete\n');
    
    // Run memory profiling
    console.log('3️⃣ Running Memory Tracker...');
    const memoryTracker = new MemoryTracker();
    memoryTracker.startTracking(1000);
    await memoryTracker.simulateSharedModuleUsage();
    await new Promise(resolve => setTimeout(resolve, 3000)); // Let it run for 3 more seconds
    const memoryProfile = memoryTracker.stopTracking();
    console.log('✅ Memory profiling complete\n');
    
    // Run response time analysis
    console.log('4️⃣ Running Response Time Analyzer...');
    const responseTimeAnalyzer = new ResponseTimeAnalyzer();
    const responseTimeBenchmark = await responseTimeAnalyzer.runPerformanceTests();
    console.log('✅ Response time analysis complete\n');
    
    // Generate comprehensive analysis
    console.log('5️⃣ Generating Comprehensive Analysis...');
    const summary = this.generateSummary(
      performanceMetrics,
      bundleAnalysis,
      memoryProfile,
      responseTimeBenchmark
    );
    
    const recommendations = this.generateRecommendations(
      performanceMetrics,
      bundleAnalysis,
      memoryProfile,
      responseTimeBenchmark
    );
    
    const totalTime = performance.now() - startTime;
    console.log(`✅ Baseline establishment completed in ${(totalTime / 1000).toFixed(2)}s\n`);
    
    const baseline: BaselineReport = {
      timestamp: new Date().toISOString(),
      version: this.getProjectVersion(),
      environment,
      performanceMetrics,
      bundleAnalysis,
      memoryProfile,
      responseTimeBenchmark,
      summary,
      recommendations
    };
    
    return baseline;
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Gather environment information
   */
  private gatherEnvironmentInfo() {
    const os = require('os');
    
    return {
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      totalMemory: os.totalmem(),
      cpuCount: os.cpus().length
    };
  }

  /**
   * Get project version from package.json
   */
  private getProjectVersion(): string {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.version || '1.0.0';
    } catch (error) {
      return '1.0.0';
    }
  }

  /**
   * Generate comprehensive summary
   */
  private generateSummary(
    performanceMetrics: PerformanceMetrics,
    bundleAnalysis: Awaited<ReturnType<BundleAnalyzer['analyzeBundles']>>,
    memoryProfile: MemoryProfile,
    responseTimeBenchmark: PerformanceBenchmark
  ) {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const criticalIssues: string[] = [];
    
    // Analyze bundle performance
    const avgBundleSize = bundleAnalysis.summary.averageBundleSize;
    if (avgBundleSize < 1024 * 1024) { // < 1MB
      strengths.push('Bundle sizes are well-optimized');
    } else if (avgBundleSize > 5 * 1024 * 1024) { // > 5MB
      criticalIssues.push('Bundle sizes are too large');
    } else {
      weaknesses.push('Bundle sizes could be optimized');
    }
    
    // Analyze memory performance
    if (memoryProfile.statistics.memoryLeakSuspected) {
      criticalIssues.push('Potential memory leak detected');
    } else if (memoryProfile.statistics.averageHeapUsed < 50 * 1024 * 1024) { // < 50MB
      strengths.push('Memory usage is efficient');
    }
    
    // Analyze response times
    if (responseTimeBenchmark.summary.averageResponseTime < 5) {
      strengths.push('Response times are excellent');
    } else if (responseTimeBenchmark.summary.averageResponseTime > 20) {
      weaknesses.push('Response times need improvement');
    }
    
    // Analyze build performance
    const avgBuildTime = Object.values(performanceMetrics.buildTimes)
      .filter(time => time > 0)
      .reduce((sum, time) => sum + time, 0) / 
      Object.values(performanceMetrics.buildTimes).filter(time => time > 0).length;
    
    if (avgBuildTime < 5000) { // < 5s
      strengths.push('Build times are fast');
    } else if (avgBuildTime > 15000) { // > 15s
      weaknesses.push('Build times are slow');
    }
    
    // Calculate overall score (0-100)
    let score = 100;
    score -= criticalIssues.length * 30;
    score -= weaknesses.length * 10;
    score += strengths.length * 5;
    score = Math.max(0, Math.min(100, score));
    
    // Generate optimization priorities
    const optimizationPriorities = this.generateOptimizationPriorities(
      bundleAnalysis,
      memoryProfile,
      responseTimeBenchmark
    );
    
    return {
      overallScore: score,
      strengths,
      weaknesses,
      criticalIssues,
      optimizationPriorities
    };
  }

  /**
   * Generate optimization priorities
   */
  private generateOptimizationPriorities(
    bundleAnalysis: Awaited<ReturnType<BundleAnalyzer['analyzeBundles']>>,
    memoryProfile: MemoryProfile,
    responseTimeBenchmark: PerformanceBenchmark
  ) {
    const priorities: Array<{
      priority: 'high' | 'medium' | 'low';
      area: string;
      description: string;
      estimatedImpact: string;
    }> = [];
    
    // Bundle size optimization
    if (bundleAnalysis.summary.averageBundleSize > 2 * 1024 * 1024) {
      priorities.push({
        priority: 'high',
        area: 'Bundle Size',
        description: 'Implement code splitting and tree-shaking optimizations',
        estimatedImpact: '20-40% reduction in bundle size'
      });
    }
    
    // Memory optimization
    if (memoryProfile.statistics.memoryLeakSuspected) {
      priorities.push({
        priority: 'high',
        area: 'Memory Management',
        description: 'Investigate and fix potential memory leaks',
        estimatedImpact: 'Prevent memory growth and improve stability'
      });
    }
    
    // Response time optimization
    const slowOperations = responseTimeBenchmark.metrics.filter(m => m.statistics.average > 10);
    if (slowOperations.length > 0) {
      priorities.push({
        priority: 'medium',
        area: 'Response Time',
        description: 'Optimize slow validation and security operations',
        estimatedImpact: '30-50% improvement in response times'
      });
    }
    
    // Shared module optimization
    const totalSharedModuleSize = Object.values(bundleAnalysis.sharedModuleAnalysis)
      .reduce((sum, module) => sum + module.totalSourceSize, 0);
    
    if (totalSharedModuleSize > 1024 * 1024) {
      priorities.push({
        priority: 'medium',
        area: 'Shared Modules',
        description: 'Optimize shared module exports and reduce overhead',
        estimatedImpact: '10-20% reduction in overall bundle size'
      });
    }
    
    return priorities.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    performanceMetrics: PerformanceMetrics,
    bundleAnalysis: Awaited<ReturnType<BundleAnalyzer['analyzeBundles']>>,
    memoryProfile: MemoryProfile,
    responseTimeBenchmark: PerformanceBenchmark
  ) {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];
    
    // Immediate actions (critical issues)
    if (memoryProfile.statistics.memoryLeakSuspected) {
      immediate.push('Investigate memory leak in shared modules');
    }
    
    if (bundleAnalysis.summary.averageBundleSize > 5 * 1024 * 1024) {
      immediate.push('Implement emergency bundle size reduction');
    }
    
    // Short-term improvements (1-2 weeks)
    shortTerm.push('Implement caching for frequently used validation decorators');
    shortTerm.push('Optimize barrel exports in shared modules');
    shortTerm.push('Add lazy loading for heavy security utilities');
    
    if (responseTimeBenchmark.summary.averageResponseTime > 10) {
      shortTerm.push('Optimize slow validation and security operations');
    }
    
    // Long-term optimizations (1-3 months)
    longTerm.push('Implement advanced tree-shaking strategies');
    longTerm.push('Consider micro-frontend architecture for large bundles');
    longTerm.push('Implement performance monitoring in production');
    longTerm.push('Create automated performance regression testing');
    
    return {
      immediate,
      shortTerm,
      longTerm
    };
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
   * Save baseline report
   */
  async saveBaseline(baseline: BaselineReport): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-baseline-${timestamp}.json`;
    const filepath = path.join(this.outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(baseline, null, 2));
    
    console.log(`📊 Performance baseline saved to: ${filepath}`);
    
    // Also save a summary report
    const summaryFilename = `baseline-summary-${timestamp}.md`;
    const summaryFilepath = path.join(this.outputDir, summaryFilename);
    
    const summaryContent = this.generateMarkdownSummary(baseline);
    fs.writeFileSync(summaryFilepath, summaryContent);
    
    console.log(`📋 Baseline summary saved to: ${summaryFilepath}`);
  }

  /**
   * Generate markdown summary
   */
  private generateMarkdownSummary(baseline: BaselineReport): string {
    return `# Performance Baseline Report

**Generated:** ${baseline.timestamp}
**Version:** ${baseline.version}
**Overall Score:** ${baseline.summary.overallScore}/100

## Environment
- **Node.js:** ${baseline.environment.nodeVersion}
- **Platform:** ${baseline.environment.platform} (${baseline.environment.arch})
- **Memory:** ${this.formatBytes(baseline.environment.totalMemory)}
- **CPUs:** ${baseline.environment.cpuCount}

## Summary

### Strengths ✅
${baseline.summary.strengths.map(s => `- ${s}`).join('\n')}

### Weaknesses ⚠️
${baseline.summary.weaknesses.map(w => `- ${w}`).join('\n')}

### Critical Issues ❌
${baseline.summary.criticalIssues.map(i => `- ${i}`).join('\n')}

## Key Metrics

### Bundle Analysis
- **Total Bundle Size:** ${this.formatBytes(baseline.bundleAnalysis.summary.totalBundleSize)}
- **Average Bundle Size:** ${this.formatBytes(baseline.bundleAnalysis.summary.averageBundleSize)}
- **Optimization Potential:** ${this.formatBytes(baseline.bundleAnalysis.summary.optimizationPotential)}

### Memory Performance
- **Average Heap Used:** ${this.formatBytes(baseline.memoryProfile.statistics.averageHeapUsed)}
- **Peak Heap Used:** ${this.formatBytes(baseline.memoryProfile.statistics.peakHeapUsed)}
- **Memory Leak Suspected:** ${baseline.memoryProfile.statistics.memoryLeakSuspected ? 'Yes ⚠️' : 'No ✅'}

### Response Times
- **Average Response Time:** ${baseline.responseTimeBenchmark.summary.averageResponseTime.toFixed(2)}ms
- **Performance Score:** ${baseline.responseTimeBenchmark.summary.performanceScore.toFixed(1)}/100
- **Total Operations:** ${baseline.responseTimeBenchmark.summary.totalOperations}

## Optimization Priorities

${baseline.summary.optimizationPriorities.map(p => 
  `### ${p.priority.toUpperCase()} Priority: ${p.area}
- **Description:** ${p.description}
- **Estimated Impact:** ${p.estimatedImpact}`
).join('\n\n')}

## Recommendations

### Immediate Actions
${baseline.recommendations.immediate.map(r => `- ${r}`).join('\n')}

### Short-term Improvements (1-2 weeks)
${baseline.recommendations.shortTerm.map(r => `- ${r}`).join('\n')}

### Long-term Optimizations (1-3 months)
${baseline.recommendations.longTerm.map(r => `- ${r}`).join('\n')}
`;
  }

  /**
   * Generate comprehensive report
   */
  generateReport(baseline: BaselineReport): void {
    console.log('\n🎯 PERFORMANCE BASELINE REPORT');
    console.log('==============================\n');
    
    console.log(`📊 Overall Performance Score: ${baseline.summary.overallScore}/100\n`);
    
    // Strengths
    if (baseline.summary.strengths.length > 0) {
      console.log('✅ Strengths:');
      baseline.summary.strengths.forEach(strength => {
        console.log(`   • ${strength}`);
      });
      console.log('');
    }
    
    // Weaknesses
    if (baseline.summary.weaknesses.length > 0) {
      console.log('⚠️  Weaknesses:');
      baseline.summary.weaknesses.forEach(weakness => {
        console.log(`   • ${weakness}`);
      });
      console.log('');
    }
    
    // Critical Issues
    if (baseline.summary.criticalIssues.length > 0) {
      console.log('❌ Critical Issues:');
      baseline.summary.criticalIssues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
      console.log('');
    }
    
    // Key Metrics
    console.log('📈 Key Metrics:');
    console.log(`   Bundle Size: ${this.formatBytes(baseline.bundleAnalysis.summary.totalBundleSize)}`);
    console.log(`   Memory Usage: ${this.formatBytes(baseline.memoryProfile.statistics.averageHeapUsed)}`);
    console.log(`   Response Time: ${baseline.responseTimeBenchmark.summary.averageResponseTime.toFixed(2)}ms`);
    console.log('');
    
    // Top Priorities
    console.log('🎯 Top Optimization Priorities:');
    baseline.summary.optimizationPriorities.slice(0, 3).forEach((priority, index) => {
      console.log(`   ${index + 1}. [${priority.priority.toUpperCase()}] ${priority.area}`);
      console.log(`      ${priority.description}`);
      console.log(`      Impact: ${priority.estimatedImpact}`);
    });
    
    console.log('\n✅ Baseline establishment complete!\n');
  }
}

// Main execution
async function main() {
  const establisher = new BaselineEstablisher();
  
  try {
    const baseline = await establisher.establishBaseline();
    await establisher.saveBaseline(baseline);
    establisher.generateReport(baseline);
  } catch (error) {
    console.error('❌ Baseline establishment failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { BaselineEstablisher, BaselineReport };

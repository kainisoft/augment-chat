#!/usr/bin/env ts-node

/**
 * Performance Monitoring Utility
 * 
 * Comprehensive performance analysis tool for shared infrastructure modules.
 * Measures bundle sizes, memory usage, startup times, and runtime performance.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { performance } from 'perf_hooks';

interface BundleAnalysis {
  service: string;
  bundleSize: number;
  bundleSizeFormatted: string;
  sharedModuleDependencies: string[];
  compressionRatio?: number;
}

interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
}

interface PerformanceMetrics {
  timestamp: string;
  bundleAnalysis: BundleAnalysis[];
  memoryBaseline: MemoryMetrics;
  buildTimes: Record<string, number>;
  sharedModuleImpact: {
    validation: {
      bundleSize: number;
      decoratorCount: number;
      usageFrequency: number;
    };
    dtos: {
      bundleSize: number;
      dtoCount: number;
      usageFrequency: number;
    };
    security: {
      bundleSize: number;
      utilityCount: number;
      usageFrequency: number;
    };
    testing: {
      bundleSize: number;
      mockCount: number;
      usageFrequency: number;
    };
  };
}

class PerformanceMonitor {
  private readonly services = [
    'api-gateway',
    'auth-service', 
    'user-service',
    'chat-service',
    'notification-service',
    'logging-service'
  ];

  private readonly sharedModules = [
    '@app/validation',
    '@app/dtos', 
    '@app/security',
    '@app/testing'
  ];

  /**
   * Run comprehensive performance analysis
   */
  async runAnalysis(): Promise<PerformanceMetrics> {
    console.log('🔍 Starting Performance Analysis...\n');

    const startTime = performance.now();
    
    // Ensure all services are built
    await this.ensureBuildsExist();
    
    // Analyze bundle sizes
    const bundleAnalysis = await this.analyzeBundleSizes();
    
    // Get memory baseline
    const memoryBaseline = this.getMemoryMetrics();
    
    // Measure build times
    const buildTimes = await this.measureBuildTimes();
    
    // Analyze shared module impact
    const sharedModuleImpact = await this.analyzeSharedModuleImpact();
    
    const totalTime = performance.now() - startTime;
    
    const metrics: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      bundleAnalysis,
      memoryBaseline,
      buildTimes,
      sharedModuleImpact
    };

    console.log(`✅ Performance analysis completed in ${(totalTime / 1000).toFixed(2)}s\n`);
    
    return metrics;
  }

  /**
   * Ensure all services are built for analysis
   */
  private async ensureBuildsExist(): Promise<void> {
    console.log('📦 Ensuring all services are built...');
    
    try {
      execSync('pnpm build:all', { 
        stdio: 'pipe',
        cwd: process.cwd()
      });
      console.log('✅ All services built successfully\n');
    } catch (error) {
      console.error('❌ Build failed:', error);
      throw error;
    }
  }

  /**
   * Analyze bundle sizes for each service
   */
  private async analyzeBundleSizes(): Promise<BundleAnalysis[]> {
    console.log('📊 Analyzing bundle sizes...');
    
    const analysis: BundleAnalysis[] = [];
    
    for (const service of this.services) {
      const bundlePath = path.join(process.cwd(), 'dist', 'apps', service, 'main.js');
      
      if (fs.existsSync(bundlePath)) {
        const stats = fs.statSync(bundlePath);
        const bundleSize = stats.size;
        
        // Analyze shared module dependencies
        const dependencies = await this.analyzeServiceDependencies(service);
        
        analysis.push({
          service,
          bundleSize,
          bundleSizeFormatted: this.formatBytes(bundleSize),
          sharedModuleDependencies: dependencies,
          compressionRatio: await this.calculateCompressionRatio(bundlePath)
        });
        
        console.log(`  ${service}: ${this.formatBytes(bundleSize)}`);
      } else {
        console.warn(`  ⚠️  Bundle not found for ${service}`);
      }
    }
    
    console.log('');
    return analysis;
  }

  /**
   * Get current memory metrics
   */
  private getMemoryMetrics(): MemoryMetrics {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      arrayBuffers: memUsage.arrayBuffers
    };
  }

  /**
   * Measure build times for each service
   */
  private async measureBuildTimes(): Promise<Record<string, number>> {
    console.log('⏱️  Measuring build times...');
    
    const buildTimes: Record<string, number> = {};
    
    for (const service of this.services) {
      const startTime = performance.now();
      
      try {
        execSync(`pnpm build:${service}`, { 
          stdio: 'pipe',
          cwd: process.cwd()
        });
        
        const buildTime = performance.now() - startTime;
        buildTimes[service] = buildTime;
        
        console.log(`  ${service}: ${(buildTime / 1000).toFixed(2)}s`);
      } catch (error) {
        console.warn(`  ⚠️  Build failed for ${service}`);
        buildTimes[service] = -1;
      }
    }
    
    console.log('');
    return buildTimes;
  }

  /**
   * Analyze shared module dependencies for a service
   */
  private async analyzeServiceDependencies(service: string): Promise<string[]> {
    const dependencies: string[] = [];
    const bundlePath = path.join(process.cwd(), 'dist', 'apps', service, 'main.js');
    
    if (fs.existsSync(bundlePath)) {
      const bundleContent = fs.readFileSync(bundlePath, 'utf8');
      
      for (const module of this.sharedModules) {
        // Check if the module is referenced in the bundle
        if (bundleContent.includes(module.replace('@app/', ''))) {
          dependencies.push(module);
        }
      }
    }
    
    return dependencies;
  }

  /**
   * Calculate compression ratio for a bundle
   */
  private async calculateCompressionRatio(bundlePath: string): Promise<number> {
    try {
      const originalSize = fs.statSync(bundlePath).size;
      
      // Simulate gzip compression
      const gzipCommand = `gzip -c "${bundlePath}" | wc -c`;
      const compressedSize = parseInt(execSync(gzipCommand, { encoding: 'utf8' }).trim());
      
      return originalSize / compressedSize;
    } catch (error) {
      return 1; // No compression
    }
  }

  /**
   * Analyze shared module impact on performance
   */
  private async analyzeSharedModuleImpact() {
    console.log('🔬 Analyzing shared module impact...');
    
    const impact = {
      validation: await this.analyzeValidationModule(),
      dtos: await this.analyzeDtosModule(),
      security: await this.analyzeSecurityModule(),
      testing: await this.analyzeTestingModule()
    };
    
    console.log('');
    return impact;
  }

  /**
   * Analyze validation module performance impact
   */
  private async analyzeValidationModule() {
    const modulePath = path.join(process.cwd(), 'libs', 'validation', 'src');
    const decoratorCount = await this.countDecorators(modulePath);
    const usageFrequency = await this.calculateModuleUsage('@app/validation');
    
    console.log(`  @app/validation: ${decoratorCount} decorators, ${usageFrequency} usages`);
    
    return {
      bundleSize: await this.estimateModuleBundleSize(modulePath),
      decoratorCount,
      usageFrequency
    };
  }

  /**
   * Analyze DTOs module performance impact
   */
  private async analyzeDtosModule() {
    const modulePath = path.join(process.cwd(), 'libs', 'dtos', 'src');
    const dtoCount = await this.countDtos(modulePath);
    const usageFrequency = await this.calculateModuleUsage('@app/dtos');
    
    console.log(`  @app/dtos: ${dtoCount} DTOs, ${usageFrequency} usages`);
    
    return {
      bundleSize: await this.estimateModuleBundleSize(modulePath),
      dtoCount,
      usageFrequency
    };
  }

  /**
   * Analyze security module performance impact
   */
  private async analyzeSecurityModule() {
    const modulePath = path.join(process.cwd(), 'libs', 'security', 'src');
    const utilityCount = await this.countSecurityUtilities(modulePath);
    const usageFrequency = await this.calculateModuleUsage('@app/security');
    
    console.log(`  @app/security: ${utilityCount} utilities, ${usageFrequency} usages`);
    
    return {
      bundleSize: await this.estimateModuleBundleSize(modulePath),
      utilityCount,
      usageFrequency
    };
  }

  /**
   * Analyze testing module performance impact
   */
  private async analyzeTestingModule() {
    const modulePath = path.join(process.cwd(), 'libs', 'testing', 'src');
    const mockCount = await this.countMocks(modulePath);
    const usageFrequency = await this.calculateModuleUsage('@app/testing');
    
    console.log(`  @app/testing: ${mockCount} mocks, ${usageFrequency} usages`);
    
    return {
      bundleSize: await this.estimateModuleBundleSize(modulePath),
      mockCount,
      usageFrequency
    };
  }

  /**
   * Count decorators in validation module
   */
  private async countDecorators(modulePath: string): Promise<number> {
    try {
      const files = this.getAllTsFiles(modulePath);
      let count = 0;
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const decoratorMatches = content.match(/export function Is\w+Field/g);
        if (decoratorMatches) {
          count += decoratorMatches.length;
        }
      }
      
      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Count DTOs in dtos module
   */
  private async countDtos(modulePath: string): Promise<number> {
    try {
      const files = this.getAllTsFiles(modulePath);
      let count = 0;
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const dtoMatches = content.match(/export class \w+Dto/g);
        if (dtoMatches) {
          count += dtoMatches.length;
        }
      }
      
      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Count security utilities
   */
  private async countSecurityUtilities(modulePath: string): Promise<number> {
    try {
      const files = this.getAllTsFiles(modulePath);
      let count = 0;
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        // Count services, guards, and decorators
        const utilityMatches = content.match(/(export class \w+Service|export class \w+Guard|export function \w+)/g);
        if (utilityMatches) {
          count += utilityMatches.length;
        }
      }
      
      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Count mocks in testing module
   */
  private async countMocks(modulePath: string): Promise<number> {
    try {
      const files = this.getAllTsFiles(modulePath);
      let count = 0;
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const mockMatches = content.match(/(createMock\w+|mock\w+)/g);
        if (mockMatches) {
          count += mockMatches.length;
        }
      }
      
      return count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calculate module usage frequency across services
   */
  private async calculateModuleUsage(moduleName: string): Promise<number> {
    let usageCount = 0;
    
    for (const service of this.services) {
      const servicePath = path.join(process.cwd(), 'apps', service, 'src');
      const files = this.getAllTsFiles(servicePath);
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const importMatches = content.match(new RegExp(`from '${moduleName}'`, 'g'));
          if (importMatches) {
            usageCount += importMatches.length;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
    
    return usageCount;
  }

  /**
   * Estimate module bundle size
   */
  private async estimateModuleBundleSize(modulePath: string): Promise<number> {
    try {
      const files = this.getAllTsFiles(modulePath);
      let totalSize = 0;
      
      for (const file of files) {
        const stats = fs.statSync(file);
        totalSize += stats.size;
      }
      
      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get all TypeScript files in a directory recursively
   */
  private getAllTsFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.getAllTsFiles(fullPath));
        } else if (item.endsWith('.ts') && !item.endsWith('.spec.ts') && !item.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files;
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
   * Save metrics to file
   */
  async saveMetrics(metrics: PerformanceMetrics): Promise<void> {
    const outputDir = path.join(process.cwd(), 'performance-reports');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-baseline-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(metrics, null, 2));
    
    console.log(`📊 Performance metrics saved to: ${filepath}`);
  }

  /**
   * Generate performance report
   */
  generateReport(metrics: PerformanceMetrics): void {
    console.log('\n📈 PERFORMANCE ANALYSIS REPORT');
    console.log('================================\n');
    
    // Bundle Analysis Summary
    console.log('📦 Bundle Size Analysis:');
    const totalBundleSize = metrics.bundleAnalysis.reduce((sum, bundle) => sum + bundle.bundleSize, 0);
    console.log(`   Total Bundle Size: ${this.formatBytes(totalBundleSize)}`);
    console.log(`   Average Bundle Size: ${this.formatBytes(totalBundleSize / metrics.bundleAnalysis.length)}`);
    
    metrics.bundleAnalysis.forEach(bundle => {
      console.log(`   ${bundle.service}: ${bundle.bundleSizeFormatted} (${bundle.sharedModuleDependencies.length} shared modules)`);
    });
    
    // Memory Usage
    console.log('\n💾 Memory Usage:');
    console.log(`   Heap Used: ${this.formatBytes(metrics.memoryBaseline.heapUsed)}`);
    console.log(`   Heap Total: ${this.formatBytes(metrics.memoryBaseline.heapTotal)}`);
    console.log(`   RSS: ${this.formatBytes(metrics.memoryBaseline.rss)}`);
    
    // Build Times
    console.log('\n⏱️  Build Performance:');
    const avgBuildTime = Object.values(metrics.buildTimes)
      .filter(time => time > 0)
      .reduce((sum, time) => sum + time, 0) / Object.values(metrics.buildTimes).filter(time => time > 0).length;
    console.log(`   Average Build Time: ${(avgBuildTime / 1000).toFixed(2)}s`);
    
    Object.entries(metrics.buildTimes).forEach(([service, time]) => {
      if (time > 0) {
        console.log(`   ${service}: ${(time / 1000).toFixed(2)}s`);
      }
    });
    
    // Shared Module Impact
    console.log('\n🔬 Shared Module Impact:');
    Object.entries(metrics.sharedModuleImpact).forEach(([module, impact]) => {
      console.log(`   ${module}:`);
      console.log(`     Bundle Size: ${this.formatBytes(impact.bundleSize)}`);
      console.log(`     Usage Frequency: ${impact.usageFrequency} imports`);
    });
    
    console.log('\n✅ Analysis Complete!\n');
  }
}

// Main execution
async function main() {
  const monitor = new PerformanceMonitor();
  
  try {
    const metrics = await monitor.runAnalysis();
    await monitor.saveMetrics(metrics);
    monitor.generateReport(metrics);
  } catch (error) {
    console.error('❌ Performance analysis failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { PerformanceMonitor, PerformanceMetrics };

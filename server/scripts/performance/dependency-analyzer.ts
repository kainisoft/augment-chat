#!/usr/bin/env ts-node

/**
 * Dependency Analyzer
 *
 * Analyzes package dependencies to identify unused, heavy, or optimizable dependencies.
 * Provides recommendations for bundle size optimization.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface DependencyAnalysis {
  name: string;
  version: string;
  size: number;
  sizeFormatted: string;
  usageCount: number;
  usedInServices: string[];
  isHeavy: boolean;
  isUnused: boolean;
  alternatives?: string[];
  optimizationRecommendations: string[];
}

interface DependencyReport {
  timestamp: string;
  totalDependencies: number;
  totalSize: number;
  totalSizeFormatted: string;
  unusedDependencies: DependencyAnalysis[];
  heavyDependencies: DependencyAnalysis[];
  optimizationOpportunities: DependencyAnalysis[];
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  potentialSavings: {
    bundleSize: number;
    bundleSizeFormatted: string;
    percentage: number;
  };
}

class DependencyAnalyzer {
  private readonly services = [
    'api-gateway',
    'auth-service',
    'user-service',
    'chat-service',
    'notification-service',
    'logging-service',
  ];

  private readonly heavyDependencyThreshold = 1024 * 1024; // 1MB
  private readonly packageJsonPath = path.join(process.cwd(), 'package.json');

  /**
   * Run comprehensive dependency analysis
   */
  async analyzeDependencies(): Promise<DependencyReport> {
    console.log('🔍 Starting Dependency Analysis...\n');

    const packageJson = JSON.parse(
      fs.readFileSync(this.packageJsonPath, 'utf8'),
    );
    const dependencies = packageJson.dependencies || {};

    const analyses: DependencyAnalysis[] = [];
    let totalSize = 0;

    for (const [name, version] of Object.entries(dependencies)) {
      const analysis = await this.analyzeDependency(name, version as string);
      analyses.push(analysis);
      totalSize += analysis.size;

      console.log(
        `  ${name}: ${analysis.sizeFormatted} (${analysis.usageCount} usages)`,
      );
    }

    const unusedDependencies = analyses.filter((dep) => dep.isUnused);
    const heavyDependencies = analyses.filter((dep) => dep.isHeavy);
    const optimizationOpportunities = analyses.filter(
      (dep) => dep.optimizationRecommendations.length > 0,
    );

    const recommendations = this.generateRecommendations(
      unusedDependencies,
      heavyDependencies,
      optimizationOpportunities,
    );

    const potentialSavings = this.calculatePotentialSavings(
      unusedDependencies,
      optimizationOpportunities,
      totalSize,
    );

    console.log('\n✅ Dependency analysis complete\n');

    return {
      timestamp: new Date().toISOString(),
      totalDependencies: analyses.length,
      totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
      unusedDependencies,
      heavyDependencies,
      optimizationOpportunities,
      recommendations,
      potentialSavings,
    };
  }

  /**
   * Analyze a specific dependency
   */
  private async analyzeDependency(
    name: string,
    version: string,
  ): Promise<DependencyAnalysis> {
    const size = await this.getDependencySize(name);
    const usageCount = await this.countDependencyUsage(name);
    const usedInServices = await this.findServicesUsingDependency(name);

    const isHeavy = size > this.heavyDependencyThreshold;
    const isUnused = usageCount === 0;

    const alternatives = this.getAlternatives(name);
    const optimizationRecommendations = this.getOptimizationRecommendations(
      name,
      size,
      usageCount,
      isHeavy,
      isUnused,
    );

    return {
      name,
      version,
      size,
      sizeFormatted: this.formatBytes(size),
      usageCount,
      usedInServices,
      isHeavy,
      isUnused,
      alternatives,
      optimizationRecommendations,
    };
  }

  /**
   * Get dependency size (estimated)
   */
  private async getDependencySize(name: string): Promise<number> {
    try {
      // Try to get actual size from node_modules
      const depPath = path.join(process.cwd(), 'node_modules', name);
      if (fs.existsSync(depPath)) {
        return this.getDirectorySize(depPath);
      }

      // Fallback to estimated sizes for common dependencies
      return this.getEstimatedSize(name);
    } catch (error) {
      return this.getEstimatedSize(name);
    }
  }

  /**
   * Get directory size recursively
   */
  private getDirectorySize(dirPath: string): number {
    let totalSize = 0;

    try {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(itemPath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }

    return totalSize;
  }

  /**
   * Get estimated size for common dependencies
   */
  private getEstimatedSize(name: string): number {
    const estimatedSizes: Record<string, number> = {
      // Heavy dependencies
      '@apollo/server': 2 * 1024 * 1024, // 2MB
      'graphql-tools': 1.5 * 1024 * 1024, // 1.5MB
      'ts-morph': 3 * 1024 * 1024, // 3MB
      winston: 500 * 1024, // 500KB
      bcryptjs: 200 * 1024, // 200KB
      'drizzle-orm': 800 * 1024, // 800KB
      kafkajs: 600 * 1024, // 600KB
      ioredis: 400 * 1024, // 400KB

      // Medium dependencies
      '@nestjs/common': 300 * 1024, // 300KB
      '@nestjs/core': 400 * 1024, // 400KB
      '@nestjs/graphql': 200 * 1024, // 200KB
      '@nestjs/swagger': 300 * 1024, // 300KB
      'class-validator': 150 * 1024, // 150KB
      'class-transformer': 100 * 1024, // 100KB
      fastify: 250 * 1024, // 250KB
      graphql: 200 * 1024, // 200KB

      // Light dependencies
      uuid: 20 * 1024, // 20KB
      dotenv: 10 * 1024, // 10KB
      'reflect-metadata': 30 * 1024, // 30KB
      rxjs: 200 * 1024, // 200KB
    };

    return estimatedSizes[name] || 50 * 1024; // Default 50KB
  }

  /**
   * Count dependency usage across all services
   */
  private async countDependencyUsage(name: string): Promise<number> {
    let usageCount = 0;

    // Check all TypeScript files in apps and libs
    const searchDirs = [
      path.join(process.cwd(), 'apps'),
      path.join(process.cwd(), 'libs'),
    ];

    for (const dir of searchDirs) {
      const files = this.getAllTsFiles(dir);

      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');

          // Count import statements
          const importRegex = new RegExp(`from ['"]${name}['"]`, 'g');
          const requireRegex = new RegExp(`require\\(['"]${name}['"]\\)`, 'g');

          const importMatches = content.match(importRegex) || [];
          const requireMatches = content.match(requireRegex) || [];

          usageCount += importMatches.length + requireMatches.length;
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }

    return usageCount;
  }

  /**
   * Find services using a specific dependency
   */
  private async findServicesUsingDependency(name: string): Promise<string[]> {
    const servicesUsing: string[] = [];

    for (const service of this.services) {
      const servicePath = path.join(process.cwd(), 'apps', service, 'src');
      const files = this.getAllTsFiles(servicePath);

      let found = false;
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');

          if (
            content.includes(`from '${name}'`) ||
            content.includes(`from "${name}"`)
          ) {
            found = true;
            break;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }

      if (found) {
        servicesUsing.push(service);
      }
    }

    return servicesUsing;
  }

  /**
   * Get alternative dependencies
   */
  private getAlternatives(name: string): string[] {
    const alternatives: Record<string, string[]> = {
      moment: ['date-fns', 'dayjs'],
      lodash: ['lodash-es', 'ramda'],
      axios: ['node-fetch', 'undici'],
      winston: ['pino', 'bunyan'],
      bcryptjs: ['bcrypt', 'argon2'],
      uuid: ['nanoid', 'crypto.randomUUID'],
      'graphql-tools': ['@graphql-tools/schema', '@graphql-tools/utils'],
    };

    return alternatives[name] || [];
  }

  /**
   * Get optimization recommendations for a dependency
   */
  private getOptimizationRecommendations(
    name: string,
    size: number,
    usageCount: number,
    isHeavy: boolean,
    isUnused: boolean,
  ): string[] {
    const recommendations: string[] = [];

    if (isUnused) {
      recommendations.push('Remove unused dependency');
    }

    if (isHeavy && usageCount > 0) {
      recommendations.push('Consider lighter alternatives');
      recommendations.push('Implement lazy loading');
    }

    // Specific recommendations
    switch (name) {
      case 'ts-morph':
        if (usageCount === 0) {
          recommendations.push(
            'Remove ts-morph if not used for code generation',
          );
        } else {
          recommendations.push(
            'Consider using TypeScript compiler API directly',
          );
        }
        break;

      case '@apollo/server':
        recommendations.push('Consider code splitting for GraphQL server');
        break;

      case 'graphql-tools':
        recommendations.push(
          'Use specific @graphql-tools packages instead of full suite',
        );
        break;

      case 'winston':
        recommendations.push('Consider pino for better performance');
        break;

      case 'bcryptjs':
        recommendations.push('Consider native bcrypt for better performance');
        break;
    }

    return recommendations;
  }

  /**
   * Generate comprehensive recommendations
   */
  private generateRecommendations(
    unusedDependencies: DependencyAnalysis[],
    heavyDependencies: DependencyAnalysis[],
    optimizationOpportunities: DependencyAnalysis[],
  ) {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];

    // Immediate actions
    if (unusedDependencies.length > 0) {
      immediate.push(`Remove ${unusedDependencies.length} unused dependencies`);
      unusedDependencies.forEach((dep) => {
        immediate.push(`Remove unused dependency: ${dep.name}`);
      });
    }

    // Short-term improvements
    const heavyUnused = heavyDependencies.filter((dep) => dep.usageCount === 0);
    if (heavyUnused.length > 0) {
      shortTerm.push('Remove heavy unused dependencies first');
    }

    const heavyUsed = heavyDependencies.filter((dep) => dep.usageCount > 0);
    if (heavyUsed.length > 0) {
      shortTerm.push('Implement lazy loading for heavy dependencies');
      shortTerm.push('Consider lighter alternatives for heavy dependencies');
    }

    // Long-term optimizations
    longTerm.push('Implement dynamic imports for optional features');
    longTerm.push(
      'Consider micro-frontend architecture for large dependencies',
    );
    longTerm.push('Implement dependency monitoring in CI/CD');

    return { immediate, shortTerm, longTerm };
  }

  /**
   * Calculate potential savings
   */
  private calculatePotentialSavings(
    unusedDependencies: DependencyAnalysis[],
    optimizationOpportunities: DependencyAnalysis[],
    totalSize: number,
  ) {
    const unusedSize = unusedDependencies.reduce(
      (sum, dep) => sum + dep.size,
      0,
    );
    const optimizableSize = optimizationOpportunities
      .filter((dep) => !dep.isUnused)
      .reduce((sum, dep) => sum + dep.size * 0.3, 0); // Estimate 30% savings

    const totalSavings = unusedSize + optimizableSize;
    const percentage = totalSize > 0 ? (totalSavings / totalSize) * 100 : 0;

    return {
      bundleSize: totalSavings,
      bundleSizeFormatted: this.formatBytes(totalSavings),
      percentage,
    };
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

        if (stat.isDirectory() && item !== 'node_modules' && item !== 'dist') {
          files.push(...this.getAllTsFiles(fullPath));
        } else if (
          item.endsWith('.ts') &&
          !item.endsWith('.spec.ts') &&
          !item.endsWith('.d.ts')
        ) {
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
   * Generate detailed report
   */
  generateReport(report: DependencyReport): void {
    console.log('\n📦 DEPENDENCY ANALYSIS REPORT');
    console.log('==============================\n');

    // Summary
    console.log('📊 Summary:');
    console.log(`   Total Dependencies: ${report.totalDependencies}`);
    console.log(`   Total Size: ${report.totalSizeFormatted}`);
    console.log(`   Unused Dependencies: ${report.unusedDependencies.length}`);
    console.log(`   Heavy Dependencies: ${report.heavyDependencies.length}`);
    console.log(
      `   Potential Savings: ${report.potentialSavings.bundleSizeFormatted} (${report.potentialSavings.percentage.toFixed(1)}%)`,
    );

    // Unused dependencies
    if (report.unusedDependencies.length > 0) {
      console.log('\n❌ Unused Dependencies:');
      report.unusedDependencies.forEach((dep) => {
        console.log(`   ${dep.name}: ${dep.sizeFormatted}`);
      });
    }

    // Heavy dependencies
    if (report.heavyDependencies.length > 0) {
      console.log('\n⚠️  Heavy Dependencies:');
      report.heavyDependencies.forEach((dep) => {
        console.log(
          `   ${dep.name}: ${dep.sizeFormatted} (${dep.usageCount} usages)`,
        );
        if (dep.alternatives && dep.alternatives.length > 0) {
          console.log(`     Alternatives: ${dep.alternatives.join(', ')}`);
        }
      });
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (report.recommendations.immediate.length > 0) {
      console.log('   Immediate:');
      report.recommendations.immediate.forEach((rec) => {
        console.log(`     • ${rec}`);
      });
    }

    if (report.recommendations.shortTerm.length > 0) {
      console.log('   Short-term:');
      report.recommendations.shortTerm.forEach((rec) => {
        console.log(`     • ${rec}`);
      });
    }

    console.log('\n✅ Dependency analysis complete!\n');
  }

  /**
   * Save dependency report
   */
  async saveReport(report: DependencyReport): Promise<void> {
    const outputDir = path.join(process.cwd(), 'performance-reports');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `dependency-analysis-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));

    console.log(`📦 Dependency analysis saved to: ${filepath}`);
  }
}

// Main execution
async function main() {
  const analyzer = new DependencyAnalyzer();

  try {
    const report = await analyzer.analyzeDependencies();
    await analyzer.saveReport(report);
    analyzer.generateReport(report);
  } catch (error) {
    console.error('❌ Dependency analysis failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { DependencyAnalyzer };

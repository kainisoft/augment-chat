#!/usr/bin/env ts-node

/**
 * Bundle Size Analyzer
 * 
 * Detailed analysis of bundle sizes and shared module impact.
 * Provides insights into tree-shaking effectiveness and optimization opportunities.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface BundleDetails {
  service: string;
  mainBundle: {
    size: number;
    sizeFormatted: string;
    gzipSize: number;
    gzipSizeFormatted: string;
    compressionRatio: number;
  };
  sharedModuleBreakdown: {
    [moduleName: string]: {
      estimatedSize: number;
      estimatedSizeFormatted: string;
      importCount: number;
      treeshakingEffective: boolean;
    };
  };
  dependencies: {
    total: number;
    shared: number;
    external: number;
  };
  optimizationOpportunities: string[];
}

interface SharedModuleAnalysis {
  moduleName: string;
  totalSourceSize: number;
  totalSourceSizeFormatted: string;
  usageAcrossServices: {
    [serviceName: string]: {
      importCount: number;
      estimatedBundleImpact: number;
      treeshakingEffectiveness: number;
    };
  };
  mostUsedExports: Array<{
    exportName: string;
    usageCount: number;
    services: string[];
  }>;
  optimizationRecommendations: string[];
}

class BundleAnalyzer {
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
   * Run comprehensive bundle analysis
   */
  async analyzeBundles(): Promise<{
    bundleDetails: BundleDetails[];
    sharedModuleAnalysis: SharedModuleAnalysis[];
    summary: {
      totalBundleSize: number;
      averageBundleSize: number;
      sharedModuleOverhead: number;
      optimizationPotential: number;
    };
  }> {
    console.log('🔍 Starting Bundle Size Analysis...\n');

    const bundleDetails = await this.analyzeBundleDetails();
    const sharedModuleAnalysis = await this.analyzeSharedModules();
    const summary = this.generateSummary(bundleDetails, sharedModuleAnalysis);

    return {
      bundleDetails,
      sharedModuleAnalysis,
      summary
    };
  }

  /**
   * Analyze detailed bundle information for each service
   */
  private async analyzeBundleDetails(): Promise<BundleDetails[]> {
    console.log('📦 Analyzing bundle details...');
    
    const details: BundleDetails[] = [];
    
    for (const service of this.services) {
      const bundlePath = path.join(process.cwd(), 'dist', 'apps', service, 'main.js');
      
      if (!fs.existsSync(bundlePath)) {
        console.warn(`  ⚠️  Bundle not found for ${service}`);
        continue;
      }

      const bundleStats = fs.statSync(bundlePath);
      const bundleSize = bundleStats.size;
      const gzipSize = await this.getGzipSize(bundlePath);
      
      const sharedModuleBreakdown = await this.analyzeSharedModuleUsage(service, bundlePath);
      const dependencies = await this.analyzeDependencies(service);
      const optimizationOpportunities = await this.identifyOptimizationOpportunities(service, bundlePath);

      details.push({
        service,
        mainBundle: {
          size: bundleSize,
          sizeFormatted: this.formatBytes(bundleSize),
          gzipSize,
          gzipSizeFormatted: this.formatBytes(gzipSize),
          compressionRatio: bundleSize / gzipSize
        },
        sharedModuleBreakdown,
        dependencies,
        optimizationOpportunities
      });

      console.log(`  ${service}: ${this.formatBytes(bundleSize)} (${this.formatBytes(gzipSize)} gzipped)`);
    }
    
    console.log('');
    return details;
  }

  /**
   * Get gzipped size of a file
   */
  private async getGzipSize(filePath: string): Promise<number> {
    try {
      const gzipCommand = `gzip -c "${filePath}" | wc -c`;
      const result = execSync(gzipCommand, { encoding: 'utf8' });
      return parseInt(result.trim());
    } catch (error) {
      return 0;
    }
  }

  /**
   * Analyze shared module usage in a specific service bundle
   */
  private async analyzeSharedModuleUsage(service: string, bundlePath: string): Promise<BundleDetails['sharedModuleBreakdown']> {
    const breakdown: BundleDetails['sharedModuleBreakdown'] = {};
    const bundleContent = fs.readFileSync(bundlePath, 'utf8');
    
    for (const module of this.sharedModules) {
      const moduleName = module.replace('@app/', '');
      const importCount = await this.countModuleImports(service, module);
      const estimatedSize = await this.estimateModuleImpact(module, bundleContent);
      const treeshakingEffective = await this.assessTreeshaking(module, service);
      
      breakdown[module] = {
        estimatedSize,
        estimatedSizeFormatted: this.formatBytes(estimatedSize),
        importCount,
        treeshakingEffective
      };
    }
    
    return breakdown;
  }

  /**
   * Count imports of a module in a service
   */
  private async countModuleImports(service: string, moduleName: string): Promise<number> {
    const servicePath = path.join(process.cwd(), 'apps', service, 'src');
    const files = this.getAllTsFiles(servicePath);
    let importCount = 0;
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const imports = content.match(new RegExp(`from '${moduleName}'`, 'g'));
        if (imports) {
          importCount += imports.length;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    return importCount;
  }

  /**
   * Estimate the bundle impact of a shared module
   */
  private async estimateModuleImpact(moduleName: string, bundleContent: string): Promise<number> {
    const moduleDir = path.join(process.cwd(), 'libs', moduleName.replace('@app/', ''), 'src');
    
    if (!fs.existsSync(moduleDir)) {
      return 0;
    }
    
    const moduleFiles = this.getAllTsFiles(moduleDir);
    let totalSize = 0;
    
    for (const file of moduleFiles) {
      const stats = fs.statSync(file);
      totalSize += stats.size;
    }
    
    // Estimate actual bundle impact (typically 60-80% of source size after compilation)
    const estimatedImpact = Math.round(totalSize * 0.7);
    
    return estimatedImpact;
  }

  /**
   * Assess tree-shaking effectiveness for a module
   */
  private async assessTreeshaking(moduleName: string, service: string): Promise<boolean> {
    const servicePath = path.join(process.cwd(), 'apps', service, 'src');
    const files = this.getAllTsFiles(servicePath);
    
    let totalExports = 0;
    let usedExports = 0;
    
    // Count total exports from the module
    const moduleDir = path.join(process.cwd(), 'libs', moduleName.replace('@app/', ''), 'src');
    const moduleFiles = this.getAllTsFiles(moduleDir);
    
    for (const file of moduleFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const exports = content.match(/export\s+(class|function|const|interface|type)\s+\w+/g);
        if (exports) {
          totalExports += exports.length;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    // Count used exports in the service
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const importMatch = content.match(new RegExp(`import\\s*{([^}]+)}\\s*from\\s*'${moduleName}'`, 'g'));
        if (importMatch) {
          for (const match of importMatch) {
            const imports = match.match(/{([^}]+)}/);
            if (imports) {
              const importList = imports[1].split(',').map(imp => imp.trim());
              usedExports += importList.length;
            }
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    // Tree-shaking is effective if less than 50% of exports are used
    return totalExports > 0 && (usedExports / totalExports) < 0.5;
  }

  /**
   * Analyze dependencies for a service
   */
  private async analyzeDependencies(service: string): Promise<BundleDetails['dependencies']> {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const totalDeps = Object.keys(packageJson.dependencies || {}).length;
    const sharedDeps = this.sharedModules.length;
    const externalDeps = totalDeps - sharedDeps;
    
    return {
      total: totalDeps,
      shared: sharedDeps,
      external: externalDeps
    };
  }

  /**
   * Identify optimization opportunities for a service
   */
  private async identifyOptimizationOpportunities(service: string, bundlePath: string): Promise<string[]> {
    const opportunities: string[] = [];
    const bundleContent = fs.readFileSync(bundlePath, 'utf8');
    
    // Check for large dependencies
    if (bundleContent.includes('lodash')) {
      opportunities.push('Consider using lodash-es or individual lodash functions for better tree-shaking');
    }
    
    // Check for moment.js
    if (bundleContent.includes('moment')) {
      opportunities.push('Consider replacing moment.js with date-fns or dayjs for smaller bundle size');
    }
    
    // Check for unused shared modules
    for (const module of this.sharedModules) {
      const importCount = await this.countModuleImports(service, module);
      if (importCount === 0) {
        opportunities.push(`Remove unused shared module: ${module}`);
      }
    }
    
    // Check bundle size
    const bundleSize = fs.statSync(bundlePath).size;
    if (bundleSize > 1024 * 1024) { // > 1MB
      opportunities.push('Bundle size is large - consider code splitting or lazy loading');
    }
    
    return opportunities;
  }

  /**
   * Analyze shared modules in detail
   */
  private async analyzeSharedModules(): Promise<SharedModuleAnalysis[]> {
    console.log('🔬 Analyzing shared modules...');
    
    const analysis: SharedModuleAnalysis[] = [];
    
    for (const module of this.sharedModules) {
      const moduleAnalysis = await this.analyzeSharedModule(module);
      analysis.push(moduleAnalysis);
      
      console.log(`  ${module}: ${moduleAnalysis.totalSourceSizeFormatted}`);
    }
    
    console.log('');
    return analysis;
  }

  /**
   * Analyze a specific shared module
   */
  private async analyzeSharedModule(moduleName: string): Promise<SharedModuleAnalysis> {
    const moduleDir = path.join(process.cwd(), 'libs', moduleName.replace('@app/', ''), 'src');
    const moduleFiles = this.getAllTsFiles(moduleDir);
    
    let totalSourceSize = 0;
    for (const file of moduleFiles) {
      const stats = fs.statSync(file);
      totalSourceSize += stats.size;
    }
    
    const usageAcrossServices: SharedModuleAnalysis['usageAcrossServices'] = {};
    
    for (const service of this.services) {
      const importCount = await this.countModuleImports(service, moduleName);
      const estimatedBundleImpact = await this.estimateModuleImpact(moduleName, '');
      const treeshakingEffectiveness = await this.assessTreeshaking(moduleName, service) ? 0.8 : 0.3;
      
      usageAcrossServices[service] = {
        importCount,
        estimatedBundleImpact,
        treeshakingEffectiveness
      };
    }
    
    const mostUsedExports = await this.findMostUsedExports(moduleName);
    const optimizationRecommendations = await this.generateModuleOptimizationRecommendations(moduleName);
    
    return {
      moduleName,
      totalSourceSize,
      totalSourceSizeFormatted: this.formatBytes(totalSourceSize),
      usageAcrossServices,
      mostUsedExports,
      optimizationRecommendations
    };
  }

  /**
   * Find most used exports from a module
   */
  private async findMostUsedExports(moduleName: string): Promise<SharedModuleAnalysis['mostUsedExports']> {
    const exportUsage: { [exportName: string]: { count: number; services: string[] } } = {};
    
    for (const service of this.services) {
      const servicePath = path.join(process.cwd(), 'apps', service, 'src');
      const files = this.getAllTsFiles(servicePath);
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const importMatches = content.match(new RegExp(`import\\s*{([^}]+)}\\s*from\\s*'${moduleName}'`, 'g'));
          
          if (importMatches) {
            for (const match of importMatches) {
              const imports = match.match(/{([^}]+)}/);
              if (imports) {
                const importList = imports[1].split(',').map(imp => imp.trim());
                for (const importName of importList) {
                  if (!exportUsage[importName]) {
                    exportUsage[importName] = { count: 0, services: [] };
                  }
                  exportUsage[importName].count++;
                  if (!exportUsage[importName].services.includes(service)) {
                    exportUsage[importName].services.push(service);
                  }
                }
              }
            }
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
    
    return Object.entries(exportUsage)
      .map(([exportName, usage]) => ({
        exportName,
        usageCount: usage.count,
        services: usage.services
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10); // Top 10 most used exports
  }

  /**
   * Generate optimization recommendations for a module
   */
  private async generateModuleOptimizationRecommendations(moduleName: string): Promise<string[]> {
    const recommendations: string[] = [];
    const moduleDir = path.join(process.cwd(), 'libs', moduleName.replace('@app/', ''), 'src');
    
    // Check module size
    const moduleFiles = this.getAllTsFiles(moduleDir);
    let totalSize = 0;
    for (const file of moduleFiles) {
      totalSize += fs.statSync(file).size;
    }
    
    if (totalSize > 50 * 1024) { // > 50KB
      recommendations.push('Consider splitting large module into smaller, more focused modules');
    }
    
    // Check for barrel exports
    const indexPath = path.join(moduleDir, 'index.ts');
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      const exportCount = (indexContent.match(/export \* from/g) || []).length;
      if (exportCount > 10) {
        recommendations.push('Consider selective exports instead of barrel exports for better tree-shaking');
      }
    }
    
    // Check for heavy dependencies
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (moduleName === '@app/validation' && packageJson.dependencies['class-validator']) {
      recommendations.push('Consider lazy loading validation decorators for better performance');
    }
    
    return recommendations;
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(
    bundleDetails: BundleDetails[],
    sharedModuleAnalysis: SharedModuleAnalysis[]
  ) {
    const totalBundleSize = bundleDetails.reduce((sum, bundle) => sum + bundle.mainBundle.size, 0);
    const averageBundleSize = totalBundleSize / bundleDetails.length;
    
    const sharedModuleOverhead = sharedModuleAnalysis.reduce((sum, module) => sum + module.totalSourceSize, 0);
    
    // Estimate optimization potential (typically 10-30% for well-optimized bundles)
    const optimizationPotential = totalBundleSize * 0.15;
    
    return {
      totalBundleSize,
      averageBundleSize,
      sharedModuleOverhead,
      optimizationPotential
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
   * Generate detailed report
   */
  generateReport(analysis: Awaited<ReturnType<BundleAnalyzer['analyzeBundles']>>): void {
    console.log('\n📊 BUNDLE SIZE ANALYSIS REPORT');
    console.log('===============================\n');
    
    // Summary
    console.log('📈 Summary:');
    console.log(`   Total Bundle Size: ${this.formatBytes(analysis.summary.totalBundleSize)}`);
    console.log(`   Average Bundle Size: ${this.formatBytes(analysis.summary.averageBundleSize)}`);
    console.log(`   Shared Module Overhead: ${this.formatBytes(analysis.summary.sharedModuleOverhead)}`);
    console.log(`   Optimization Potential: ${this.formatBytes(analysis.summary.optimizationPotential)}`);
    
    // Bundle Details
    console.log('\n📦 Bundle Details:');
    analysis.bundleDetails.forEach(bundle => {
      console.log(`\n   ${bundle.service}:`);
      console.log(`     Size: ${bundle.mainBundle.sizeFormatted} (${bundle.mainBundle.gzipSizeFormatted} gzipped)`);
      console.log(`     Compression Ratio: ${bundle.mainBundle.compressionRatio.toFixed(2)}x`);
      console.log(`     Dependencies: ${bundle.dependencies.total} total (${bundle.dependencies.shared} shared)`);
      
      if (bundle.optimizationOpportunities.length > 0) {
        console.log(`     Optimization Opportunities:`);
        bundle.optimizationOpportunities.forEach(opp => {
          console.log(`       • ${opp}`);
        });
      }
    });
    
    // Shared Module Analysis
    console.log('\n🔬 Shared Module Analysis:');
    analysis.sharedModuleAnalysis.forEach(module => {
      console.log(`\n   ${module.moduleName}:`);
      console.log(`     Source Size: ${module.totalSourceSizeFormatted}`);
      console.log(`     Most Used Exports:`);
      module.mostUsedExports.slice(0, 5).forEach(exp => {
        console.log(`       • ${exp.exportName}: ${exp.usageCount} uses across ${exp.services.length} services`);
      });
      
      if (module.optimizationRecommendations.length > 0) {
        console.log(`     Recommendations:`);
        module.optimizationRecommendations.forEach(rec => {
          console.log(`       • ${rec}`);
        });
      }
    });
    
    console.log('\n✅ Bundle analysis complete!\n');
  }
}

// Main execution
async function main() {
  const analyzer = new BundleAnalyzer();
  
  try {
    const analysis = await analyzer.analyzeBundles();
    analyzer.generateReport(analysis);
    
    // Save detailed analysis
    const outputDir = path.join(process.cwd(), 'performance-reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `bundle-analysis-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(analysis, null, 2));
    console.log(`📊 Detailed bundle analysis saved to: ${filepath}`);
    
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { BundleAnalyzer };

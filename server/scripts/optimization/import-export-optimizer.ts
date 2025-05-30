#!/usr/bin/env ts-node

/**
 * Import/Export Pattern Optimizer
 *
 * Analyzes and optimizes import/export patterns across shared modules
 * to improve module boundaries and reduce circular dependencies.
 */

import * as fs from 'fs';
import * as path from 'path';

interface ImportAnalysis {
  module: string;
  importedBy: string[];
  exports: string[];
  unusedExports: string[];
  circularDependencies: string[];
  optimizationOpportunities: string[];
}

interface ExportOptimization {
  module: string;
  currentPattern: 'barrel' | 'selective' | 'mixed';
  recommendedPattern: 'barrel' | 'selective' | 'mixed';
  treeshakingEffectiveness: number;
  bundleImpact: number;
  recommendations: string[];
}

interface ImportExportReport {
  timestamp: string;
  modules: ImportAnalysis[];
  optimizations: ExportOptimization[];
  circularDependencies: string[];
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  summary: {
    totalModules: number;
    modulesWithIssues: number;
    circularDependencyCount: number;
    optimizationOpportunities: number;
  };
}

class ImportExportOptimizer {
  private readonly sharedModules = [
    '@app/common',
    '@app/validation',
    '@app/dtos',
    '@app/security',
    '@app/testing',
    '@app/domain',
    '@app/logging',
    '@app/redis',
  ];

  private readonly services = [
    'api-gateway',
    'auth-service',
    'user-service',
    'chat-service',
    'notification-service',
    'logging-service',
  ];

  /**
   * Run comprehensive import/export analysis
   */
  async analyzeImportExportPatterns(): Promise<ImportExportReport> {
    console.log('🔍 Starting Import/Export Pattern Analysis...\n');

    const moduleAnalyses: ImportAnalysis[] = [];
    const exportOptimizations: ExportOptimization[] = [];
    const allCircularDependencies: string[] = [];

    for (const module of this.sharedModules) {
      const analysis = await this.analyzeModule(module);
      const optimization = await this.analyzeExportPattern(module);

      moduleAnalyses.push(analysis);
      exportOptimizations.push(optimization);

      if (analysis.circularDependencies.length > 0) {
        allCircularDependencies.push(...analysis.circularDependencies);
      }

      console.log(
        `  ${module}: ${analysis.optimizationOpportunities.length} optimization opportunities`,
      );
    }

    const recommendations = this.generateRecommendations(
      moduleAnalyses,
      exportOptimizations,
    );
    const summary = this.generateSummary(
      moduleAnalyses,
      exportOptimizations,
      allCircularDependencies,
    );

    console.log('\n✅ Import/Export analysis complete\n');

    return {
      timestamp: new Date().toISOString(),
      modules: moduleAnalyses,
      optimizations: exportOptimizations,
      circularDependencies: allCircularDependencies,
      recommendations,
      summary,
    };
  }

  /**
   * Analyze a specific module's import/export patterns
   */
  private async analyzeModule(moduleName: string): Promise<ImportAnalysis> {
    const moduleDir = this.getModuleDirectory(moduleName);
    const indexPath = path.join(moduleDir, 'index.ts');

    const exports = await this.extractExports(indexPath);
    const importedBy = await this.findImportingServices(moduleName);
    const unusedExports = await this.findUnusedExports(moduleName, exports);
    const circularDependencies =
      await this.detectCircularDependencies(moduleName);
    const optimizationOpportunities = this.generateModuleOptimizations(
      moduleName,
      exports,
      unusedExports,
      importedBy,
    );

    return {
      module: moduleName,
      importedBy,
      exports,
      unusedExports,
      circularDependencies,
      optimizationOpportunities,
    };
  }

  /**
   * Analyze export pattern for a module
   */
  private async analyzeExportPattern(
    moduleName: string,
  ): Promise<ExportOptimization> {
    const moduleDir = this.getModuleDirectory(moduleName);
    const indexPath = path.join(moduleDir, 'index.ts');

    if (!fs.existsSync(indexPath)) {
      return this.createEmptyOptimization(moduleName);
    }

    const content = fs.readFileSync(indexPath, 'utf8');
    const currentPattern = this.detectExportPattern(content);
    const treeshakingEffectiveness =
      await this.calculateTreeshakingEffectiveness(moduleName);
    const bundleImpact = await this.calculateBundleImpact(moduleName);

    const recommendedPattern = this.recommendExportPattern(
      currentPattern,
      treeshakingEffectiveness,
      bundleImpact,
    );

    const recommendations = this.generateExportRecommendations(
      moduleName,
      currentPattern,
      recommendedPattern,
      treeshakingEffectiveness,
    );

    return {
      module: moduleName,
      currentPattern,
      recommendedPattern,
      treeshakingEffectiveness,
      bundleImpact,
      recommendations,
    };
  }

  /**
   * Extract exports from index.ts file
   */
  private async extractExports(indexPath: string): Promise<string[]> {
    if (!fs.existsSync(indexPath)) {
      return [];
    }

    const content = fs.readFileSync(indexPath, 'utf8');
    const exports: string[] = [];

    // Extract named exports
    const namedExportRegex = /export\s*{\s*([^}]+)\s*}/g;
    let match;
    while ((match = namedExportRegex.exec(content)) !== null) {
      const exportList = match[1].split(',').map((exp) => exp.trim());
      exports.push(...exportList);
    }

    // Extract direct exports
    const directExportRegex =
      /export\s+(?:class|function|interface|type|const|enum)\s+(\w+)/g;
    while ((match = directExportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    // Extract barrel exports (export * from)
    const barrelExportRegex = /export\s*\*\s*from\s*['"]([^'"]+)['"]/g;
    while ((match = barrelExportRegex.exec(content)) !== null) {
      exports.push(`* from ${match[1]}`);
    }

    return exports;
  }

  /**
   * Find services that import a specific module
   */
  private async findImportingServices(moduleName: string): Promise<string[]> {
    const importingServices: string[] = [];

    for (const service of this.services) {
      const servicePath = path.join(process.cwd(), 'apps', service, 'src');
      const files = this.getAllTsFiles(servicePath);

      let found = false;
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          if (
            content.includes(`from '${moduleName}'`) ||
            content.includes(`from "${moduleName}"`)
          ) {
            found = true;
            break;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }

      if (found) {
        importingServices.push(service);
      }
    }

    return importingServices;
  }

  /**
   * Find unused exports in a module
   */
  private async findUnusedExports(
    moduleName: string,
    exports: string[],
  ): Promise<string[]> {
    const unusedExports: string[] = [];

    for (const exportName of exports) {
      if (exportName.startsWith('* from')) {
        continue; // Skip barrel exports for this analysis
      }

      let isUsed = false;

      for (const service of this.services) {
        const servicePath = path.join(process.cwd(), 'apps', service, 'src');
        const files = this.getAllTsFiles(servicePath);

        for (const file of files) {
          try {
            const content = fs.readFileSync(file, 'utf8');

            // Check for named imports
            const namedImportRegex = new RegExp(
              `import\\s*{[^}]*\\b${exportName}\\b[^}]*}\\s*from\\s*['"]${moduleName}['"]`,
              'g',
            );

            if (namedImportRegex.test(content)) {
              isUsed = true;
              break;
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }

        if (isUsed) break;
      }

      if (!isUsed) {
        unusedExports.push(exportName);
      }
    }

    return unusedExports;
  }

  /**
   * Detect circular dependencies
   */
  private async detectCircularDependencies(
    moduleName: string,
  ): Promise<string[]> {
    const circularDeps: string[] = [];
    const moduleDir = this.getModuleDirectory(moduleName);

    // Check if this module imports other shared modules
    const files = this.getAllTsFiles(moduleDir);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');

        for (const otherModule of this.sharedModules) {
          if (otherModule === moduleName) continue;

          if (
            content.includes(`from '${otherModule}'`) ||
            content.includes(`from "${otherModule}"`)
          ) {
            // Check if the other module also imports this module
            const otherModuleImportsThis = await this.checkModuleImportsModule(
              otherModule,
              moduleName,
            );

            if (otherModuleImportsThis) {
              circularDeps.push(`${moduleName} <-> ${otherModule}`);
            }
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return circularDeps;
  }

  /**
   * Check if moduleA imports moduleB
   */
  private async checkModuleImportsModule(
    moduleA: string,
    moduleB: string,
  ): Promise<boolean> {
    const moduleDir = this.getModuleDirectory(moduleA);
    const files = this.getAllTsFiles(moduleDir);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (
          content.includes(`from '${moduleB}'`) ||
          content.includes(`from "${moduleB}"`)
        ) {
          return true;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return false;
  }

  /**
   * Detect export pattern in index.ts
   */
  private detectExportPattern(
    content: string,
  ): 'barrel' | 'selective' | 'mixed' {
    const barrelExports = (content.match(/export\s*\*\s*from/g) || []).length;
    const selectiveExports = (content.match(/export\s*{[^}]+}/g) || []).length;
    const directExports = (
      content.match(/export\s+(?:class|function|interface|type|const|enum)/g) ||
      []
    ).length;

    const totalSelective = selectiveExports + directExports;

    if (barrelExports > 0 && totalSelective > 0) {
      return 'mixed';
    } else if (barrelExports > 0) {
      return 'barrel';
    } else {
      return 'selective';
    }
  }

  /**
   * Calculate tree-shaking effectiveness
   */
  private async calculateTreeshakingEffectiveness(
    moduleName: string,
  ): Promise<number> {
    const exports = await this.extractExports(
      path.join(this.getModuleDirectory(moduleName), 'index.ts'),
    );
    const unusedExports = await this.findUnusedExports(moduleName, exports);

    if (exports.length === 0) return 100;

    const usedExports = exports.length - unusedExports.length;
    return (usedExports / exports.length) * 100;
  }

  /**
   * Calculate bundle impact
   */
  private async calculateBundleImpact(moduleName: string): Promise<number> {
    const moduleDir = this.getModuleDirectory(moduleName);

    try {
      const files = this.getAllTsFiles(moduleDir);
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
   * Recommend export pattern
   */
  private recommendExportPattern(
    currentPattern: 'barrel' | 'selective' | 'mixed',
    treeshakingEffectiveness: number,
    bundleImpact: number,
  ): 'barrel' | 'selective' | 'mixed' {
    // If tree-shaking effectiveness is low, recommend selective exports
    if (treeshakingEffectiveness < 50) {
      return 'selective';
    }

    // If bundle impact is high, recommend selective exports
    if (bundleImpact > 100 * 1024) {
      // 100KB
      return 'selective';
    }

    // For small modules with high tree-shaking effectiveness, barrel exports are fine
    if (bundleImpact < 10 * 1024 && treeshakingEffectiveness > 80) {
      return 'barrel';
    }

    // Default to selective for better optimization
    return 'selective';
  }

  /**
   * Generate module-specific optimization opportunities
   */
  private generateModuleOptimizations(
    moduleName: string,
    exports: string[],
    unusedExports: string[],
    importedBy: string[],
  ): string[] {
    const opportunities: string[] = [];

    if (unusedExports.length > 0) {
      opportunities.push(`Remove ${unusedExports.length} unused exports`);
    }

    if (importedBy.length === 0) {
      opportunities.push(
        'Module is not imported by any service - consider removal',
      );
    }

    if (exports.length > 20) {
      opportunities.push('Large number of exports - consider module splitting');
    }

    if (exports.some((exp) => exp.startsWith('* from'))) {
      opportunities.push(
        'Consider replacing barrel exports with selective exports',
      );
    }

    return opportunities;
  }

  /**
   * Generate export recommendations
   */
  private generateExportRecommendations(
    moduleName: string,
    currentPattern: string,
    recommendedPattern: string,
    treeshakingEffectiveness: number,
  ): string[] {
    const recommendations: string[] = [];

    if (currentPattern !== recommendedPattern) {
      recommendations.push(
        `Switch from ${currentPattern} to ${recommendedPattern} exports`,
      );
    }

    if (treeshakingEffectiveness < 50) {
      recommendations.push('Improve tree-shaking by using selective exports');
    }

    if (moduleName === '@app/testing' && treeshakingEffectiveness < 90) {
      recommendations.push(
        'Testing module should be fully tree-shakable in production',
      );
    }

    return recommendations;
  }

  /**
   * Generate comprehensive recommendations
   */
  private generateRecommendations(
    modules: ImportAnalysis[],
    optimizations: ExportOptimization[],
  ) {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];

    // Immediate actions
    const modulesWithUnusedExports = modules.filter(
      (m) => m.unusedExports.length > 0,
    );
    if (modulesWithUnusedExports.length > 0) {
      immediate.push('Remove unused exports from shared modules');
      modulesWithUnusedExports.forEach((m) => {
        immediate.push(
          `${m.module}: Remove ${m.unusedExports.length} unused exports`,
        );
      });
    }

    // Short-term improvements
    const lowTreeshakingModules = optimizations.filter(
      (o) => o.treeshakingEffectiveness < 70,
    );
    if (lowTreeshakingModules.length > 0) {
      shortTerm.push(
        'Improve tree-shaking effectiveness for low-performing modules',
      );
      shortTerm.push('Switch to selective exports for better optimization');
    }

    // Long-term optimizations
    longTerm.push('Implement automated import/export analysis in CI/CD');
    longTerm.push('Consider micro-module architecture for large modules');
    longTerm.push('Implement dynamic imports for optional features');

    return { immediate, shortTerm, longTerm };
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(
    modules: ImportAnalysis[],
    optimizations: ExportOptimization[],
    circularDependencies: string[],
  ) {
    const totalModules = modules.length;
    const modulesWithIssues = modules.filter(
      (m) =>
        m.unusedExports.length > 0 || m.optimizationOpportunities.length > 0,
    ).length;
    const circularDependencyCount = circularDependencies.length;
    const optimizationOpportunities = modules.reduce(
      (sum, m) => sum + m.optimizationOpportunities.length,
      0,
    );

    return {
      totalModules,
      modulesWithIssues,
      circularDependencyCount,
      optimizationOpportunities,
    };
  }

  /**
   * Get module directory path
   */
  private getModuleDirectory(moduleName: string): string {
    const moduleDir = moduleName.replace('@app/', '');
    return path.join(process.cwd(), 'libs', moduleDir, 'src');
  }

  /**
   * Create empty optimization for missing modules
   */
  private createEmptyOptimization(moduleName: string): ExportOptimization {
    return {
      module: moduleName,
      currentPattern: 'selective',
      recommendedPattern: 'selective',
      treeshakingEffectiveness: 100,
      bundleImpact: 0,
      recommendations: ['Module index.ts not found'],
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
   * Generate detailed report
   */
  generateReport(report: ImportExportReport): void {
    console.log('\n📦 IMPORT/EXPORT OPTIMIZATION REPORT');
    console.log('====================================\n');

    // Summary
    console.log('📊 Summary:');
    console.log(`   Total Modules: ${report.summary.totalModules}`);
    console.log(`   Modules with Issues: ${report.summary.modulesWithIssues}`);
    console.log(
      `   Circular Dependencies: ${report.summary.circularDependencyCount}`,
    );
    console.log(
      `   Optimization Opportunities: ${report.summary.optimizationOpportunities}`,
    );

    // Module analysis
    console.log('\n📦 Module Analysis:');
    report.modules.forEach((module) => {
      console.log(`\n   ${module.module}:`);
      console.log(`     Imported by: ${module.importedBy.length} services`);
      console.log(`     Total exports: ${module.exports.length}`);
      console.log(`     Unused exports: ${module.unusedExports.length}`);

      if (module.optimizationOpportunities.length > 0) {
        console.log(`     Opportunities:`);
        module.optimizationOpportunities.forEach((opp) => {
          console.log(`       • ${opp}`);
        });
      }
    });

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (report.recommendations.immediate.length > 0) {
      console.log('   Immediate:');
      report.recommendations.immediate.forEach((rec) => {
        console.log(`     • ${rec}`);
      });
    }

    console.log('\n✅ Import/Export analysis complete!\n');
  }

  /**
   * Save import/export report
   */
  async saveReport(report: ImportExportReport): Promise<void> {
    const outputDir = path.join(process.cwd(), 'performance-reports');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `import-export-analysis-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));

    console.log(`📦 Import/Export analysis saved to: ${filepath}`);
  }
}

// Main execution
async function main() {
  const optimizer = new ImportExportOptimizer();

  try {
    const report = await optimizer.analyzeImportExportPatterns();
    await optimizer.saveReport(report);
    optimizer.generateReport(report);
  } catch (error) {
    console.error('❌ Import/Export analysis failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { ImportExportOptimizer };

#!/usr/bin/env ts-node

/**
 * Tree-Shaking Optimizer
 *
 * Analyzes and optimizes tree-shaking effectiveness across shared modules.
 * Identifies unused exports and provides recommendations for better tree-shaking.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

interface ExportAnalysis {
  name: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'const' | 'enum';
  isUsed: boolean;
  usageCount: number;
  usedInServices: string[];
  size: number;
  sizeFormatted: string;
}

interface ModuleAnalysis {
  moduleName: string;
  totalExports: number;
  usedExports: number;
  unusedExports: number;
  treeshakingEffectiveness: number;
  exports: ExportAnalysis[];
  recommendations: string[];
  potentialSavings: {
    size: number;
    sizeFormatted: string;
    percentage: number;
  };
}

interface TreeShakingReport {
  timestamp: string;
  modules: ModuleAnalysis[];
  summary: {
    totalExports: number;
    totalUsedExports: number;
    totalUnusedExports: number;
    overallEffectiveness: number;
    totalPotentialSavings: number;
    totalPotentialSavingsFormatted: string;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

class TreeShakingOptimizer {
  private readonly sharedModules = [
    '@app/validation',
    '@app/dtos',
    '@app/security',
    '@app/testing',
    '@app/common',
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
   * Run comprehensive tree-shaking analysis
   */
  async analyzeTreeShaking(): Promise<TreeShakingReport> {
    console.log('🌳 Starting Tree-Shaking Analysis...\n');

    const moduleAnalyses: ModuleAnalysis[] = [];

    for (const module of this.sharedModules) {
      const analysis = await this.analyzeModule(module);
      moduleAnalyses.push(analysis);

      console.log(
        `  ${module}: ${analysis.treeshakingEffectiveness.toFixed(1)}% effective`,
      );
    }

    const summary = this.generateSummary(moduleAnalyses);
    const recommendations = this.generateRecommendations(moduleAnalyses);

    console.log('\n✅ Tree-shaking analysis complete\n');

    return {
      timestamp: new Date().toISOString(),
      modules: moduleAnalyses,
      summary,
      recommendations,
    };
  }

  /**
   * Analyze a specific module
   */
  private async analyzeModule(moduleName: string): Promise<ModuleAnalysis> {
    const moduleDir = path.join(
      process.cwd(),
      'libs',
      moduleName.replace('@app/', ''),
      'src',
    );
    const indexPath = path.join(moduleDir, 'index.ts');

    if (!fs.existsSync(indexPath)) {
      return this.createEmptyAnalysis(moduleName);
    }

    const exports = await this.extractExports(indexPath);
    const analyzedExports: ExportAnalysis[] = [];

    for (const exportInfo of exports) {
      const usageAnalysis = await this.analyzeExportUsage(
        moduleName,
        exportInfo.name,
      );
      const size = await this.estimateExportSize(
        moduleDir,
        exportInfo.name,
        exportInfo.type,
      );

      analyzedExports.push({
        name: exportInfo.name,
        type: exportInfo.type,
        isUsed: usageAnalysis.usageCount > 0,
        usageCount: usageAnalysis.usageCount,
        usedInServices: usageAnalysis.usedInServices,
        size,
        sizeFormatted: this.formatBytes(size),
      });
    }

    const totalExports = analyzedExports.length;
    const usedExports = analyzedExports.filter((exp) => exp.isUsed).length;
    const unusedExports = totalExports - usedExports;
    const treeshakingEffectiveness =
      totalExports > 0 ? (usedExports / totalExports) * 100 : 100;

    const unusedSize = analyzedExports
      .filter((exp) => !exp.isUsed)
      .reduce((sum, exp) => sum + exp.size, 0);

    const totalSize = analyzedExports.reduce((sum, exp) => sum + exp.size, 0);
    const savingsPercentage =
      totalSize > 0 ? (unusedSize / totalSize) * 100 : 0;

    const recommendations = this.generateModuleRecommendations(
      moduleName,
      analyzedExports,
      treeshakingEffectiveness,
    );

    return {
      moduleName,
      totalExports,
      usedExports,
      unusedExports,
      treeshakingEffectiveness,
      exports: analyzedExports,
      recommendations,
      potentialSavings: {
        size: unusedSize,
        sizeFormatted: this.formatBytes(unusedSize),
        percentage: savingsPercentage,
      },
    };
  }

  /**
   * Extract exports from index.ts file
   */
  private async extractExports(filePath: string): Promise<
    Array<{
      name: string;
      type: 'function' | 'class' | 'interface' | 'type' | 'const' | 'enum';
    }>
  > {
    const content = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
    );

    const exports: Array<{ name: string; type: any }> = [];

    const visit = (node: ts.Node) => {
      if (
        ts.isExportDeclaration(node) &&
        node.exportClause &&
        ts.isNamedExports(node.exportClause)
      ) {
        // Handle named exports: export { A, B, C }
        node.exportClause.elements.forEach((element) => {
          exports.push({
            name: element.name.text,
            type: 'const', // Default type, will be refined later
          });
        });
      } else if (ts.isExportAssignment(node)) {
        // Handle export = or export default
        exports.push({
          name: 'default',
          type: 'const',
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    // Also parse export statements from content using regex as fallback
    const exportRegex =
      /export\s+(?:(?:async\s+)?function\s+(\w+)|class\s+(\w+)|interface\s+(\w+)|type\s+(\w+)|const\s+(\w+)|enum\s+(\w+))/g;
    let match;

    while ((match = exportRegex.exec(content)) !== null) {
      const name =
        match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
      const type = match[1]
        ? 'function'
        : match[2]
          ? 'class'
          : match[3]
            ? 'interface'
            : match[4]
              ? 'type'
              : match[5]
                ? 'const'
                : 'enum';

      if (!exports.find((exp) => exp.name === name)) {
        exports.push({ name, type });
      }
    }

    return exports;
  }

  /**
   * Analyze export usage across services
   */
  private async analyzeExportUsage(
    moduleName: string,
    exportName: string,
  ): Promise<{
    usageCount: number;
    usedInServices: string[];
  }> {
    let usageCount = 0;
    const usedInServices: string[] = [];

    for (const service of this.services) {
      const servicePath = path.join(process.cwd(), 'apps', service, 'src');
      const files = this.getAllTsFiles(servicePath);

      let serviceUsesExport = false;

      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');

          // Check for named imports
          const namedImportRegex = new RegExp(
            `import\\s*{[^}]*\\b${exportName}\\b[^}]*}\\s*from\\s*['"]${moduleName}['"]`,
            'g',
          );

          // Check for usage in code
          const usageRegex = new RegExp(`\\b${exportName}\\b`, 'g');

          const namedImports = content.match(namedImportRegex) || [];
          const usages = content.match(usageRegex) || [];

          if (namedImports.length > 0) {
            usageCount += namedImports.length;
            serviceUsesExport = true;
          }

          // Count actual usages (excluding import statements)
          const importLines = content
            .split('\n')
            .filter(
              (line) => line.includes('import') && line.includes(moduleName),
            );
          const nonImportUsages = usages.length - importLines.length;

          if (nonImportUsages > 0) {
            usageCount += nonImportUsages;
            serviceUsesExport = true;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }

      if (serviceUsesExport) {
        usedInServices.push(service);
      }
    }

    return { usageCount, usedInServices };
  }

  /**
   * Estimate export size
   */
  private async estimateExportSize(
    moduleDir: string,
    exportName: string,
    type: string,
  ): Promise<number> {
    // Base sizes by type
    const baseSizes = {
      function: 1024, // 1KB
      class: 2048, // 2KB
      interface: 100, // 100B
      type: 50, // 50B
      const: 200, // 200B
      enum: 300, // 300B
    };

    let baseSize = baseSizes[type as keyof typeof baseSizes] || 500;

    // Try to find the actual implementation and estimate size
    const files = this.getAllTsFiles(moduleDir);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Look for the export definition
        const exportRegex = new RegExp(
          `export\\s+(?:(?:async\\s+)?function\\s+${exportName}|class\\s+${exportName}|interface\\s+${exportName}|type\\s+${exportName}|const\\s+${exportName}|enum\\s+${exportName})`,
          'g',
        );

        if (exportRegex.test(content)) {
          // Rough estimation based on content length
          const lines = content.split('\n');
          const relevantLines = lines.filter(
            (line) =>
              line.includes(exportName) && !line.trim().startsWith('//'),
          );

          baseSize += relevantLines.length * 50; // 50 bytes per line estimate
          break;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return baseSize;
  }

  /**
   * Generate module-specific recommendations
   */
  private generateModuleRecommendations(
    moduleName: string,
    exports: ExportAnalysis[],
    effectiveness: number,
  ): string[] {
    const recommendations: string[] = [];

    const unusedExports = exports.filter((exp) => !exp.isUsed);
    const heavyUnusedExports = unusedExports.filter((exp) => exp.size > 1024);

    if (unusedExports.length > 0) {
      recommendations.push(`Remove ${unusedExports.length} unused exports`);
    }

    if (heavyUnusedExports.length > 0) {
      recommendations.push(
        `Priority: Remove heavy unused exports (${heavyUnusedExports.map((e) => e.name).join(', ')})`,
      );
    }

    if (effectiveness < 50) {
      recommendations.push(
        'Low tree-shaking effectiveness - consider module restructuring',
      );
    }

    const lowUsageExports = exports.filter(
      (exp) => exp.isUsed && exp.usageCount === 1,
    );
    if (lowUsageExports.length > 3) {
      recommendations.push('Consider consolidating low-usage exports');
    }

    // Module-specific recommendations
    switch (moduleName) {
      case '@app/testing':
        if (exports.some((exp) => !exp.isUsed)) {
          recommendations.push(
            'Testing utilities should be fully tree-shakable in production',
          );
        }
        break;
      case '@app/validation':
        recommendations.push('Consider lazy loading validation decorators');
        break;
      case '@app/security':
        recommendations.push(
          'Implement dynamic imports for heavy crypto operations',
        );
        break;
    }

    return recommendations;
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(modules: ModuleAnalysis[]) {
    const totalExports = modules.reduce(
      (sum, mod) => sum + mod.totalExports,
      0,
    );
    const totalUsedExports = modules.reduce(
      (sum, mod) => sum + mod.usedExports,
      0,
    );
    const totalUnusedExports = modules.reduce(
      (sum, mod) => sum + mod.unusedExports,
      0,
    );
    const overallEffectiveness =
      totalExports > 0 ? (totalUsedExports / totalExports) * 100 : 100;
    const totalPotentialSavings = modules.reduce(
      (sum, mod) => sum + mod.potentialSavings.size,
      0,
    );

    return {
      totalExports,
      totalUsedExports,
      totalUnusedExports,
      overallEffectiveness,
      totalPotentialSavings,
      totalPotentialSavingsFormatted: this.formatBytes(totalPotentialSavings),
    };
  }

  /**
   * Generate comprehensive recommendations
   */
  private generateRecommendations(modules: ModuleAnalysis[]) {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];

    // Immediate actions
    const modulesWithUnusedExports = modules.filter(
      (mod) => mod.unusedExports > 0,
    );
    if (modulesWithUnusedExports.length > 0) {
      immediate.push('Remove unused exports from shared modules');
      modulesWithUnusedExports.forEach((mod) => {
        immediate.push(
          `${mod.moduleName}: Remove ${mod.unusedExports} unused exports`,
        );
      });
    }

    // Short-term improvements
    const lowEffectivenessModules = modules.filter(
      (mod) => mod.treeshakingEffectiveness < 70,
    );
    if (lowEffectivenessModules.length > 0) {
      shortTerm.push(
        'Improve tree-shaking effectiveness for low-performing modules',
      );
      shortTerm.push('Implement selective exports instead of barrel exports');
    }

    // Long-term optimizations
    longTerm.push('Implement automated tree-shaking analysis in CI/CD');
    longTerm.push('Consider micro-module architecture for better tree-shaking');
    longTerm.push('Implement dynamic imports for optional features');

    return { immediate, shortTerm, longTerm };
  }

  /**
   * Create empty analysis for missing modules
   */
  private createEmptyAnalysis(moduleName: string): ModuleAnalysis {
    return {
      moduleName,
      totalExports: 0,
      usedExports: 0,
      unusedExports: 0,
      treeshakingEffectiveness: 100,
      exports: [],
      recommendations: ['Module index.ts not found'],
      potentialSavings: {
        size: 0,
        sizeFormatted: '0 Bytes',
        percentage: 0,
      },
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
  generateReport(report: TreeShakingReport): void {
    console.log('\n🌳 TREE-SHAKING OPTIMIZATION REPORT');
    console.log('===================================\n');

    // Summary
    console.log('📊 Summary:');
    console.log(`   Total Exports: ${report.summary.totalExports}`);
    console.log(`   Used Exports: ${report.summary.totalUsedExports}`);
    console.log(`   Unused Exports: ${report.summary.totalUnusedExports}`);
    console.log(
      `   Overall Effectiveness: ${report.summary.overallEffectiveness.toFixed(1)}%`,
    );
    console.log(
      `   Potential Savings: ${report.summary.totalPotentialSavingsFormatted}`,
    );

    // Module breakdown
    console.log('\n📦 Module Analysis:');
    report.modules.forEach((module) => {
      console.log(`\n   ${module.moduleName}:`);
      console.log(
        `     Effectiveness: ${module.treeshakingEffectiveness.toFixed(1)}%`,
      );
      console.log(
        `     Exports: ${module.usedExports}/${module.totalExports} used`,
      );
      console.log(
        `     Potential Savings: ${module.potentialSavings.sizeFormatted}`,
      );

      if (module.recommendations.length > 0) {
        console.log(`     Recommendations:`);
        module.recommendations.forEach((rec) => {
          console.log(`       • ${rec}`);
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

    if (report.recommendations.shortTerm.length > 0) {
      console.log('   Short-term:');
      report.recommendations.shortTerm.forEach((rec) => {
        console.log(`     • ${rec}`);
      });
    }

    console.log('\n✅ Tree-shaking analysis complete!\n');
  }

  /**
   * Save tree-shaking report
   */
  async saveReport(report: TreeShakingReport): Promise<void> {
    const outputDir = path.join(process.cwd(), 'performance-reports');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `tree-shaking-analysis-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));

    console.log(`🌳 Tree-shaking analysis saved to: ${filepath}`);
  }
}

// Main execution
async function main() {
  const optimizer = new TreeShakingOptimizer();

  try {
    const report = await optimizer.analyzeTreeShaking();
    await optimizer.saveReport(report);
    optimizer.generateReport(report);
  } catch (error) {
    console.error('❌ Tree-shaking analysis failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { TreeShakingOptimizer };

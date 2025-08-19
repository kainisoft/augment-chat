#!/usr/bin/env node

/**
 * Build Process Validation Tests
 * 
 * Comprehensive tests for the library build process including
 * different configurations, style processing, and output validation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BuildValidationTester {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.distPath = path.join(this.projectRoot, 'dist/shared-lib');
    this.results = {
      buildTests: {},
      styleTests: {},
      bundleTests: {},
      configTests: {},
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        startTime: Date.now()
      }
    };
  }

  async runAllTests() {
    console.log('🧪 Starting comprehensive build validation tests...');
    console.log('='.repeat(60));

    try {
      await this.testBuildConfigurations();
      await this.testStyleProcessing();
      await this.testBundleOutput();
      await this.testConfigurationFiles();
      
      this.generateReport();
      return this.results.summary.failedTests === 0;
    } catch (error) {
      console.error('❌ Build validation failed:', error.message);
      return false;
    }
  }

  async testBuildConfigurations() {
    console.log('\n🔨 Testing build configurations...');
    
    const configurations = [
      { name: 'development', command: 'ng build shared-lib --configuration development' },
      { name: 'production', command: 'ng build shared-lib --configuration production' },
      { name: 'debug', command: 'ng build shared-lib --configuration debug' }
    ];

    for (const config of configurations) {
      const testName = `Build ${config.name} configuration`;
      this.results.summary.totalTests++;
      
      try {
        console.log(`  Testing ${config.name} build...`);
        const startTime = Date.now();
        
        execSync(config.command, {
          cwd: this.projectRoot,
          stdio: 'pipe'
        });
        
        const duration = Date.now() - startTime;
        
        // Verify build output exists
        if (!fs.existsSync(this.distPath)) {
          throw new Error('Build output directory not found');
        }
        
        this.results.buildTests[testName] = {
          success: true,
          duration,
          configuration: config.name
        };
        
        this.results.summary.passedTests++;
        console.log(`    ✅ ${config.name} build completed in ${duration}ms`);
        
      } catch (error) {
        this.results.buildTests[testName] = {
          success: false,
          error: error.message,
          configuration: config.name
        };
        
        this.results.summary.failedTests++;
        console.log(`    ❌ ${config.name} build failed: ${error.message}`);
      }
    }
  }

  async testStyleProcessing() {
    console.log('\n🎨 Testing style processing...');
    
    const styleTests = [
      {
        name: 'SCSS compilation',
        test: () => this.testScssCompilation()
      },
      {
        name: 'CSS custom properties',
        test: () => this.testCssCustomProperties()
      },
      {
        name: 'Animation keyframes',
        test: () => this.testAnimationKeyframes()
      },
      {
        name: 'Tailwind integration',
        test: () => this.testTailwindIntegration()
      },
      {
        name: 'PostCSS processing',
        test: () => this.testPostCssProcessing()
      }
    ];

    for (const styleTest of styleTests) {
      this.results.summary.totalTests++;
      
      try {
        console.log(`  Testing ${styleTest.name}...`);
        const result = await styleTest.test();
        
        this.results.styleTests[styleTest.name] = {
          success: true,
          result
        };
        
        this.results.summary.passedTests++;
        console.log(`    ✅ ${styleTest.name} passed`);
        
      } catch (error) {
        this.results.styleTests[styleTest.name] = {
          success: false,
          error: error.message
        };
        
        this.results.summary.failedTests++;
        console.log(`    ❌ ${styleTest.name} failed: ${error.message}`);
      }
    }
  }

  async testBundleOutput() {
    console.log('\n📦 Testing bundle output...');
    
    const bundleTests = [
      {
        name: 'Bundle structure',
        test: () => this.testBundleStructure()
      },
      {
        name: 'Bundle size',
        test: () => this.testBundleSize()
      },
      {
        name: 'Export completeness',
        test: () => this.testExportCompleteness()
      },
      {
        name: 'TypeScript definitions',
        test: () => this.testTypeScriptDefinitions()
      },
      {
        name: 'Package metadata',
        test: () => this.testPackageMetadata()
      }
    ];

    for (const bundleTest of bundleTests) {
      this.results.summary.totalTests++;
      
      try {
        console.log(`  Testing ${bundleTest.name}...`);
        const result = await bundleTest.test();
        
        this.results.bundleTests[bundleTest.name] = {
          success: true,
          result
        };
        
        this.results.summary.passedTests++;
        console.log(`    ✅ ${bundleTest.name} passed`);
        
      } catch (error) {
        this.results.bundleTests[bundleTest.name] = {
          success: false,
          error: error.message
        };
        
        this.results.summary.failedTests++;
        console.log(`    ❌ ${bundleTest.name} failed: ${error.message}`);
      }
    }
  }

  async testConfigurationFiles() {
    console.log('\n⚙️  Testing configuration files...');
    
    const configFiles = [
      {
        name: 'ng-package.json',
        path: 'projects/shared-lib/ng-package.json',
        validator: (content) => {
          const config = JSON.parse(content);
          return config.lib && config.lib.entryFile;
        }
      },
      {
        name: 'tsconfig.lib.json',
        path: 'projects/shared-lib/tsconfig.lib.json',
        validator: (content) => {
          // Remove comments for JSON parsing (JSONC support)
          const cleanContent = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
          try {
            const config = JSON.parse(cleanContent);
            return config.compilerOptions && (config.include || config.files);
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'tailwind.lib.config.js',
        path: 'projects/shared-lib/tailwind.lib.config.js',
        validator: (content) => {
          return content.includes('module.exports') && content.includes('content');
        }
      },
      {
        name: 'postcss.config.js',
        path: 'projects/shared-lib/postcss.config.js',
        validator: (content) => {
          return content.includes('tailwindcss') && content.includes('autoprefixer');
        }
      }
    ];

    for (const configFile of configFiles) {
      this.results.summary.totalTests++;
      
      try {
        console.log(`  Testing ${configFile.name}...`);
        
        const filePath = path.join(this.projectRoot, configFile.path);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Configuration file not found: ${configFile.path}`);
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const isValid = configFile.validator(content);
        
        if (!isValid) {
          throw new Error(`Configuration file validation failed: ${configFile.name}`);
        }
        
        this.results.configTests[configFile.name] = {
          success: true,
          path: configFile.path,
          size: content.length
        };
        
        this.results.summary.passedTests++;
        console.log(`    ✅ ${configFile.name} is valid`);
        
      } catch (error) {
        this.results.configTests[configFile.name] = {
          success: false,
          error: error.message,
          path: configFile.path
        };
        
        this.results.summary.failedTests++;
        console.log(`    ❌ ${configFile.name} failed: ${error.message}`);
      }
    }
  }

  testScssCompilation() {
    const bundlePath = path.join(this.distPath, 'fesm2022/shared-lib.mjs');
    if (!fs.existsSync(bundlePath)) {
      throw new Error('Bundle file not found');
    }
    
    const bundleContent = fs.readFileSync(bundlePath, 'utf8');
    
    // Should contain compiled CSS, not raw SCSS
    if (bundleContent.includes('$variable') || bundleContent.includes('@mixin')) {
      throw new Error('Bundle contains uncompiled SCSS');
    }
    
    // Should contain CSS for loading component
    if (!bundleContent.includes('loading')) {
      throw new Error('Loading component styles not found in bundle');
    }
    
    return { compiled: true, hasStyles: true };
  }

  testCssCustomProperties() {
    const bundlePath = path.join(this.distPath, 'fesm2022/shared-lib.mjs');
    const bundleContent = fs.readFileSync(bundlePath, 'utf8');
    
    const customProperties = [
      '--loading-primary-color',
      '--loading-secondary-color',
      '--loading-text-color'
    ];
    
    const foundProperties = customProperties.filter(prop => 
      bundleContent.includes(prop)
    );
    
    if (foundProperties.length !== customProperties.length) {
      throw new Error(`Missing custom properties: ${customProperties.filter(p => !foundProperties.includes(p)).join(', ')}`);
    }
    
    return { foundProperties };
  }

  testAnimationKeyframes() {
    const bundlePath = path.join(this.distPath, 'fesm2022/shared-lib.mjs');
    const bundleContent = fs.readFileSync(bundlePath, 'utf8');
    
    const animations = ['lib-spin', 'lib-pulse', 'lib-bounce'];
    const foundAnimations = animations.filter(anim => 
      bundleContent.includes(anim)
    );
    
    if (foundAnimations.length !== animations.length) {
      throw new Error(`Missing animations: ${animations.filter(a => !foundAnimations.includes(a)).join(', ')}`);
    }
    
    return { foundAnimations };
  }

  testTailwindIntegration() {
    const bundlePath = path.join(this.distPath, 'fesm2022/shared-lib.mjs');
    const bundleContent = fs.readFileSync(bundlePath, 'utf8');
    
    // Should include fallback classes
    const fallbackClasses = ['lib-flex', 'lib-items-center', 'lib-justify-center'];
    const foundClasses = fallbackClasses.filter(cls => 
      bundleContent.includes(cls)
    );
    
    if (foundClasses.length === 0) {
      throw new Error('No Tailwind fallback classes found in bundle');
    }
    
    return { foundClasses };
  }

  testPostCssProcessing() {
    // Check if PostCSS configuration is working
    const configPath = path.join(this.projectRoot, 'projects/shared-lib/postcss.config.js');
    if (!fs.existsSync(configPath)) {
      throw new Error('PostCSS configuration not found');
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    if (!configContent.includes('tailwindcss') || !configContent.includes('autoprefixer')) {
      throw new Error('PostCSS configuration incomplete');
    }
    
    return { configured: true };
  }

  testBundleStructure() {
    const requiredFiles = [
      'fesm2022/shared-lib.mjs',
      'index.d.ts',
      'package.json'
    ];
    
    const missingFiles = requiredFiles.filter(file => 
      !fs.existsSync(path.join(this.distPath, file))
    );
    
    if (missingFiles.length > 0) {
      throw new Error(`Missing bundle files: ${missingFiles.join(', ')}`);
    }
    
    return { requiredFiles, allPresent: true };
  }

  testBundleSize() {
    const bundlePath = path.join(this.distPath, 'fesm2022/shared-lib.mjs');
    const stats = fs.statSync(bundlePath);
    const sizeKB = Math.round(stats.size / 1024);
    
    // Bundle should be reasonable size (less than 500KB)
    if (sizeKB > 500) {
      throw new Error(`Bundle too large: ${sizeKB}KB (max 500KB)`);
    }
    
    // Bundle should not be empty
    if (sizeKB < 10) {
      throw new Error(`Bundle too small: ${sizeKB}KB (min 10KB)`);
    }
    
    return { sizeKB, withinLimits: true };
  }

  testExportCompleteness() {
    const bundlePath = path.join(this.distPath, 'fesm2022/shared-lib.mjs');
    const bundleContent = fs.readFileSync(bundlePath, 'utf8');
    
    const requiredExports = [
      'StyleFallbackService',
      'StyleFallbackDirective',
      'LoadingComponent',
      'detectTailwindLoading',
      'detectStyleCapabilities'
    ];
    
    const missingExports = requiredExports.filter(exp => 
      !bundleContent.includes(exp)
    );
    
    if (missingExports.length > 0) {
      throw new Error(`Missing exports: ${missingExports.join(', ')}`);
    }
    
    return { requiredExports, allPresent: true };
  }

  testTypeScriptDefinitions() {
    const dtsPath = path.join(this.distPath, 'index.d.ts');
    const dtsContent = fs.readFileSync(dtsPath, 'utf8');
    
    const requiredTypes = [
      'StyleFallbackService',
      'StyleDetectionResult',
      'StyleFallbackConfig'
    ];
    
    const missingTypes = requiredTypes.filter(type => 
      !dtsContent.includes(type)
    );
    
    if (missingTypes.length > 0) {
      throw new Error(`Missing type definitions: ${missingTypes.join(', ')}`);
    }
    
    return { requiredTypes, allPresent: true };
  }

  testPackageMetadata() {
    const packagePath = path.join(this.distPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Essential fields for a library package
    const requiredFields = ['name', 'version', 'typings'];
    const missingFields = requiredFields.filter(field => 
      !packageJson[field]
    );
    
    // Should have either main or module field (or both)
    if (!packageJson.main && !packageJson.module) {
      missingFields.push('main or module');
    }
    
    // Should have exports for modern package resolution
    if (!packageJson.exports) {
      console.warn('⚠️  Package missing exports field (recommended for modern packages)');
    }
    
    if (missingFields.length > 0) {
      throw new Error(`Missing package.json fields: ${missingFields.join(', ')}`);
    }
    
    return { 
      packageJson, 
      allFieldsPresent: true,
      hasModule: !!packageJson.module,
      hasExports: !!packageJson.exports
    };
  }

  generateReport() {
    this.results.summary.endTime = Date.now();
    this.results.summary.duration = this.results.summary.endTime - this.results.summary.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 BUILD VALIDATION REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n⏱️  Total Duration: ${Math.round(this.results.summary.duration / 1000)}s`);
    console.log(`📈 Total Tests: ${this.results.summary.totalTests}`);
    console.log(`✅ Passed: ${this.results.summary.passedTests}`);
    console.log(`❌ Failed: ${this.results.summary.failedTests}`);
    
    const successRate = ((this.results.summary.passedTests / this.results.summary.totalTests) * 100).toFixed(1);
    console.log(`📊 Success Rate: ${successRate}%`);
    
    // Save detailed report
    const reportsDir = path.join(this.projectRoot, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, `build-validation-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    const allPassed = this.results.summary.failedTests === 0;
    console.log(`\n${allPassed ? '🎉' : '💥'} Build validation ${allPassed ? 'completed successfully' : 'failed'}!`);
    
    return allPassed;
  }
}

async function main() {
  const tester = new BuildValidationTester();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Build validation error:', error);
    process.exit(1);
  });
}

module.exports = BuildValidationTester;
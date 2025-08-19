#!/usr/bin/env node

/**
 * Library Build Configuration Script
 * 
 * Handles different build configurations for the shared library,
 * including Tailwind CSS processing and style optimization.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LIBRARY_ROOT = path.join(__dirname, '../projects/shared-lib');
const DIST_PATH = path.join(__dirname, '../dist/shared-lib');

// Build configuration options
const BUILD_CONFIGS = {
  development: {
    description: 'Development build with source maps',
    command: 'ng build shared-lib --configuration development',
    env: {
      NODE_ENV: 'development'
    }
  },
  production: {
    description: 'Production build optimized for size',
    command: 'ng build shared-lib --configuration production',
    env: {
      NODE_ENV: 'production'
    }
  },
  tailwind: {
    description: 'Build with Tailwind CSS processing',
    command: 'ng build shared-lib --configuration development',
    env: {
      NODE_ENV: 'development',
      TAILWIND_CONFIG: 'projects/shared-lib/tailwind.lib.config.js'
    }
  },
  'tailwind-purge': {
    description: 'Production build with Tailwind CSS purging',
    command: 'ng build shared-lib --configuration production',
    env: {
      NODE_ENV: 'production',
      TAILWIND_CONFIG: 'projects/shared-lib/tailwind.purge.config.js',
      TAILWIND_MODE: 'purge'
    }
  },
  analyze: {
    description: 'Build with bundle analysis',
    command: 'ng build shared-lib --configuration production --stats-json',
    env: {
      NODE_ENV: 'production'
    },
    postBuild: () => {
      console.log('📊 Opening bundle analyzer...');
      execSync('npx webpack-bundle-analyzer dist/shared-lib/stats.json', { stdio: 'inherit' });
    }
  },
  validate: {
    description: 'Build and validate library output',
    command: 'ng build shared-lib --configuration production',
    env: {
      NODE_ENV: 'production'
    },
    postBuild: () => {
      console.log('🔍 Validating library build...');
      execSync('node scripts/validate-library-build.js', { stdio: 'inherit' });
      execSync('node scripts/test-style-fallbacks.js', { stdio: 'inherit' });
    }
  }
};

function getBuildConfig(configName) {
  const config = BUILD_CONFIGS[configName];
  if (!config) {
    console.error(`❌ Unknown build configuration: ${configName}`);
    console.log('Available configurations:');
    Object.keys(BUILD_CONFIGS).forEach(name => {
      console.log(`  - ${name}: ${BUILD_CONFIGS[name].description}`);
    });
    process.exit(1);
  }
  return config;
}

function cleanDistDirectory() {
  if (fs.existsSync(DIST_PATH)) {
    console.log('🧹 Cleaning dist directory...');
    fs.rmSync(DIST_PATH, { recursive: true, force: true });
  }
}

function validateLibraryStructure() {
  const requiredFiles = [
    'projects/shared-lib/ng-package.json',
    'projects/shared-lib/tsconfig.lib.json',
    'projects/shared-lib/tsconfig.lib.prod.json',
    'projects/shared-lib/postcss.config.js',
    'projects/shared-lib/tailwind.lib.config.js',
    'projects/shared-lib/tailwind.purge.config.js'
  ];

  const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(__dirname, '..', file)));
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing required library files:');
    missingFiles.forEach(file => console.error(`  - ${file}`));
    process.exit(1);
  }
}

function setEnvironmentVariables(env) {
  Object.entries(env).forEach(([key, value]) => {
    process.env[key] = value;
    console.log(`🔧 Set ${key}=${value}`);
  });
}

function executeBuild(config) {
  console.log(`🚀 Starting ${config.description}...`);
  
  try {
    const startTime = Date.now();
    execSync(config.command, { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Build completed in ${duration}s`);
    
    // Run post-build actions if defined
    if (config.postBuild) {
      config.postBuild();
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Build failed: ${error.message}`);
    return false;
  }
}

function generateBuildReport(configName, success, startTime) {
  const report = {
    timestamp: new Date().toISOString(),
    configuration: configName,
    success,
    duration: Date.now() - startTime,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };
  
  if (success && fs.existsSync(DIST_PATH)) {
    // Get build output information
    const stats = fs.statSync(DIST_PATH);
    report.output = {
      path: DIST_PATH,
      size: getDirectorySize(DIST_PATH),
      files: getFileList(DIST_PATH)
    };
  }
  
  const reportsDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportPath = path.join(reportsDir, `build-report-${configName}-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📄 Build report saved to: ${reportPath}`);
  return report;
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(currentPath) {
    const stats = fs.statSync(currentPath);
    
    if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach(file => {
        calculateSize(path.join(currentPath, file));
      });
    } else {
      totalSize += stats.size;
    }
  }
  
  if (fs.existsSync(dirPath)) {
    calculateSize(dirPath);
  }
  
  return totalSize;
}

function getFileList(dirPath) {
  const files = [];
  
  function collectFiles(currentPath, relativePath = '') {
    if (!fs.existsSync(currentPath)) return;
    
    const items = fs.readdirSync(currentPath);
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const relPath = path.join(relativePath, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        collectFiles(fullPath, relPath);
      } else {
        files.push({
          path: relPath,
          size: stats.size,
          extension: path.extname(item)
        });
      }
    });
  }
  
  collectFiles(dirPath);
  return files;
}

function main() {
  const configName = process.argv[2] || 'production';
  const shouldClean = process.argv.includes('--clean');
  const shouldValidate = process.argv.includes('--validate');
  
  console.log(`🔨 Building shared library with configuration: ${configName}`);
  
  // Validate library structure
  validateLibraryStructure();
  
  // Clean if requested
  if (shouldClean) {
    cleanDistDirectory();
  }
  
  // Get build configuration
  const config = getBuildConfig(configName);
  
  // Set environment variables
  if (config.env) {
    setEnvironmentVariables(config.env);
  }
  
  // Execute build
  const startTime = Date.now();
  const success = executeBuild(config);
  
  // Generate report
  const report = generateBuildReport(configName, success, startTime);
  
  // Additional validation if requested
  if (shouldValidate && success) {
    console.log('🔍 Running additional validation...');
    try {
      execSync('node scripts/validate-library-build.js', { stdio: 'inherit' });
      execSync('node scripts/test-style-fallbacks.js', { stdio: 'inherit' });
      console.log('✅ Validation completed successfully');
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  }
  
  // Summary
  console.log(`\n${success ? '🎉' : '💥'} Build ${success ? 'completed successfully' : 'failed'}!`);
  
  if (success && report.output) {
    const sizeKB = (report.output.size / 1024).toFixed(2);
    console.log(`📦 Bundle size: ${sizeKB} KB`);
    console.log(`📁 Output files: ${report.output.files.length}`);
  }
  
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  BUILD_CONFIGS,
  getBuildConfig,
  executeBuild,
  generateBuildReport
};
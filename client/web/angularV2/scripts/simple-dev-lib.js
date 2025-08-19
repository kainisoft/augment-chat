#!/usr/bin/env node

/**
 * Simple Development Script for Library
 */

const { execSync } = require('child_process');

const command = process.argv[2] || 'build';

console.log(`🔨 Running library ${command}...`);

try {
  switch (command) {
    case 'build':
      console.log('Building library...');
      execSync('ng build shared-lib --configuration development', { stdio: 'inherit' });
      console.log('Running validation...');
      execSync('node scripts/test-style-fallbacks.js', { stdio: 'inherit' });
      console.log('✅ Build and validation completed');
      break;
      
    case 'validate':
      console.log('Running validation only...');
      execSync('node scripts/test-style-fallbacks.js', { stdio: 'inherit' });
      console.log('✅ Validation completed');
      break;
      
    default:
      console.log('Available commands: build, validate');
      break;
  }
} catch (error) {
  console.error('❌ Command failed:', error.message);
  process.exit(1);
}
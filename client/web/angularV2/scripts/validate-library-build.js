#!/usr/bin/env node

/**
 * Validation script for library build process
 * Checks if Tailwind directives are processed correctly in the library build
 */

const fs = require('fs');
const path = require('path');

const LIBRARY_BUNDLE_PATH = path.join(__dirname, '../dist/shared-lib/fesm2022/shared-lib.mjs');

function validateLibraryBuild() {
  console.log('🔍 Validating library build...');
  
  if (!fs.existsSync(LIBRARY_BUNDLE_PATH)) {
    console.error('❌ Library bundle not found. Please run "ng build shared-lib" first.');
    process.exit(1);
  }
  
  const bundleContent = fs.readFileSync(LIBRARY_BUNDLE_PATH, 'utf8');
  
  // Check if CSS animations are included
  const hasLoadingSpin = bundleContent.includes('loading-spin');
  const hasLoadingPulse = bundleContent.includes('loading-pulse');
  const hasLoadingBounce = bundleContent.includes('loading-bounce');
  
  // Check if CSS custom properties are included
  const hasCustomProperties = bundleContent.includes('--loading-primary-color');
  
  // Check if keyframes are included
  const hasKeyframes = bundleContent.includes('@keyframes');
  
  console.log('📊 Validation Results:');
  console.log(`   ✅ Loading spin animation: ${hasLoadingSpin ? 'Found' : 'Missing'}`);
  console.log(`   ✅ Loading pulse animation: ${hasLoadingPulse ? 'Found' : 'Missing'}`);
  console.log(`   ✅ Loading bounce animation: ${hasLoadingBounce ? 'Found' : 'Missing'}`);
  console.log(`   ✅ CSS custom properties: ${hasCustomProperties ? 'Found' : 'Missing'}`);
  console.log(`   ✅ CSS keyframes: ${hasKeyframes ? 'Found' : 'Missing'}`);
  
  const allChecksPass = hasLoadingSpin && hasLoadingPulse && hasLoadingBounce && hasCustomProperties && hasKeyframes;
  
  if (allChecksPass) {
    console.log('✅ All validation checks passed! Library build is working correctly.');
    return true;
  } else {
    console.log('❌ Some validation checks failed. Please check the library build configuration.');
    return false;
  }
}

if (require.main === module) {
  const success = validateLibraryBuild();
  process.exit(success ? 0 : 1);
}

module.exports = { validateLibraryBuild };
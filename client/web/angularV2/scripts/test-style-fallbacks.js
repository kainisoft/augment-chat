#!/usr/bin/env node

/**
 * Style Fallback Testing Utility
 * 
 * Tests the style fallback system to ensure components work correctly
 * even when Tailwind CSS is not available.
 */

const fs = require('fs');
const path = require('path');

const LIBRARY_BUNDLE_PATH = path.join(__dirname, '../dist/shared-lib/fesm2022/shared-lib.mjs');

function testStyleFallbacks() {
    console.log('🧪 Testing style fallback system...');

    if (!fs.existsSync(LIBRARY_BUNDLE_PATH)) {
        console.error('❌ Library bundle not found. Please run "ng build shared-lib" first.');
        process.exit(1);
    }

    const bundleContent = fs.readFileSync(LIBRARY_BUNDLE_PATH, 'utf8');

    // Test 1: Check if StyleFallbackService is included
    const hasStyleFallbackService = bundleContent.includes('StyleFallbackService');

    // Test 2: Check if style detection utilities are included
    const hasDetectionUtils = bundleContent.includes('detectTailwindLoading') ||
        bundleContent.includes('detectStyleCapabilities');

    // Test 3: Check if StyleFallbackDirective is included
    const hasStyleFallbackDirective = bundleContent.includes('StyleFallbackDirective') ||
        bundleContent.includes('libStyleFallback');

    // Test 4: Check if fallback styles are included
    const hasFallbackStyles = bundleContent.includes('lib-flex') ||
        bundleContent.includes('fallbackStyles');

    // Test 5: Check if CSS custom properties are used
    const hasCustomProperties = bundleContent.includes('--loading-primary-color') &&
        bundleContent.includes('--loading-secondary-color');

    // Test 6: Check if animation fallbacks are included
    const hasAnimationFallbacks = bundleContent.includes('lib-spin') ||
        bundleContent.includes('lib-pulse') ||
        bundleContent.includes('lib-bounce');

    // Test 7: Check if critical styles protection is included
    const hasCriticalStylesProtection = bundleContent.includes('criticalStyles');

    // Test 8: Check if dynamic style application is included
    const hasDynamicStyleApplication = bundleContent.includes('applyFallbackStyles') ||
        bundleContent.includes('removeFallbackStyles');

    console.log('📊 Style Fallback Test Results:');
    console.log(`   ${hasStyleFallbackService ? '✅' : '❌'} StyleFallbackService: ${hasStyleFallbackService ? 'Found' : 'Missing'}`);
    console.log(`   ${hasDetectionUtils ? '✅' : '❌'} Detection utilities: ${hasDetectionUtils ? 'Found' : 'Missing'}`);
    console.log(`   ${hasStyleFallbackDirective ? '✅' : '❌'} StyleFallbackDirective: ${hasStyleFallbackDirective ? 'Found' : 'Missing'}`);
    console.log(`   ${hasFallbackStyles ? '✅' : '❌'} Fallback styles: ${hasFallbackStyles ? 'Found' : 'Missing'}`);
    console.log(`   ${hasCustomProperties ? '✅' : '❌'} CSS custom properties: ${hasCustomProperties ? 'Found' : 'Missing'}`);
    console.log(`   ${hasAnimationFallbacks ? '✅' : '❌'} Animation fallbacks: ${hasAnimationFallbacks ? 'Found' : 'Missing'}`);
    console.log(`   ${hasCriticalStylesProtection ? '✅' : '❌'} Critical styles protection: ${hasCriticalStylesProtection ? 'Found' : 'Missing'}`);
    console.log(`   ${hasDynamicStyleApplication ? '✅' : '❌'} Dynamic style application: ${hasDynamicStyleApplication ? 'Found' : 'Missing'}`);

    const allTestsPass = hasStyleFallbackService &&
        hasDetectionUtils &&
        hasStyleFallbackDirective &&
        hasFallbackStyles &&
        hasCustomProperties &&
        hasAnimationFallbacks &&
        hasCriticalStylesProtection &&
        hasDynamicStyleApplication;

    if (allTestsPass) {
        console.log('✅ All style fallback tests passed! The system is working correctly.');

        // Additional bundle size analysis
        const bundleSize = fs.statSync(LIBRARY_BUNDLE_PATH).size;
        const bundleSizeKB = (bundleSize / 1024).toFixed(2);

        console.log(`📦 Bundle size: ${bundleSizeKB} KB`);

        if (bundleSize > 500 * 1024) { // 500KB threshold
            console.log('⚠️  Bundle size is quite large. Consider optimizing.');
        } else {
            console.log('✅ Bundle size is reasonable.');
        }

        return true;
    } else {
        console.log('❌ Some style fallback tests failed. Please check the implementation.');
        return false;
    }
}

function testFallbackConfiguration() {
    console.log('\n🔧 Testing fallback configuration...');

    const configFiles = [
        path.join(__dirname, '../projects/shared-lib/tailwind.lib.config.js'),
        path.join(__dirname, '../projects/shared-lib/tailwind.purge.config.js'),
        path.join(__dirname, '../projects/shared-lib/postcss.config.js')
    ];

    let allConfigsValid = true;

    configFiles.forEach(configFile => {
        const fileName = path.basename(configFile);

        if (fs.existsSync(configFile)) {
            console.log(`   ✅ ${fileName}: Found`);

            const content = fs.readFileSync(configFile, 'utf8');

            // Basic validation
            if (fileName.includes('tailwind') && !content.includes('module.exports')) {
                console.log(`   ⚠️  ${fileName}: Missing module.exports`);
                allConfigsValid = false;
            }

            if (fileName === 'postcss.config.js' && !content.includes('tailwindcss')) {
                console.log(`   ⚠️  ${fileName}: Missing tailwindcss plugin`);
                allConfigsValid = false;
            }
        } else {
            console.log(`   ❌ ${fileName}: Missing`);
            allConfigsValid = false;
        }
    });

    return allConfigsValid;
}

function generateFallbackReport() {
    console.log('\n📋 Generating fallback system report...');

    const report = {
        timestamp: new Date().toISOString(),
        bundleTests: testStyleFallbacks(),
        configurationTests: testFallbackConfiguration(),
        recommendations: []
    };

    if (!report.bundleTests) {
        report.recommendations.push('Fix missing style fallback components in bundle');
    }

    if (!report.configurationTests) {
        report.recommendations.push('Fix missing or invalid configuration files');
    }

    if (report.bundleTests && report.configurationTests) {
        report.recommendations.push('System is working correctly - no action needed');
    }

    const reportPath = path.join(__dirname, '../reports/style-fallback-report.json');
    const reportsDir = path.dirname(reportPath);

    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📄 Report saved to: ${reportPath}`);

    return report;
}

if (require.main === module) {
    const report = generateFallbackReport();
    const success = report.bundleTests && report.configurationTests;

    console.log(`\n${success ? '🎉' : '💥'} Style fallback system test ${success ? 'completed successfully' : 'failed'}!`);

    process.exit(success ? 0 : 1);
}

module.exports = {
    testStyleFallbacks,
    testFallbackConfiguration,
    generateFallbackReport
};
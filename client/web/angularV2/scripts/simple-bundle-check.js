#!/usr/bin/env node

/**
 * Simple Library Bundle Size Check
 */

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist/shared-lib');

console.log('📊 Library Bundle Size Analysis');
console.log('='.repeat(40));

if (!fs.existsSync(distPath)) {
  console.error('❌ Library dist folder not found:', distPath);
  console.error('Run "ng build shared-lib" first.');
  process.exit(1);
}

let totalSize = 0;
const files = [];

function analyzeDirectory(dirPath, relativePath = '') {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const relPath = path.join(relativePath, item);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      analyzeDirectory(fullPath, relPath);
    } else {
      const sizeKB = Math.round(stats.size / 1024);
      totalSize += stats.size;
      files.push({ path: relPath, sizeKB, extension: path.extname(item) });
    }
  });
}

analyzeDirectory(distPath);

// Group files by type
const filesByType = files.reduce((acc, file) => {
  const type = file.extension || 'other';
  if (!acc[type]) acc[type] = [];
  acc[type].push(file);
  return acc;
}, {});

// Display results
Object.entries(filesByType).forEach(([type, typeFiles]) => {
  console.log(`\n📁 ${type.toUpperCase()} Files:`);
  typeFiles.forEach(file => {
    const status = file.sizeKB > 100 ? '⚠️' : '✅';
    console.log(`  ${status} ${file.path}: ${file.sizeKB}KB`);
  });
});

const totalSizeKB = Math.round(totalSize / 1024);
console.log(`\n📊 Total Library Size: ${totalSizeKB}KB`);

if (totalSizeKB > 500) {
  console.log('⚠️  Library size is quite large. Consider optimization.');
} else {
  console.log('✅ Library size is reasonable.');
}

console.log('\n📈 Optimization Tips:');
console.log('- Use tree-shakable exports');
console.log('- Minimize CSS with Tailwind purging');
console.log('- Consider code splitting for large features');

process.exit(0);
const fs = require('fs');
const path = require('path');

// Bundle size thresholds (in KB)
const THRESHOLDS = {
  initial: 1024, // 1MB
  anyComponentStyle: 8, // 8KB
  vendor: 2048, // 2MB
};

function checkBundleSize() {
  const statsPath = path.join(__dirname, '../dist/angular-v2-workspace/stats.json');
  
  if (!fs.existsSync(statsPath)) {
    console.error('❌ Stats file not found. Run "ng build --stats-json" first.');
    process.exit(1);
  }

  const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
  const assets = stats.assets || [];
  
  console.log('📊 Bundle Size Analysis');
  console.log('========================');
  
  let hasWarnings = false;
  let hasErrors = false;
  
  assets.forEach(asset => {
    const sizeKB = Math.round(asset.size / 1024);
    const name = asset.name;
    
    let status = '✅';
    let message = '';
    
    // Check initial bundle
    if (name.includes('main') && sizeKB > THRESHOLDS.initial) {
      status = sizeKB > THRESHOLDS.initial * 1.5 ? '❌' : '⚠️';
      message = `Exceeds threshold (${THRESHOLDS.initial}KB)`;
      if (status === '❌') hasErrors = true;
      else hasWarnings = true;
    }
    
    // Check vendor bundle
    if (name.includes('vendor') && sizeKB > THRESHOLDS.vendor) {
      status = sizeKB > THRESHOLDS.vendor * 1.5 ? '❌' : '⚠️';
      message = `Exceeds threshold (${THRESHOLDS.vendor}KB)`;
      if (status === '❌') hasErrors = true;
      else hasWarnings = true;
    }
    
    console.log(`${status} ${name}: ${sizeKB}KB ${message}`);
  });
  
  console.log('\n📈 Performance Recommendations:');
  console.log('- Use lazy loading for feature modules');
  console.log('- Implement tree-shaking for unused code');
  console.log('- Consider code splitting for large dependencies');
  console.log('- Use Angular\'s built-in optimization features');
  
  if (hasErrors) {
    console.log('\n❌ Bundle size check failed!');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️ Bundle size warnings detected.');
    process.exit(0);
  } else {
    console.log('\n✅ All bundle sizes are within acceptable limits.');
    process.exit(0);
  }
}

checkBundleSize();
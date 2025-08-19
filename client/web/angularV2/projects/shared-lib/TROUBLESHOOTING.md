# Troubleshooting Guide

This guide helps you diagnose and fix common issues with the style integration system.

## Common Issues

### 1. Styles Not Applied

**Symptoms:**
- Components appear unstyled
- Fallback styles not working
- Tailwind classes not applied

**Diagnosis:**

```typescript
import { StyleFallbackService } from 'shared-lib';

@Component({...})
export class DiagnosticComponent {
  constructor(private styleFallbackService: StyleFallbackService) {
    // Check service state
    console.log('Service ready:', this.styleFallbackService.isReady());
    console.log('Styles loaded:', this.styleFallbackService.isStylesLoaded());
    console.log('Needs fallback:', this.styleFallbackService.needsFallback());
    
    // Get detection result
    const result = this.styleFallbackService.getDetectionResult();
    console.log('Detection result:', result);
    
    // Get configuration
    const config = this.styleFallbackService.config();
    console.log('Configuration:', config);
  }
}
```

**Solutions:**

1. **Force Detection:**
```typescript
this.styleFallbackService.forceDetection();
```

2. **Enable Fallbacks:**
```typescript
this.styleFallbackService.updateConfig({
  enableFallbacks: true
});
```

3. **Check Imports:**
```typescript
// Ensure StyleFallbackDirective is imported
@Component({
  imports: [StyleFallbackDirective],
  // ...
})
```

### 2. Fallback Styles Not Working

**Symptoms:**
- Components break when Tailwind is disabled
- Fallback styles not applied
- Console errors about missing styles

**Diagnosis:**

```typescript
// Check if fallbacks are enabled
const config = this.styleFallbackService.config();
if (!config.enableFallbacks) {
  console.warn('Fallbacks are disabled');
}

// Check if fallback styles are defined
if (Object.keys(config.fallbackStyles).length === 0) {
  console.warn('No fallback styles defined');
}

// Test fallback application
const element = document.querySelector('[data-lib-fallback]');
if (!element) {
  console.warn('No elements with fallback indicator found');
}
```

**Solutions:**

1. **Add Fallback Styles:**
```typescript
this.styleFallbackService.updateConfig({
  fallbackStyles: {
    '.my-component': 'display: flex; align-items: center;'
  }
});
```

2. **Use Directive Correctly:**
```html
<!-- Correct -->
<div [libStyleFallback]="{ 'display': 'flex' }">Content</div>

<!-- Incorrect -->
<div libStyleFallback="display: flex">Content</div>
```

3. **Check CSS Syntax:**
```typescript
// Valid CSS properties
fallbackStyles = {
  'display': 'flex',
  'align-items': 'center',
  '--custom-property': '#3b82f6'
};

// Invalid - will be ignored
fallbackStyles = {
  'invalid-property': 'invalid-value'
};
```

### 3. Animation Issues

**Symptoms:**
- Animations not working
- Jerky or broken animations
- Missing keyframes

**Diagnosis:**

```typescript
// Check animation support
const result = this.styleFallbackService.getDetectionResult();
console.log('Animations supported:', result?.animationsSupported);

// Check if keyframes are loaded
const stylesheets = Array.from(document.styleSheets);
const hasKeyframes = stylesheets.some(sheet => {
  try {
    return Array.from(sheet.cssRules).some(rule => 
      rule.type === CSSRule.KEYFRAMES_RULE
    );
  } catch (e) {
    return false;
  }
});
console.log('Keyframes found:', hasKeyframes);
```

**Solutions:**

1. **Add Keyframes:**
```typescript
this.styleFallbackService.updateConfig({
  fallbackStyles: {
    '.my-animation': 'animation: myAnimation 2s ease-in-out infinite;'
  }
});

// Add keyframes to global styles
const keyframes = `
@keyframes myAnimation {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
`;
```

2. **Use Vendor Prefixes:**
```typescript
fallbackStyles = {
  '.animated': `
    animation: spin 1s linear infinite;
    -webkit-animation: spin 1s linear infinite;
    -moz-animation: spin 1s linear infinite;
  `
};
```

3. **Fallback to Transforms:**
```typescript
// If animations aren't supported, use transforms
fallbackStyles = {
  '.loading': result?.animationsSupported 
    ? 'animation: spin 1s linear infinite;'
    : 'transform: rotate(45deg);'
};
```

### 4. SSR Issues

**Symptoms:**
- Hydration mismatches
- Different rendering on server vs client
- Console warnings about SSR

**Diagnosis:**

```typescript
// Check if running in SSR
const isSSR = typeof window === 'undefined';
console.log('SSR environment:', isSSR);

// Check service state in SSR
if (isSSR) {
  const state = this.styleFallbackService.state();
  console.log('SSR state:', state);
}
```

**Solutions:**

1. **Handle SSR Gracefully:**
```typescript
@Component({
  template: `
    @if (isClient()) {
      <div [libStyleFallback]="clientStyles">Client content</div>
    } @else {
      <div [libStyleFallback]="ssrStyles">SSR content</div>
    }
  `
})
export class SSRSafeComponent {
  isClient = signal(false);
  
  ngOnInit() {
    this.isClient.set(typeof window !== 'undefined');
  }
}
```

2. **Use afterNextRender:**
```typescript
import { afterNextRender } from '@angular/core';

constructor() {
  afterNextRender(() => {
    // Client-only code
    this.styleFallbackService.forceDetection();
  });
}
```

3. **Provide SSR Defaults:**
```typescript
// Assume fallbacks needed in SSR
const ssrConfig = {
  enableFallbacks: true,
  fallbackStyles: {
    '.component': 'display: block; padding: 1rem;'
  }
};
```

### 5. Performance Issues

**Symptoms:**
- Slow component rendering
- High memory usage
- Frequent re-detections

**Diagnosis:**

```typescript
// Monitor detection frequency
let detectionCount = 0;
const originalDetection = this.styleFallbackService.forceDetection;
this.styleFallbackService.forceDetection = () => {
  detectionCount++;
  console.log('Detection count:', detectionCount);
  return originalDetection.call(this.styleFallbackService);
};

// Check memory usage
console.log('Memory usage:', performance.memory);
```

**Solutions:**

1. **Debounce Detections:**
```typescript
// Already implemented in service, but you can add additional debouncing
private debouncedDetection = debounce(() => {
  this.styleFallbackService.forceDetection();
}, 100);
```

2. **Optimize Fallback Styles:**
```typescript
// Use computed styles efficiently
fallbackStyles = computed(() => {
  const needsFallback = this.styleFallbackService.needsFallback();
  
  // Early return if no fallback needed
  if (!needsFallback) return {};
  
  // Cache expensive calculations
  return this.cachedFallbackStyles ??= this.calculateFallbackStyles();
});
```

3. **Limit Observers:**
```typescript
// Disable observers if not needed
this.styleFallbackService.updateConfig({
  enableObservers: false // Custom config option
});
```

### 6. Build Issues

**Symptoms:**
- Build failures
- Missing dependencies
- Bundle size issues

**Diagnosis:**

```bash
# Check bundle size
npm run build:lib:size

# Analyze bundle
npm run build:lib:analyze

# Validate build
npm run test:build-validation
```

**Solutions:**

1. **Fix Missing Dependencies:**
```json
// package.json
{
  "peerDependencies": {
    "@angular/core": "^17.0.0",
    "@angular/common": "^17.0.0"
  }
}
```

2. **Optimize Bundle Size:**
```typescript
// Use tree-shakable imports
import { StyleFallbackService } from 'shared-lib/services';
import { StyleFallbackDirective } from 'shared-lib/directives';

// Instead of
import { StyleFallbackService, StyleFallbackDirective } from 'shared-lib';
```

3. **Configure Build:**
```json
// ng-package.json
{
  "lib": {
    "entryFile": "src/public-api.ts"
  },
  "allowedNonPeerDependencies": [
    "tslib"
  ]
}
```

## Debug Tools

### 1. Debug Component

```typescript
import { Component } from '@angular/core';
import { StyleFallbackService } from 'shared-lib';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-debug-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-panel">
      <h3>Style Debug Panel</h3>
      
      <div class="section">
        <h4>Service State</h4>
        <pre>{{ serviceState() | json }}</pre>
      </div>
      
      <div class="section">
        <h4>Configuration</h4>
        <pre>{{ configuration() | json }}</pre>
      </div>
      
      <div class="section">
        <h4>Detection Result</h4>
        <pre>{{ detectionResult() | json }}</pre>
      </div>
      
      <div class="actions">
        <button (click)="forceDetection()">Force Detection</button>
        <button (click)="toggleFallbacks()">Toggle Fallbacks</button>
        <button (click)="clearCache()">Clear Cache</button>
      </div>
    </div>
  `,
  styles: [`
    .debug-panel {
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 1rem;
      font-size: 12px;
      z-index: 9999;
      max-height: 80vh;
      overflow-y: auto;
    }
    
    .section {
      margin: 1rem 0;
    }
    
    pre {
      background: #f5f5f5;
      padding: 0.5rem;
      border-radius: 2px;
      overflow-x: auto;
    }
    
    .actions button {
      margin: 0.25rem;
      padding: 0.25rem 0.5rem;
      font-size: 11px;
    }
  `]
})
export class DebugPanelComponent {
  constructor(private styleFallbackService: StyleFallbackService) {}
  
  serviceState = this.styleFallbackService.state;
  configuration = this.styleFallbackService.config;
  
  detectionResult() {
    return this.styleFallbackService.getDetectionResult();
  }
  
  forceDetection() {
    this.styleFallbackService.forceDetection();
  }
  
  toggleFallbacks() {
    const config = this.styleFallbackService.config();
    this.styleFallbackService.updateConfig({
      enableFallbacks: !config.enableFallbacks
    });
  }
  
  clearCache() {
    // Implementation depends on caching strategy
    localStorage.removeItem('style-detection-cache');
    this.forceDetection();
  }
}
```

### 2. Console Commands

Add these to your browser console for debugging:

```javascript
// Global debug object
window.styleDebug = {
  // Get service instance
  getService() {
    return document.querySelector('app-root')?.__ngContext__?.[0]?.injector?.get('StyleFallbackService');
  },
  
  // Force detection
  detect() {
    this.getService()?.forceDetection();
  },
  
  // Toggle fallbacks
  toggleFallbacks() {
    const service = this.getService();
    const config = service?.config();
    service?.updateConfig({
      enableFallbacks: !config?.enableFallbacks
    });
  },
  
  // Get debug info
  info() {
    const service = this.getService();
    return {
      state: service?.state(),
      config: service?.config(),
      detection: service?.getDetectionResult()
    };
  }
};
```

### 3. Test Utilities

```typescript
// Test helper functions
export class StyleTestUtils {
  static disableTailwind() {
    // Disable Tailwind CSS for testing
    const tailwindLinks = document.querySelectorAll('link[href*="tailwind"]');
    tailwindLinks.forEach(link => link.remove());
  }
  
  static enableFallbackMode(service: StyleFallbackService) {
    service.updateConfig({
      enableFallbacks: true
    });
  }
  
  static simulateSSR() {
    // Mock SSR environment
    Object.defineProperty(window, 'window', {
      value: undefined,
      writable: true
    });
  }
  
  static checkFallbackElements() {
    return document.querySelectorAll('[data-lib-fallback="active"]');
  }
}
```

## Getting Help

If you're still experiencing issues:

1. **Check the Console**: Look for error messages and warnings
2. **Enable Debug Mode**: Use the debug panel component
3. **Test Isolation**: Create a minimal reproduction case
4. **Check Dependencies**: Ensure all peer dependencies are installed
5. **Update Library**: Make sure you're using the latest version

## Reporting Issues

When reporting issues, please include:

1. **Environment**: Angular version, browser, OS
2. **Configuration**: Your Tailwind and library configuration
3. **Reproduction**: Minimal code to reproduce the issue
4. **Debug Info**: Output from the debug panel
5. **Expected vs Actual**: What you expected vs what happened

```typescript
// Include this debug info in your issue report
const debugInfo = {
  environment: {
    angular: '17.0.0',
    browser: navigator.userAgent,
    library: '1.0.0'
  },
  service: this.styleFallbackService.state(),
  config: this.styleFallbackService.config(),
  detection: this.styleFallbackService.getDetectionResult()
};
```
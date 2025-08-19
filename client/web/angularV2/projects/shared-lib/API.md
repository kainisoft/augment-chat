# API Reference

Complete API documentation for the shared library components, services, and utilities.

## Components

### LoadingComponent

A versatile loading component with multiple display types and automatic style fallbacks.

#### Selector
`lib-loading`

#### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | `'spinner' \| 'skeleton' \| 'dots' \| 'pulse'` | `'spinner'` | Loading animation type |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of the loading indicator |
| `message` | `string` | `''` | Optional loading message |
| `lines` | `number` | `3` | Number of skeleton lines (skeleton type only) |
| `showAvatar` | `boolean` | `false` | Show avatar placeholder (skeleton type only) |

#### Usage

```typescript
import { LoadingComponent } from 'shared-lib';

@Component({
  template: `
    <!-- Basic spinner -->
    <lib-loading></lib-loading>
    
    <!-- Large spinner with message -->
    <lib-loading 
      type="spinner" 
      size="lg" 
      message="Loading data...">
    </lib-loading>
    
    <!-- Skeleton loader -->
    <lib-loading 
      type="skeleton" 
      [lines]="4" 
      [showAvatar]="true">
    </lib-loading>
    
    <!-- Animated dots -->
    <lib-loading type="dots" size="md"></lib-loading>
    
    <!-- Pulse animation -->
    <lib-loading type="pulse" message="Processing..."></lib-loading>
  `,
  imports: [LoadingComponent]
})
export class ExampleComponent {}
```

#### Style Fallbacks

The component automatically provides CSS fallbacks when Tailwind is not available:

- **Spinner**: Uses CSS borders and keyframe animations
- **Skeleton**: Uses background colors and pulse animations
- **Dots**: Uses background colors and bounce animations
- **Pulse**: Uses background colors and pulse animations

## Services

### StyleFallbackService

Manages style detection and fallback mechanisms for library components.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `state` | `Signal<StyleFallbackState>` | Current service state (readonly) |
| `config` | `Signal<StyleFallbackConfig>` | Current configuration (readonly) |
| `isStylesLoaded` | `Signal<boolean>` | Whether Tailwind styles are loaded |
| `needsFallback` | `Signal<boolean>` | Whether fallbacks are needed |
| `isReady` | `Signal<boolean>` | Whether service is initialized |

#### Methods

##### `updateConfig(config: Partial<StyleFallbackConfig>): void`

Updates the fallback configuration.

```typescript
this.styleFallbackService.updateConfig({
  enableFallbacks: true,
  fallbackStyles: {
    '.my-component': 'display: flex; align-items: center;'
  }
});
```

##### `forceDetection(): void`

Forces re-detection of style capabilities.

```typescript
this.styleFallbackService.forceDetection();
```

##### `getDetectionResult(): StyleDetectionResult | null`

Returns the current detection result.

```typescript
const result = this.styleFallbackService.getDetectionResult();
console.log('Tailwind loaded:', result?.tailwindLoaded);
```

##### `isFeatureSupported(feature: keyof StyleDetectionResult): boolean`

Checks if a specific feature is supported.

```typescript
const animationsSupported = this.styleFallbackService.isFeatureSupported('animationsSupported');
```

#### Usage

```typescript
import { StyleFallbackService } from 'shared-lib';

@Component({...})
export class MyComponent {
  constructor(private styleFallbackService: StyleFallbackService) {}
  
  ngOnInit() {
    // Check service state
    console.log('Service ready:', this.styleFallbackService.isReady());
    console.log('Styles loaded:', this.styleFallbackService.isStylesLoaded());
    
    // Update configuration
    this.styleFallbackService.updateConfig({
      enableFallbacks: true,
      fallbackStyles: {
        '.custom-button': 'padding: 0.5rem 1rem; border-radius: 0.25rem;'
      }
    });
  }
}
```

### ThemeService

Advanced theming service with CSS custom properties support.

#### Methods

##### `applyTheme(theme: ThemeConfig): void`

Applies a theme configuration.

```typescript
this.themeService.applyTheme({
  primary: '#3b82f6',
  secondary: '#e5e7eb',
  accent: '#10b981'
});
```

##### `getCurrentTheme(): ThemeConfig`

Returns the current theme configuration.

##### `generatePalette(baseColor: string): ColorPalette`

Generates a color palette from a base color.

## Directives

### StyleFallbackDirective

Applies fallback styles to elements when Tailwind CSS is not available.

#### Selector
`[libStyleFallback]`

#### Inputs

| Input | Type | Description |
|-------|------|-------------|
| `libStyleFallback` | `FallbackStyleMap \| string` | Fallback styles to apply |
| `fallbackClasses` | `string[]` | CSS classes to apply as fallbacks |
| `criticalStyles` | `boolean` | Whether styles are critical (apply even when uncertain) |
| `forceApply` | `boolean` | Force apply fallbacks regardless of detection |

#### Usage

```typescript
import { StyleFallbackDirective } from 'shared-lib';

@Component({
  template: `
    <!-- String styles -->
    <div libStyleFallback="color: red; font-size: 16px;">
      Content with string fallbacks
    </div>
    
    <!-- Object styles -->
    <div [libStyleFallback]="objectStyles">
      Content with object fallbacks
    </div>
    
    <!-- With CSS classes -->
    <div 
      [libStyleFallback]="styles"
      [fallbackClasses]="['lib-flex', 'lib-items-center']"
      [criticalStyles]="true">
      Content with class fallbacks
    </div>
    
    <!-- Force apply -->
    <div 
      [libStyleFallback]="styles"
      [forceApply]="true">
      Always apply these styles
    </div>
  `,
  imports: [StyleFallbackDirective]
})
export class ExampleComponent {
  objectStyles = {
    'display': 'flex',
    'align-items': 'center',
    'padding': '1rem',
    '--custom-color': '#3b82f6'
  };
  
  styles = {
    'background-color': '#f3f4f6',
    'border-radius': '0.5rem'
  };
}
```

## Utility Functions

### Style Detection Utilities

#### `detectTailwindLoading(): boolean`

Detects if Tailwind CSS classes are properly loaded.

```typescript
import { detectTailwindLoading } from 'shared-lib';

const isTailwindLoaded = detectTailwindLoading();
console.log('Tailwind loaded:', isTailwindLoaded);
```

#### `detectAnimationSupport(): boolean`

Detects if CSS animations are supported.

```typescript
import { detectAnimationSupport } from 'shared-lib';

const animationsSupported = detectAnimationSupport();
```

#### `detectCustomPropertiesSupport(): boolean`

Detects if CSS custom properties (variables) are supported.

```typescript
import { detectCustomPropertiesSupport } from 'shared-lib';

const customPropsSupported = detectCustomPropertiesSupport();
```

#### `detectStyleCapabilities(): StyleDetectionResult`

Performs comprehensive style capability detection.

```typescript
import { detectStyleCapabilities } from 'shared-lib';

const capabilities = detectStyleCapabilities();
console.log('Detection result:', capabilities);
// {
//   tailwindLoaded: boolean,
//   animationsSupported: boolean,
//   customPropertiesSupported: boolean,
//   fallbackRequired: boolean
// }
```

#### `createFallbackStyles(config: StyleFallbackConfig): string`

Creates CSS string from fallback configuration.

```typescript
import { createFallbackStyles } from 'shared-lib';

const css = createFallbackStyles({
  enableFallbacks: true,
  fallbackStyles: {
    '.button': 'padding: 0.5rem 1rem; border-radius: 0.25rem;'
  },
  criticalClasses: ['button']
});
```

#### `applyFallbackStyles(css: string, id?: string): void`

Dynamically applies fallback styles to the document.

```typescript
import { applyFallbackStyles } from 'shared-lib';

const css = '.my-class { color: red; }';
applyFallbackStyles(css, 'my-fallback-styles');
```

#### `removeFallbackStyles(id?: string): void`

Removes previously applied fallback styles.

```typescript
import { removeFallbackStyles } from 'shared-lib';

removeFallbackStyles('my-fallback-styles');
```

## Type Definitions

### StyleDetectionResult

```typescript
interface StyleDetectionResult {
  tailwindLoaded: boolean;
  animationsSupported: boolean;
  customPropertiesSupported: boolean;
  fallbackRequired: boolean;
}
```

### StyleFallbackConfig

```typescript
interface StyleFallbackConfig {
  enableFallbacks: boolean;
  fallbackStyles: Record<string, string>;
  criticalClasses: string[];
}
```

### StyleFallbackState

```typescript
interface StyleFallbackState {
  isInitialized: boolean;
  detectionResult: StyleDetectionResult | null;
  fallbacksActive: boolean;
  lastDetectionTime: number;
}
```

### FallbackStyleMap

```typescript
interface FallbackStyleMap {
  [className: string]: string;
}
```

## Constants

### DEFAULT_FALLBACK_STYLES

Default fallback styles configuration.

```typescript
import { DEFAULT_FALLBACK_STYLES } from 'shared-lib';

console.log(DEFAULT_FALLBACK_STYLES);
// {
//   enableFallbacks: true,
//   fallbackStyles: {
//     '.lib-flex': 'display: flex;',
//     '.lib-items-center': 'align-items: center;',
//     // ... more styles
//   },
//   criticalClasses: ['lib-flex', 'lib-items-center', ...]
// }
```

### FALLBACK_KEYFRAMES

CSS keyframes for fallback animations.

```typescript
import { FALLBACK_KEYFRAMES } from 'shared-lib';

console.log(FALLBACK_KEYFRAMES);
// Contains @keyframes for lib-spin, lib-pulse, lib-bounce
```

## Error Handling

### Service Errors

The StyleFallbackService handles errors gracefully:

```typescript
// Detection errors are caught and logged
try {
  const result = detectTailwindLoading();
} catch (error) {
  console.warn('Failed to detect Tailwind loading:', error);
  return false; // Safe fallback
}
```

### Directive Errors

The StyleFallbackDirective handles invalid styles gracefully:

```typescript
// Invalid styles are ignored, valid ones are applied
const styles = {
  'valid-property': 'valid-value',
  'invalid-property': 'invalid-value' // This will be ignored
};
```

## Performance Considerations

### Detection Caching

Style detection results are cached to avoid repeated DOM queries:

```typescript
// Detection is debounced and cached
const debouncedDetection = createDebouncedStyleDetection(150);
```

### Bundle Size Impact

- Core system: ~15KB gzipped
- Fallback styles: ~5KB gzipped
- Tree shakable: Import only what you need

### Memory Management

The service automatically cleans up observers and resources:

```typescript
// Automatic cleanup on component destroy
this.destroyRef.onDestroy(() => {
  this.cleanup();
});
```

## Browser Compatibility

### Supported Browsers

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Polyfills

For older browsers, you may need polyfills for:

- CSS Custom Properties
- CSS Animation support
- MutationObserver

### SSR Support

All utilities and services work correctly in server-side rendering:

```typescript
// Automatic SSR detection
if (typeof window === 'undefined') {
  // SSR mode - apply fallbacks by default
  return { fallbackRequired: true };
}
```

## Migration Guide

### From Previous Versions

When upgrading to versions with style fallback support:

1. **Update Imports**: Add new imports for fallback components
2. **Add Directive**: Include `StyleFallbackDirective` in component imports
3. **Test Fallbacks**: Test your application without Tailwind CSS
4. **Update Styles**: Migrate to CSS custom properties where appropriate

### Breaking Changes

- `LoadingComponent` now includes fallback support (no breaking changes to API)
- New directive `StyleFallbackDirective` available
- New service `StyleFallbackService` available
- CSS classes prefixed with `lib-` for fallback styles

## Examples

See the [examples directory](./examples/) for complete working examples:

- [Basic Usage](./examples/basic-usage/)
- [Custom Fallbacks](./examples/custom-fallbacks/)
- [SSR Integration](./examples/ssr-integration/)
- [Performance Optimization](./examples/performance/)
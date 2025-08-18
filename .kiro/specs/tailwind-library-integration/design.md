# Design Document

## Overview

This design addresses the Tailwind CSS integration issue in Angular libraries where `@apply` directives and Tailwind classes are not properly processed during library builds. The solution involves creating a hybrid approach that ensures styles work both in library builds and consuming applications.

## Architecture

### Current Problem Analysis

1. **Library Build Process**: Angular libraries use ng-packagr which doesn't process Tailwind's `@apply` directives by default
2. **Style Isolation**: Library styles need to be self-contained and not depend on consuming app's Tailwind configuration
3. **Build Tool Differences**: Applications use Angular's build system with PostCSS/Tailwind integration, while libraries use ng-packagr

### Solution Architecture

The solution implements a multi-layered approach:

1. **Fallback CSS Styles**: Provide vanilla CSS equivalents for critical Tailwind utilities
2. **Build-time Processing**: Configure ng-packagr to process Tailwind directives
3. **Style Strategy**: Use a combination of direct CSS and processed Tailwind classes

## Components and Interfaces

### 1. Enhanced PostCSS Configuration

```javascript
// Enhanced postcss.config.js for library builds
module.exports = {
  plugins: {
    tailwindcss: {
      config: './tailwind.config.js'
    },
    autoprefixer: {},
    'postcss-import': {},
    'postcss-nested': {}
  }
}
```

### 2. Library-Specific Tailwind Configuration

```javascript
// tailwind.lib.config.js - Optimized for library builds
module.exports = {
  content: ['./projects/shared-lib/src/**/*.{html,ts}'],
  // Minimal, essential utilities only
  corePlugins: {
    // Enable only necessary plugins for library
  }
}
```

### 3. Component Style Strategy

**Hybrid Approach for Loading Component:**
- Primary: Vanilla CSS with CSS custom properties
- Secondary: Tailwind utilities for layout
- Fallback: Inline styles for critical animations

### 4. Build Process Integration

**ng-packagr Configuration:**
```json
{
  "lib": {
    "stylePreprocessorOptions": {
      "includePaths": ["src/styles"]
    }
  }
}
```

## Data Models

### Style Configuration Model

```typescript
interface LibraryStyleConfig {
  useTailwind: boolean;
  fallbackStyles: boolean;
  customProperties: Record<string, string>;
  criticalStyles: string[];
}
```

### Component Style State

```typescript
interface ComponentStyleState {
  tailwindLoaded: boolean;
  fallbackActive: boolean;
  customPropertiesApplied: boolean;
}
```

## Error Handling

### 1. Style Loading Failures

- **Detection**: Check if Tailwind classes are applied
- **Fallback**: Activate vanilla CSS styles
- **Recovery**: Retry with different style strategy

### 2. Build Process Errors

- **Validation**: Pre-build style validation
- **Reporting**: Clear error messages for missing dependencies
- **Graceful Degradation**: Ensure components still function without perfect styling

### 3. Runtime Style Issues

- **Detection**: CSS feature detection
- **Adaptation**: Dynamic style application
- **User Experience**: Maintain functionality even with style issues

## Testing Strategy

### 1. Unit Tests

- **Component Rendering**: Verify components render with correct styles
- **Style Application**: Test both Tailwind and fallback styles
- **Animation Functionality**: Ensure loading animations work

### 2. Integration Tests

- **Library Build**: Test library builds with different configurations
- **Consumer App Integration**: Test library usage in different Angular apps
- **Style Isolation**: Verify styles don't conflict with consuming apps

### 3. Visual Regression Tests

- **Component Appearance**: Screenshot comparisons
- **Animation Behavior**: Verify spinner animations
- **Cross-browser Compatibility**: Test in different browsers

### 4. Build Process Tests

- **PostCSS Processing**: Verify Tailwind directives are processed
- **Asset Generation**: Check generated CSS files
- **Bundle Size**: Monitor impact on bundle size

## Implementation Approach

### Phase 1: Immediate Fix
1. Replace `@apply` directives with vanilla CSS in loading component
2. Add CSS custom properties for theming
3. Ensure animations work without Tailwind

### Phase 2: Enhanced Integration
1. Configure ng-packagr for better Tailwind processing
2. Create library-specific Tailwind configuration
3. Implement build-time style processing

### Phase 3: Optimization
1. Add style loading detection
2. Implement dynamic fallback system
3. Optimize bundle size and performance

## Performance Considerations

### Bundle Size Impact
- **Minimal CSS**: Include only necessary styles in library
- **Tree Shaking**: Ensure unused styles are eliminated
- **Compression**: Optimize CSS output

### Runtime Performance
- **CSS Loading**: Minimize style recalculation
- **Animation Performance**: Use GPU-accelerated properties
- **Memory Usage**: Avoid style duplication

### Build Performance
- **Processing Time**: Optimize PostCSS configuration
- **Caching**: Leverage build caching where possible
- **Parallel Processing**: Enable concurrent style processing

## Security Considerations

### Style Injection Prevention
- **Sanitization**: Ensure dynamic styles are safe
- **CSP Compliance**: Work with Content Security Policy
- **XSS Prevention**: Avoid unsafe style injection

### Dependency Security
- **Package Auditing**: Regular security audits of style dependencies
- **Version Management**: Keep PostCSS and Tailwind updated
- **Minimal Dependencies**: Reduce attack surface
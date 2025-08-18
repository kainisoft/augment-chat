# Build System Configuration

This document outlines the build system configuration for the Angular V2 workspace, including Tailwind CSS 4.0+, Webpack 5 with Module Federation, HMR, bundle analysis, and debugging tools.

## Overview

The build system is configured to support:
- **Tailwind CSS 4.0+** with JIT compilation and custom theming
- **Webpack 5** with Module Federation for micro-frontend architecture
- **Hot Module Replacement (HMR)** for fast development
- **Bundle Analysis** and performance monitoring
- **Source Maps** and debugging tools
- **Multi-project workspace** with shared libraries

## Project Structure

```
client/web/angularV2/
├── projects/
│   ├── chat-app/           # Main chat application (Port: 4201)
│   ├── admin-panel/        # Admin application (Port: 4202)
│   ├── mobile-shell/       # Mobile-optimized shell (Port: 4203)
│   └── shared-lib/         # Shared library
├── scripts/
│   ├── build-config.js     # Build configuration manager
│   └── bundle-size-check.js # Bundle size monitoring
├── webpack.config.js       # Main webpack configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── postcss.config.js       # PostCSS configuration
```

## Available Scripts

### Development Scripts
```bash
# Start main application with HMR
pnpm start

# Start individual applications
pnpm run debug:chat    # Chat app on port 4201
pnpm run debug:admin   # Admin panel on port 4202
pnpm run debug:mobile  # Mobile shell on port 4203

# Debug with verbose output
pnpm run debug         # Main app with debugging
pnpm run debug:inspect # Node.js debugging
```

### Build Scripts
```bash
# Build for development
pnpm run build

# Build for production
pnpm run build:prod

# Build with debugging information
pnpm run debug:build
```

### Analysis Scripts
```bash
# Analyze bundle sizes
pnpm run analyze           # Main app
pnpm run analyze:chat      # Chat app
pnpm run analyze:admin     # Admin panel
pnpm run analyze:mobile    # Mobile shell

# Performance auditing
pnpm run perf:audit        # Lighthouse audit
pnpm run perf:bundle-size  # Bundle size check
```

### Configuration Scripts
```bash
# Optimize for development
pnpm run config:dev

# Optimize for production
pnpm run config:prod

# Enable specific features
pnpm run config:sourcemaps
pnpm run config:hmr
```

## Tailwind CSS Configuration

### Features
- **JIT Compilation**: Just-in-time compilation for optimal performance
- **Custom Theming**: Fuse-inspired theming system with CSS custom properties
- **Responsive Design**: Mobile-first responsive utilities
- **Dark Mode**: Class-based dark mode support
- **Custom Components**: Pre-built component classes

### Usage
```scss
// In your component styles
@apply btn-primary;
@apply card;
@apply text-primary-500;

// Custom theme colors
.my-component {
  background-color: rgb(var(--fuse-primary-500) / 0.1);
  color: rgb(var(--fuse-primary-700));
}
```

### Theme Configuration
The theming system supports:
- Primary, accent, and warn color palettes
- Light and dark mode variants
- Dynamic theme switching
- Accessibility-compliant contrast ratios

## Module Federation

### Configuration
Each micro-frontend is configured as a separate federated module:

- **Shell App** (Port 4200): Main application shell
- **Chat App** (Port 4201): Chat functionality
- **Admin Panel** (Port 4202): Administrative features
- **Mobile Shell** (Port 4203): Mobile-optimized interface

### Shared Dependencies
Common Angular dependencies are shared between micro-frontends:
- @angular/core
- @angular/common
- @angular/router
- rxjs
- zone.js

### Remote Loading
```typescript
// Dynamic module loading
const chatModule = await import('chatApp/ChatModule');
const adminModule = await import('adminPanel/AdminModule');
```

## Hot Module Replacement (HMR)

### Configuration
HMR is enabled for all applications in development mode:

```typescript
// HMR bootstrap (src/hmr.ts)
export const hmrBootstrap = (module: any, bootstrap: () => Promise<NgModuleRef<any>>) => {
  // HMR implementation
};
```

### Usage
HMR automatically reloads modules when changes are detected, preserving application state where possible.

## Bundle Analysis

### Bundle Size Monitoring
The `bundle-size-check.js` script monitors bundle sizes against defined thresholds:

- **Initial Bundle**: 1MB maximum
- **Vendor Bundle**: 2MB maximum
- **Component Styles**: 8KB maximum

### Performance Metrics
The `PerformanceMonitorService` tracks:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

### Usage
```typescript
// In your component
constructor(private perfMonitor: PerformanceMonitorService) {}

measureRender() {
  const endMeasure = this.perfMonitor.measureComponentRender('MyComponent');
  // Component rendering logic
  endMeasure(); // Logs render time
}
```

## Source Maps and Debugging

### Source Map Configuration
Source maps are configured for different environments:

- **Development**: Full source maps for scripts, styles, and vendor code
- **Debug**: Enhanced source maps with named chunks
- **Production**: Hidden source maps for error tracking

### Debug Service
The `DebugService` provides:
- Error logging and tracking
- Performance measurement
- System information collection
- Log export functionality

### Usage
```typescript
// In your service
constructor(private debug: DebugService) {}

performOperation() {
  return this.debug.measurePerformance('operation', () => {
    // Your operation logic
    return result;
  });
}
```

### VS Code Integration
Debug configurations are provided for:
- Chrome debugging for each application
- Node.js debugging for Angular CLI
- Task automation for builds and serves

## Environment Configuration

### Development Environment
```typescript
export const environment = {
  production: false,
  debug: true,
  enableDevTools: true,
  enablePerformanceMonitoring: true,
  features: {
    hmr: true,
    bundleAnalyzer: true,
    performanceMetrics: true,
  }
};
```

### Production Environment
```typescript
export const environment = {
  production: true,
  debug: false,
  enableDevTools: false,
  enablePerformanceMonitoring: true,
  features: {
    hmr: false,
    bundleAnalyzer: false,
    performanceMetrics: true,
  }
};
```

## Performance Optimization

### Build Optimizations
- **Tree Shaking**: Removes unused code
- **Code Splitting**: Lazy loads feature modules
- **Bundle Optimization**: Optimizes chunk sizes
- **Compression**: Gzip compression for production

### Runtime Optimizations
- **OnPush Change Detection**: Optimized change detection
- **Lazy Loading**: Route-based code splitting
- **Service Workers**: Caching and offline support
- **Preloading**: Intelligent module preloading

## Troubleshooting

### Common Issues

1. **HMR Not Working**
   ```bash
   # Restart with HMR explicitly enabled
   pnpm run debug
   ```

2. **Bundle Size Warnings**
   ```bash
   # Analyze bundle composition
   pnpm run analyze
   ```

3. **Source Maps Not Loading**
   ```bash
   # Rebuild with debug configuration
   pnpm run debug:build
   ```

4. **Module Federation Errors**
   ```bash
   # Check remote module availability
   curl http://localhost:4201/remoteEntry.js
   ```

### Debug Commands
```bash
# Enable verbose logging
ng serve --verbose

# Check build configuration
node scripts/build-config.js

# Analyze specific project
ng build chat-app --stats-json
```

## Best Practices

### Development
1. Use HMR for fast development cycles
2. Monitor bundle sizes regularly
3. Enable source maps for debugging
4. Use performance monitoring in development

### Production
1. Disable debug features
2. Enable all optimizations
3. Monitor Core Web Vitals
4. Use hidden source maps for error tracking

### Code Organization
1. Keep shared code in the shared library
2. Use lazy loading for feature modules
3. Implement proper error boundaries
4. Follow Angular style guide conventions

This build system configuration provides a robust foundation for developing modern Angular applications with optimal performance and developer experience.
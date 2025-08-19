// Services barrel file - using named exports for optimal tree-shaking
// This approach allows consumers to import only the services they need,
// improving bundle size through better dead code elimination

// Core state management
export { SignalStoreService } from './signal-store.service';

// Validation and data integrity
export { ValidationService } from './validation.service';

// Performance and monitoring
export { PerformanceMonitoringService } from './performance-monitoring.service';
export { MemoryOptimizationService } from './memory-optimization.service';

// Theming system
export { ThemeService } from './theme.service';

// Style fallback system
export { StyleFallbackService } from './style-fallback.service';
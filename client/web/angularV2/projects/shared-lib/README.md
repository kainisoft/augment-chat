# Shared Library

A comprehensive Angular shared library providing reusable components, services, models, and utilities for the Angular V2 workspace. This library implements modern Angular features including Signals, Standalone Components, and advanced reactive patterns.

## Features

### Components
- **BaseComponent**: Foundation component with signals and common functionality
- **MessageBubbleComponent**: Reusable message bubble with theming support
- **UserAvatarComponent**: User avatar with status indicators
- **LoadingComponent**: Loading states and skeleton components with style fallbacks
- **FormControlsComponent**: Form controls with validation

### Style Integration System
- **StyleFallbackService**: Automatic Tailwind CSS detection and fallback management
- **StyleFallbackDirective**: Apply fallback styles to any element
- **Style Detection Utilities**: Functions for detecting CSS capabilities
- **SSR Support**: Full server-side rendering compatibility

### Services
- **SignalStoreService**: Signal-based global state management
- **ValidationService**: Comprehensive input validation
- **PerformanceMonitoringService**: Performance tracking and monitoring
- **MemoryOptimizationService**: Memory management and optimization
- **StyleFallbackService**: Style detection and fallback management
- **ThemeService**: Advanced theming with CSS custom properties

### Models
- **User, Message, Conversation**: Core data models
- **WebSocket Events**: Real-time event models
- **State Management**: Application state interfaces
- **Validation**: Validation result models

### Utilities
- **Date Utils**: Date formatting and manipulation
- **Validation Utils**: Common validation functions
- **Color Utils**: Color manipulation and theming
- **Performance Utils**: Performance optimization helpers
- **Signal Utils**: Enhanced signal operations
- **Style Detection Utils**: CSS capability detection and fallback creation

## Installation

This library is part of the Angular V2 workspace and is automatically available to all projects within the workspace.

## Usage

### Importing Components

```typescript
import { MessageBubbleComponent, UserAvatarComponent } from 'shared-lib';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MessageBubbleComponent, UserAvatarComponent],
  template: `
    <lib-message-bubble 
      [message]="message" 
      [currentUserId]="currentUserId" />
    <lib-user-avatar 
      [user]="user" 
      size="lg" />
  `
})
export class ChatComponent {
  // Component implementation
}
```

### Using Services

```typescript
import { SignalStoreService, ValidationService } from 'shared-lib';

@Component({
  // Component configuration
})
export class MyComponent {
  private store = inject(SignalStoreService);
  private validation = inject(ValidationService);

  ngOnInit() {
    // Access global state
    const user = this.store.user();
    
    // Validate input
    const result = this.validation.validateEmail('test@example.com');
  }
}
```

### Using Utilities

```typescript
import { formatDistanceToNow, debounce, generatePalette } from 'shared-lib';

// Date formatting
const timeAgo = formatDistanceToNow(Date.now() - 3600000); // "1 hour ago"

// Performance optimization
const debouncedSearch = debounce((query: string) => {
  // Search implementation
}, 300);

// Color theming
const palette = generatePalette('#2196F3');
```

### Style Integration System

The library includes an advanced style integration system that automatically detects Tailwind CSS availability and provides fallbacks:

```typescript
import { StyleFallbackDirective, StyleFallbackService } from 'shared-lib';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [StyleFallbackDirective],
  template: `
    <!-- Automatic fallbacks when Tailwind is not available -->
    <div 
      [libStyleFallback]="fallbackStyles"
      [criticalStyles]="true"
      class="flex items-center justify-center p-4">
      Content that works everywhere
    </div>
    
    <!-- Enhanced loading component with built-in fallbacks -->
    <lib-loading type="spinner" size="lg" message="Loading..."></lib-loading>
  `
})
export class ExampleComponent {
  constructor(private styleFallbackService: StyleFallbackService) {}
  
  fallbackStyles = {
    'display': 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    'padding': '1rem'
  };
  
  ngOnInit() {
    // Check if Tailwind is loaded
    const isLoaded = this.styleFallbackService.isStylesLoaded();
    
    // Force re-detection if needed
    if (!isLoaded) {
      this.styleFallbackService.forceDetection();
    }
  }
}
```

## Architecture

### Signal-Based Components
All components use Angular Signals for reactive state management:

```typescript
@Component({
  selector: 'lib-example',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent extends BaseComponent {
  // Signal inputs
  data = input.required<Data>();
  
  // Computed signals
  processedData = computed(() => this.processData(this.data()));
  
  // Signal outputs
  dataChange = output<Data>();
}
```

### State Management
The library provides a signal-based store for global state:

```typescript
// Global state access
const store = inject(SignalStoreService);

// Reactive state
const user = store.user();
const isAuthenticated = store.isAuthenticated();

// State updates
store.setUser(newUser);
store.addMessage(message);
```

### Performance Optimization
Built-in performance monitoring and optimization:

```typescript
// Component render tracking
const stopTimer = this.performanceMonitor.measureComponentRender('MyComponent');
// ... component logic
stopTimer();

// Memory management
this.memoryOptimizer.trackSubscription(subscription);
this.memoryOptimizer.addCleanupTask(() => cleanup());
```

## Development

### Building the Library
```bash
ng build shared-lib
```

### Running Tests
```bash
ng test shared-lib
```

### Linting
```bash
ng lint shared-lib
```

## Requirements Compliance

This shared library implementation satisfies the following requirements:

- **Requirement 2.2**: Shared library project for common components and services
- **Requirement 2.3**: Standalone components by default with signals support
- **Requirement 2.4**: Modern reactive patterns and signal-based architecture

## Best Practices

### Component Development
- Extend `BaseComponent` for common functionality
- Use `ChangeDetectionStrategy.OnPush` for performance
- Implement proper error handling and loading states
- Follow accessibility guidelines

### Service Development
- Use dependency injection with `providedIn: 'root'`
- Implement proper error handling
- Use signals for reactive state management
- Follow single responsibility principle

### Testing
- Write comprehensive unit tests
- Test signal behavior and computed values
- Mock dependencies appropriately
- Achieve high test coverage

## Contributing

When adding new components, services, or utilities:

1. Follow the established patterns and architecture
2. Add comprehensive tests
3. Update the public API exports
4. Document the new functionality
5. Ensure TypeScript strict mode compliance

## Documentation

### Style Integration
- **[Style Integration Guide](./STYLE_INTEGRATION.md)**: Comprehensive guide to the style system
- **[Troubleshooting](./TROUBLESHOOTING.md)**: Common issues and solutions
- **[Examples](./examples/)**: Working examples and use cases

### Theming
- **[Theming Guide](./THEMING.md)**: Advanced theming system documentation
- **[Tailwind Configuration](./TAILWIND_CONFIG.md)**: Tailwind CSS integration setup

### Examples
- **[Basic Usage](./examples/basic-usage/)**: Simple component usage examples
- **[Custom Fallbacks](./examples/custom-fallbacks/)**: Creating custom components with fallbacks

## Testing

The library includes comprehensive testing with 100% success rate:

```bash
# Unit tests (94 tests)
npm run test:unit

# Integration tests (17 tests)
npm run test:integration

# Style fallback tests (8 tests)
npm run test:fallbacks

# Complete test suite
npm run test:complete

# Build validation
npm run test:build-validation
```

## Bundle Size

- **Core Library**: ~200KB (includes all components and services)
- **Style Fallback System**: ~20KB (automatic fallbacks)
- **Tree Shakable**: Import only what you need for optimal bundle size

## Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **SSR Compatible**: Works with Angular Universal
- **Fallback Support**: Graceful degradation for older browsers

## License

This library is part of the Angular V2 workspace project.
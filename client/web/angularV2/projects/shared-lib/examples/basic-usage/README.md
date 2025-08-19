# Basic Usage Examples

This directory contains basic examples of using the shared library components with style integration.

## Loading Component Examples

### Simple Spinner

```typescript
import { Component } from '@angular/core';
import { LoadingComponent } from 'shared-lib';

@Component({
  selector: 'app-simple-spinner',
  standalone: true,
  imports: [LoadingComponent],
  template: `
    <div class="container">
      <h2>Simple Spinner</h2>
      <lib-loading type="spinner" size="md"></lib-loading>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
      text-align: center;
    }
  `]
})
export class SimpleSpinnerComponent {}
```

### Skeleton Loader

```typescript
import { Component } from '@angular/core';
import { LoadingComponent } from 'shared-lib';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [LoadingComponent],
  template: `
    <div class="container">
      <h2>Skeleton Loader</h2>
      
      <!-- Simple skeleton -->
      <lib-loading 
        type="skeleton" 
        [lines]="3">
      </lib-loading>
      
      <!-- Skeleton with avatar -->
      <lib-loading 
        type="skeleton" 
        [lines]="4" 
        [showAvatar]="true">
      </lib-loading>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
      max-width: 400px;
      margin: 0 auto;
    }
    
    lib-loading {
      margin: 1rem 0;
    }
  `]
})
export class SkeletonLoaderComponent {}
```

### All Loading Types

```typescript
import { Component, signal } from '@angular/core';
import { LoadingComponent } from 'shared-lib';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-showcase',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  template: `
    <div class="showcase">
      <h2>Loading Component Showcase</h2>
      
      <div class="controls">
        <label>
          Size:
          <select (change)="size.set($event.target.value)">
            <option value="sm">Small</option>
            <option value="md" selected>Medium</option>
            <option value="lg">Large</option>
          </select>
        </label>
        
        <label>
          <input 
            type="checkbox" 
            [checked]="showMessage()"
            (change)="showMessage.set($event.target.checked)">
          Show Message
        </label>
      </div>
      
      <div class="grid">
        <div class="card">
          <h3>Spinner</h3>
          <lib-loading 
            type="spinner" 
            [size]="size()"
            [message]="showMessage() ? 'Loading...' : ''">
          </lib-loading>
        </div>
        
        <div class="card">
          <h3>Dots</h3>
          <lib-loading 
            type="dots" 
            [size]="size()"
            [message]="showMessage() ? 'Processing...' : ''">
          </lib-loading>
        </div>
        
        <div class="card">
          <h3>Pulse</h3>
          <lib-loading 
            type="pulse" 
            [size]="size()"
            [message]="showMessage() ? 'Please wait...' : ''">
          </lib-loading>
        </div>
        
        <div class="card">
          <h3>Skeleton</h3>
          <lib-loading 
            type="skeleton" 
            [lines]="3"
            [showAvatar]="true">
          </lib-loading>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .showcase {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .controls {
      display: flex;
      gap: 1rem;
      margin: 1rem 0;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 0.5rem;
    }
    
    .controls label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }
    
    .card {
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      text-align: center;
      background: white;
    }
    
    .card h3 {
      margin: 0 0 1rem 0;
      color: #374151;
    }
  `]
})
export class LoadingShowcaseComponent {
  size = signal<'sm' | 'md' | 'lg'>('md');
  showMessage = signal(false);
}
```

## Running the Examples

1. Import the component in your application:

```typescript
import { LoadingShowcaseComponent } from './examples/basic-usage/loading-showcase.component';

@Component({
  template: `<app-loading-showcase></app-loading-showcase>`,
  imports: [LoadingShowcaseComponent]
})
export class AppComponent {}
```

2. The components will automatically use Tailwind CSS if available, or fall back to vanilla CSS.

## Testing Fallbacks

To test the fallback behavior:

1. **Disable Tailwind**: Comment out Tailwind CSS imports in your styles
2. **Force Fallbacks**: Use the StyleFallbackService to force fallback mode
3. **Browser DevTools**: Disable CSS files in the Network tab

```typescript
// Force fallback mode for testing
constructor(private styleFallbackService: StyleFallbackService) {
  this.styleFallbackService.updateConfig({
    enableFallbacks: true
  });
}
```

## Browser Compatibility

The fallback system works in all modern browsers:

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

For older browsers, additional polyfills may be required for CSS custom properties and animations.
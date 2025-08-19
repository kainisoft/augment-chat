# Custom Fallbacks Examples

This directory shows how to create custom components with style fallbacks using the StyleFallbackDirective.

## Custom Button Component

```typescript
import { Component, input, computed } from '@angular/core';
import { StyleFallbackDirective, StyleFallbackService } from 'shared-lib';

@Component({
  selector: 'app-custom-button',
  standalone: true,
  imports: [StyleFallbackDirective],
  template: `
    <button 
      [libStyleFallback]="fallbackStyles()"
      [fallbackClasses]="fallbackClasses()"
      [criticalStyles]="true"
      [class]="tailwindClasses()"
      (click)="onClick()">
      <ng-content></ng-content>
    </button>
  `
})
export class CustomButtonComponent {
  // Inputs
  variant = input<'primary' | 'secondary' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input<boolean>(false);
  
  constructor(private styleFallbackService: StyleFallbackService) {}
  
  // Computed Tailwind classes
  tailwindClasses = computed(() => {
    const variant = this.variant();
    const size = this.size();
    const disabled = this.disabled();
    
    let classes = 'font-medium rounded focus:outline-none focus:ring-2 transition-colors';
    
    // Variant classes
    switch (variant) {
      case 'primary':
        classes += ' bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500';
        break;
      case 'secondary':
        classes += ' bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500';
        break;
      case 'danger':
        classes += ' bg-red-600 hover:bg-red-700 text-white focus:ring-red-500';
        break;
    }
    
    // Size classes
    switch (size) {
      case 'sm':
        classes += ' px-3 py-1.5 text-sm';
        break;
      case 'md':
        classes += ' px-4 py-2 text-base';
        break;
      case 'lg':
        classes += ' px-6 py-3 text-lg';
        break;
    }
    
    if (disabled) {
      classes += ' opacity-50 cursor-not-allowed';
    }
    
    return classes;
  });
  
  // Computed fallback styles
  fallbackStyles = computed(() => {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) {
      return {};
    }
    
    const variant = this.variant();
    const size = this.size();
    const disabled = this.disabled();
    
    let styles: Record<string, string> = {
      'font-family': 'system-ui, -apple-system, sans-serif',
      'font-weight': '500',
      'border-radius': '0.375rem',
      'border': 'none',
      'cursor': 'pointer',
      'transition': 'all 0.2s ease-in-out',
      'outline': 'none'
    };
    
    // Variant styles
    switch (variant) {
      case 'primary':
        styles = {
          ...styles,
          'background-color': '#2563eb',
          'color': 'white'
        };
        break;
      case 'secondary':
        styles = {
          ...styles,
          'background-color': '#e5e7eb',
          'color': '#111827'
        };
        break;
      case 'danger':
        styles = {
          ...styles,
          'background-color': '#dc2626',
          'color': 'white'
        };
        break;
    }
    
    // Size styles
    switch (size) {
      case 'sm':
        styles = {
          ...styles,
          'padding': '0.375rem 0.75rem',
          'font-size': '0.875rem'
        };
        break;
      case 'md':
        styles = {
          ...styles,
          'padding': '0.5rem 1rem',
          'font-size': '1rem'
        };
        break;
      case 'lg':
        styles = {
          ...styles,
          'padding': '0.75rem 1.5rem',
          'font-size': '1.125rem'
        };
        break;
    }
    
    if (disabled) {
      styles = {
        ...styles,
        'opacity': '0.5',
        'cursor': 'not-allowed'
      };
    }
    
    return styles;
  });
  
  // Computed fallback classes
  fallbackClasses = computed(() => {
    const needsFallback = this.styleFallbackService.needsFallback();
    return needsFallback ? ['lib-button-fallback'] : [];
  });
  
  onClick() {
    if (!this.disabled()) {
      // Handle click
      console.log('Button clicked:', this.variant());
    }
  }
}
```

## Custom Card Component

```typescript
import { Component, input, computed } from '@angular/core';
import { StyleFallbackDirective, StyleFallbackService } from 'shared-lib';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-card',
  standalone: true,
  imports: [CommonModule, StyleFallbackDirective],
  template: `
    <div 
      [libStyleFallback]="cardFallbackStyles()"
      [criticalStyles]="true"
      class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      
      @if (imageUrl()) {
        <img 
          [src]="imageUrl()" 
          [alt]="imageAlt()"
          [libStyleFallback]="imageFallbackStyles()"
          class="w-full h-48 object-cover">
      }
      
      <div 
        [libStyleFallback]="contentFallbackStyles()"
        class="p-6">
        
        @if (title()) {
          <h3 
            [libStyleFallback]="titleFallbackStyles()"
            class="text-xl font-semibold text-gray-900 mb-2">
            {{ title() }}
          </h3>
        }
        
        @if (description()) {
          <p 
            [libStyleFallback]="descriptionFallbackStyles()"
            class="text-gray-600 mb-4">
            {{ description() }}
          </p>
        }
        
        <div 
          [libStyleFallback]="actionsFallbackStyles()"
          class="flex justify-end space-x-2">
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class CustomCardComponent {
  // Inputs
  title = input<string>('');
  description = input<string>('');
  imageUrl = input<string>('');
  imageAlt = input<string>('');
  
  constructor(private styleFallbackService: StyleFallbackService) {}
  
  // Fallback styles for different parts
  cardFallbackStyles = computed(() => {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) return {};
    
    return {
      'background-color': 'white',
      'border-radius': '0.5rem',
      'box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      'border': '1px solid #e5e7eb',
      'overflow': 'hidden'
    };
  });
  
  imageFallbackStyles = computed(() => {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) return {};
    
    return {
      'width': '100%',
      'height': '12rem',
      'object-fit': 'cover'
    };
  });
  
  contentFallbackStyles = computed(() => {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) return {};
    
    return {
      'padding': '1.5rem'
    };
  });
  
  titleFallbackStyles = computed(() => {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) return {};
    
    return {
      'font-size': '1.25rem',
      'font-weight': '600',
      'color': '#111827',
      'margin-bottom': '0.5rem'
    };
  });
  
  descriptionFallbackStyles = computed(() => {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) return {};
    
    return {
      'color': '#4b5563',
      'margin-bottom': '1rem'
    };
  });
  
  actionsFallbackStyles = computed(() => {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) return {};
    
    return {
      'display': 'flex',
      'justify-content': 'flex-end',
      'gap': '0.5rem'
    };
  });
}
```

## Custom Modal Component

```typescript
import { Component, input, output, computed, effect } from '@angular/core';
import { StyleFallbackDirective, StyleFallbackService } from 'shared-lib';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-modal',
  standalone: true,
  imports: [CommonModule, StyleFallbackDirective],
  template: `
    @if (isOpen()) {
      <!-- Backdrop -->
      <div 
        [libStyleFallback]="backdropFallbackStyles()"
        [criticalStyles]="true"
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        (click)="onBackdropClick()">
        
        <!-- Modal -->
        <div 
          [libStyleFallback]="modalFallbackStyles()"
          [criticalStyles]="true"
          class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden"
          (click)="$event.stopPropagation()">
          
          <!-- Header -->
          @if (title()) {
            <div 
              [libStyleFallback]="headerFallbackStyles()"
              class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 
                [libStyleFallback]="titleFallbackStyles()"
                class="text-lg font-semibold text-gray-900">
                {{ title() }}
              </h2>
              
              <button 
                [libStyleFallback]="closeFallbackStyles()"
                class="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                (click)="close()">
                ×
              </button>
            </div>
          }
          
          <!-- Content -->
          <div 
            [libStyleFallback]="contentFallbackStyles()"
            class="px-6 py-4 overflow-y-auto">
            <ng-content></ng-content>
          </div>
          
          <!-- Footer -->
          <div 
            [libStyleFallback]="footerFallbackStyles()"
            class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
            <ng-content select="[slot=footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `
})
export class CustomModalComponent {
  // Inputs
  isOpen = input<boolean>(false);
  title = input<string>('');
  closeOnBackdrop = input<boolean>(true);
  
  // Outputs
  closeModal = output<void>();
  
  constructor(private styleFallbackService: StyleFallbackService) {
    // Handle body scroll when modal is open
    effect(() => {
      if (typeof document !== 'undefined') {
        if (this.isOpen()) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    });
  }
  
  onBackdropClick() {
    if (this.closeOnBackdrop()) {
      this.close();
    }
  }
  
  close() {
    this.closeModal.emit();
  }
  
  // Fallback styles
  backdropFallbackStyles = computed(() => {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) return {};
    
    return {
      'position': 'fixed',
      'top': '0',
      'left': '0',
      'right': '0',
      'bottom': '0',
      'background-color': 'rgba(0, 0, 0, 0.5)',
      'z-index': '50',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'padding': '1rem'
    };
  });
  
  modalFallbackStyles = computed(() => {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) return {};
    
    return {
      'background-color': 'white',
      'border-radius': '0.5rem',
      'box-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      'max-width': '28rem',
      'width': '100%',
      'max-height': '24rem',
      'overflow': 'hidden'
    };
  });
  
  headerFallbackStyles = computed(() => {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) return {};
    
    return {
      'padding': '1.5rem 1.5rem 1rem 1.5rem',
      'border-bottom': '1px solid #e5e7eb',
      'display': 'flex',
      'justify-content': 'space-between',
      'align-items': 'center'
    };
  });
  
  titleFallbackStyles = computed(() => {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) return {};
    
    return {
      'font-size': '1.125rem',
      'font-weight': '600',
      'color': '#111827'
    };
  });
  
  closeFallbackStyles = computed(() => {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) return {};
    
    return {
      'color': '#9ca3af',
      'font-size': '1.5rem',
      'line-height': '1',
      'background': 'none',
      'border': 'none',
      'cursor': 'pointer',
      'padding': '0'
    };
  });
  
  contentFallbackStyles = computed(() => {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) return {};
    
    return {
      'padding': '1.5rem',
      'overflow-y': 'auto'
    };
  });
  
  footerFallbackStyles = computed(() => {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) return {};
    
    return {
      'padding': '1rem 1.5rem 1.5rem 1.5rem',
      'border-top': '1px solid #e5e7eb',
      'display': 'flex',
      'justify-content': 'flex-end',
      'gap': '0.5rem'
    };
  });
}
```

## Usage Examples

```typescript
import { Component, signal } from '@angular/core';
import { CustomButtonComponent } from './custom-button.component';
import { CustomCardComponent } from './custom-card.component';
import { CustomModalComponent } from './custom-modal.component';

@Component({
  selector: 'app-custom-examples',
  standalone: true,
  imports: [CustomButtonComponent, CustomCardComponent, CustomModalComponent],
  template: `
    <div class="examples">
      <h2>Custom Components with Fallbacks</h2>
      
      <!-- Buttons -->
      <section>
        <h3>Custom Buttons</h3>
        <div class="button-group">
          <app-custom-button variant="primary" size="sm">Small Primary</app-custom-button>
          <app-custom-button variant="secondary" size="md">Medium Secondary</app-custom-button>
          <app-custom-button variant="danger" size="lg">Large Danger</app-custom-button>
          <app-custom-button variant="primary" [disabled]="true">Disabled</app-custom-button>
        </div>
      </section>
      
      <!-- Cards -->
      <section>
        <h3>Custom Cards</h3>
        <div class="card-grid">
          <app-custom-card
            title="Example Card"
            description="This is an example card with fallback styles."
            imageUrl="https://via.placeholder.com/300x200">
            <div slot="actions">
              <app-custom-button variant="secondary" size="sm">Cancel</app-custom-button>
              <app-custom-button variant="primary" size="sm">Save</app-custom-button>
            </div>
          </app-custom-card>
        </div>
      </section>
      
      <!-- Modal -->
      <section>
        <h3>Custom Modal</h3>
        <app-custom-button 
          variant="primary" 
          (click)="showModal.set(true)">
          Open Modal
        </app-custom-button>
        
        <app-custom-modal
          [isOpen]="showModal()"
          title="Example Modal"
          (closeModal)="showModal.set(false)">
          <p>This is modal content with fallback styles.</p>
          
          <div slot="footer">
            <app-custom-button 
              variant="secondary" 
              size="sm"
              (click)="showModal.set(false)">
              Cancel
            </app-custom-button>
            <app-custom-button 
              variant="primary" 
              size="sm">
              Confirm
            </app-custom-button>
          </div>
        </app-custom-modal>
      </section>
    </div>
  `,
  styles: [`
    .examples {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    section {
      margin: 2rem 0;
    }
    
    .button-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }
  `]
})
export class CustomExamplesComponent {
  showModal = signal(false);
}
```

## Key Concepts

### 1. Computed Fallback Styles

Use Angular's `computed()` to create reactive fallback styles that respond to service state changes.

### 2. Critical Styles

Mark important styles as critical to ensure they're applied even when detection is uncertain.

### 3. Progressive Enhancement

Design components to work with fallback styles first, then enhance with Tailwind classes.

### 4. Conditional Application

Only apply fallback styles when needed to minimize performance impact.

### 5. Semantic Styling

Use meaningful CSS properties and values that work across different environments.
import { 
  Component, 
  ChangeDetectionStrategy, 
  input,
  inject,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';
import { StyleFallbackDirective } from '../../directives/style-fallback.directive';
import { StyleFallbackService } from '../../services/style-fallback.service';

/**
 * Loading states and skeleton components with style fallback support
 */
@Component({
  selector: 'lib-loading',
  standalone: true,
  imports: [CommonModule, StyleFallbackDirective],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent extends BaseComponent {
  private readonly styleFallbackService = inject(StyleFallbackService);
  
  // Input properties
  type = input<'spinner' | 'skeleton' | 'dots' | 'pulse'>('spinner');
  size = input<'sm' | 'md' | 'lg'>('md');
  message = input<string>('');
  
  // Skeleton-specific inputs
  lines = input<number>(3);
  showAvatar = input<boolean>(false);
  
  // Computed fallback styles based on component state
  fallbackStyles = computed((): Record<string, string> => {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) {
      return {};
    }
    
    return {
      'display': 'flex',
      'flex-direction': 'column',
      'align-items': 'center',
      'justify-content': 'center',
      '--loading-primary-color': '#3b82f6',
      '--loading-secondary-color': '#e5e7eb',
      '--loading-text-color': '#4b5563'
    };
  });
  
  // Computed fallback classes
  fallbackClasses = computed(() => {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) {
      return [];
    }
    
    return ['lib-flex', 'lib-flex-col', 'lib-items-center', 'lib-justify-center'];
  });
  
  // Helper method for template
  protected getLines(): number[] {
    return Array(this.lines()).fill(0);
  }
  
  // Get spinner fallback styles
  getSpinnerFallbackStyles(): Record<string, string> {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) {
      return {};
    }
    
    const size = this.size();
    let dimensions = '2rem';
    let borderWidth = '4px';
    
    switch (size) {
      case 'sm':
        dimensions = '1rem';
        borderWidth = '2px';
        break;
      case 'lg':
        dimensions = '3rem';
        borderWidth = '4px';
        break;
    }
    
    return {
      'width': dimensions,
      'height': dimensions,
      'border': `${borderWidth} solid var(--loading-secondary-color, #e5e7eb)`,
      'border-top-color': 'var(--loading-primary-color, #3b82f6)',
      'border-radius': '50%',
      'animation': 'lib-spin 1s linear infinite'
    };
  }
  
  // Get dots fallback styles
  getDotsFallbackStyles(): Record<string, string> {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) {
      return {};
    }
    
    const size = this.size();
    let dimensions = '0.75rem';
    
    switch (size) {
      case 'sm':
        dimensions = '0.5rem';
        break;
      case 'lg':
        dimensions = '1rem';
        break;
    }
    
    return {
      'width': dimensions,
      'height': dimensions,
      'background-color': 'var(--loading-primary-color, #3b82f6)',
      'border-radius': '50%',
      'animation': 'lib-bounce 1s infinite'
    };
  }
  
  // Get pulse fallback styles
  getPulseFallbackStyles(): Record<string, string> {
    const needsFallback = this.styleFallbackService.needsFallback();
    
    if (!needsFallback) {
      return {};
    }
    
    const size = this.size();
    let dimensions = '2rem';
    
    switch (size) {
      case 'sm':
        dimensions = '1rem';
        break;
      case 'lg':
        dimensions = '3rem';
        break;
    }
    
    return {
      'width': dimensions,
      'height': dimensions,
      'background-color': 'var(--loading-primary-color, #3b82f6)',
      'border-radius': '50%',
      'animation': 'lib-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    };
  }
}
/**
 * Style Fallback Directive
 * 
 * Provides automatic fallback styling for components when Tailwind CSS is not available.
 * Can be applied to any element to ensure it has proper styling regardless of CSS loading state.
 */

import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  inject,
  effect,
  signal,
  computed
} from '@angular/core';
import { StyleFallbackService } from '../services/style-fallback.service';

export interface FallbackStyleMap {
  [className: string]: string;
}

@Directive({
  selector: '[libStyleFallback]',
  standalone: true
})
export class StyleFallbackDirective implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly styleFallbackService = inject(StyleFallbackService);
  
  // Input properties
  @Input('libStyleFallback') fallbackStyles: FallbackStyleMap | string = {};
  @Input() fallbackClasses: string[] = [];
  @Input() criticalStyles: boolean = false;
  @Input() forceApply: boolean = false;
  
  // Internal signals
  private readonly _appliedStyles = signal<string[]>([]);
  private readonly _isActive = signal<boolean>(false);
  
  // Computed properties
  private readonly shouldApplyFallbacks = computed(() => {
    const serviceState = this.styleFallbackService.state();
    const needsFallback = this.styleFallbackService.needsFallback();
    
    return this.forceApply || 
           (serviceState.isInitialized && needsFallback) ||
           (this.criticalStyles && !this.styleFallbackService.isStylesLoaded());
  });
  
  constructor() {
    // Set up reactive effect for applying/removing fallbacks
    effect(() => {
      if (this.shouldApplyFallbacks()) {
        this.applyFallbacks();
      } else {
        this.removeFallbacks();
      }
    });
  }
  
  ngOnInit(): void {
    // Force initial detection if service is not ready
    if (!this.styleFallbackService.isReady()) {
      this.styleFallbackService.forceDetection();
    }
  }
  
  ngOnDestroy(): void {
    this.removeFallbacks();
  }
  
  /**
   * Apply fallback styles to the element
   */
  private applyFallbacks(): void {
    if (this._isActive()) {
      return; // Already applied
    }
    
    const element = this.elementRef.nativeElement;
    const fallbackStyles = this.parseFallbackStyles();
    const appliedStyles: string[] = [];
    
    // Apply inline styles
    Object.entries(fallbackStyles).forEach(([property, value]) => {
      if (property.startsWith('--')) {
        // CSS custom property
        element.style.setProperty(property, value);
      } else {
        // Regular CSS property
        const camelCaseProperty = this.kebabToCamelCase(property);
        if (camelCaseProperty in element.style) {
          (element.style as any)[camelCaseProperty] = value;
        }
      }
      appliedStyles.push(property);
    });
    
    // Apply fallback classes
    this.fallbackClasses.forEach(className => {
      if (!element.classList.contains(className)) {
        element.classList.add(className);
        appliedStyles.push(`class:${className}`);
      }
    });
    
    // Add fallback indicator attribute
    element.setAttribute('data-lib-fallback', 'active');
    
    this._appliedStyles.set(appliedStyles);
    this._isActive.set(true);
  }
  
  /**
   * Remove fallback styles from the element
   */
  private removeFallbacks(): void {
    if (!this._isActive()) {
      return; // Not applied
    }
    
    const element = this.elementRef.nativeElement;
    const appliedStyles = this._appliedStyles();
    
    // Remove applied styles
    appliedStyles.forEach(styleKey => {
      if (styleKey.startsWith('class:')) {
        const className = styleKey.substring(6);
        element.classList.remove(className);
      } else {
        if (styleKey.startsWith('--')) {
          element.style.removeProperty(styleKey);
        } else {
          const camelCaseProperty = this.kebabToCamelCase(styleKey);
          if (camelCaseProperty in element.style) {
            (element.style as any)[camelCaseProperty] = '';
          }
        }
      }
    });
    
    // Remove fallback indicator attribute
    element.removeAttribute('data-lib-fallback');
    
    this._appliedStyles.set([]);
    this._isActive.set(false);
  }
  
  /**
   * Parse fallback styles input
   */
  private parseFallbackStyles(): Record<string, string> {
    if (typeof this.fallbackStyles === 'string') {
      return this.parseStyleString(this.fallbackStyles);
    }
    
    return this.fallbackStyles || {};
  }
  
  /**
   * Parse CSS style string into object
   */
  private parseStyleString(styleString: string): Record<string, string> {
    const styles: Record<string, string> = {};
    
    styleString.split(';').forEach(declaration => {
      const [property, value] = declaration.split(':').map(s => s.trim());
      if (property && value) {
        styles[property] = value;
      }
    });
    
    return styles;
  }
  
  /**
   * Convert kebab-case to camelCase
   */
  private kebabToCamelCase(kebabCase: string): string {
    return kebabCase.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  }
}
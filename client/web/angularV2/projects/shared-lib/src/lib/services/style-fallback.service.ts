/**
 * Style Fallback Service
 * 
 * Manages style loading detection and fallback mechanisms for library components.
 * Ensures components work correctly even when Tailwind CSS is not available.
 */

import { Injectable, signal, computed, effect, DestroyRef, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  detectStyleCapabilities,
  applyFallbackStyles,
  removeFallbackStyles,
  createFallbackStyles,
  DEFAULT_FALLBACK_STYLES,
  FALLBACK_KEYFRAMES,
  type StyleDetectionResult,
  type StyleFallbackConfig
} from '../utils/style-detection.utils';

export interface StyleFallbackState {
  isInitialized: boolean;
  detectionResult: StyleDetectionResult | null;
  fallbacksActive: boolean;
  lastDetectionTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class StyleFallbackService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  
  // Signals for reactive state management
  private readonly _state = signal<StyleFallbackState>({
    isInitialized: false,
    detectionResult: null,
    fallbacksActive: false,
    lastDetectionTime: 0
  });
  
  private readonly _config = signal<StyleFallbackConfig>(DEFAULT_FALLBACK_STYLES);
  
  // Public readonly signals
  public readonly state = this._state.asReadonly();
  public readonly config = this._config.asReadonly();
  
  // Computed signals
  public readonly isStylesLoaded = computed(() => {
    const result = this._state().detectionResult;
    return result ? result.tailwindLoaded && result.animationsSupported : false;
  });
  
  public readonly needsFallback = computed(() => {
    const result = this._state().detectionResult;
    return result ? result.fallbackRequired : true;
  });
  
  public readonly isReady = computed(() => {
    return this._state().isInitialized;
  });
  
  private mutationObserver?: MutationObserver;
  
  constructor() {
    // Initialize detection on service creation
    this.initializeDetection();
    
    // Set up reactive effects
    this.setupEffects();
    
    // Clean up on destroy
    this.destroyRef.onDestroy(() => {
      this.cleanup();
    });
  }
  
  /**
   * Initialize style detection
   */
  private initializeDetection(): void {
    if (typeof window === 'undefined') {
      // SSR environment - assume fallbacks are needed
      this._state.update(state => ({
        ...state,
        isInitialized: true,
        detectionResult: {
          tailwindLoaded: false,
          animationsSupported: false,
          customPropertiesSupported: false,
          fallbackRequired: true
        },
        fallbacksActive: true,
        lastDetectionTime: Date.now()
      }));
      return;
    }
    
    // Perform initial detection
    this.performDetection();
    
    // Set up observers for dynamic detection
    this.setupObservers();
  }
  
  /**
   * Perform style detection
   */
  private performDetection(): void {
    const result = detectStyleCapabilities();
    const currentState = this._state();
    const needsUpdate = !currentState.detectionResult || 
      JSON.stringify(currentState.detectionResult) !== JSON.stringify(result);
    
    if (needsUpdate) {
      this._state.update(state => ({
        ...state,
        isInitialized: true,
        detectionResult: result,
        lastDetectionTime: Date.now()
      }));
    }
  }
  
  /**
   * Set up reactive effects
   */
  private setupEffects(): void {
    // Effect to manage fallback styles based on detection results
    effect(() => {
      const state = this._state();
      const config = this._config();
      
      if (!state.isInitialized || !state.detectionResult) {
        return;
      }
      
      const shouldActivateFallbacks = state.detectionResult.fallbackRequired && config.enableFallbacks;
      
      if (shouldActivateFallbacks && !state.fallbacksActive) {
        this.activateFallbacks();
      } else if (!shouldActivateFallbacks && state.fallbacksActive) {
        this.deactivateFallbacks();
      }
    });
  }
  
  /**
   * Set up observers for dynamic style detection
   */
  private setupObservers(): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    // Observe DOM mutations that might affect styles
    if ('MutationObserver' in window) {
      this.mutationObserver = new MutationObserver((mutations) => {
        const hasStyleChanges = mutations.some(mutation => 
          mutation.type === 'childList' && 
          Array.from(mutation.addedNodes).some(node => 
            node.nodeType === Node.ELEMENT_NODE && 
            (node as Element).tagName === 'STYLE' || 
            (node as Element).tagName === 'LINK'
          )
        );
        
        if (hasStyleChanges) {
          this.performDetection();
        }
      });
      
      this.mutationObserver.observe(this.document.head, {
        childList: true,
        subtree: true
      });
    }
    
    // Listen for window resize (might affect CSS loading)
    window.addEventListener('resize', () => {
      this.performDetection();
    }, { passive: true });
    
    // Listen for load events
    window.addEventListener('load', () => {
      this.performDetection();
    }, { once: true });
  }
  
  /**
   * Activate fallback styles
   */
  private activateFallbacks(): void {
    const config = this._config();
    
    if (!config.enableFallbacks) {
      return;
    }
    
    // Create fallback CSS
    const fallbackCSS = createFallbackStyles(config) + FALLBACK_KEYFRAMES;
    
    // Apply fallback styles
    applyFallbackStyles(fallbackCSS, 'lib-style-fallbacks');
    
    // Update state
    this._state.update(state => ({
      ...state,
      fallbacksActive: true
    }));
    
    console.info('Style fallbacks activated for library components');
  }
  
  /**
   * Deactivate fallback styles
   */
  private deactivateFallbacks(): void {
    removeFallbackStyles('lib-style-fallbacks');
    
    this._state.update(state => ({
      ...state,
      fallbacksActive: false
    }));
    
    console.info('Style fallbacks deactivated - native styles loaded');
  }
  
  /**
   * Update fallback configuration
   */
  public updateConfig(config: Partial<StyleFallbackConfig>): void {
    this._config.update(currentConfig => ({
      ...currentConfig,
      ...config
    }));
  }
  
  /**
   * Force re-detection of styles
   */
  public forceDetection(): void {
    this.performDetection();
  }
  
  /**
   * Get current detection result
   */
  public getDetectionResult(): StyleDetectionResult | null {
    return this._state().detectionResult;
  }
  
  /**
   * Check if specific feature is supported
   */
  public isFeatureSupported(feature: keyof StyleDetectionResult): boolean {
    const result = this._state().detectionResult;
    return result ? result[feature] : false;
  }
  
  /**
   * Cleanup observers and resources
   */
  private cleanup(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = undefined;
    }
    
    // Remove fallback styles
    removeFallbackStyles('lib-style-fallbacks');
  }
}
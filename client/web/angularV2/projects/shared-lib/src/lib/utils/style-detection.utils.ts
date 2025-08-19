/**
 * Style Detection Utilities
 * 
 * Provides utilities for detecting if CSS styles are properly loaded
 * and implementing fallback mechanisms for library components.
 */

export interface StyleDetectionResult {
  tailwindLoaded: boolean;
  animationsSupported: boolean;
  customPropertiesSupported: boolean;
  fallbackRequired: boolean;
}

export interface StyleFallbackConfig {
  enableFallbacks: boolean;
  fallbackStyles: Record<string, string>;
  criticalClasses: string[];
}

/**
 * Detects if Tailwind CSS classes are properly loaded
 */
export function detectTailwindLoading(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false; // SSR environment
  }

  try {
    // Create a test element with Tailwind classes
    const testElement = document.createElement('div');
    testElement.className = 'flex items-center justify-center';
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.style.pointerEvents = 'none';
    
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    
    // Check if Tailwind classes are applied
    const hasFlexDisplay = computedStyle.display === 'flex';
    const hasAlignItems = computedStyle.alignItems === 'center';
    const hasJustifyContent = computedStyle.justifyContent === 'center';
    
    document.body.removeChild(testElement);
    
    return hasFlexDisplay && hasAlignItems && hasJustifyContent;
  } catch (error) {
    console.warn('Failed to detect Tailwind loading:', error);
    return false;
  }
}

/**
 * Detects if CSS animations are supported
 */
export function detectAnimationSupport(): boolean {
  if (typeof window === 'undefined') {
    return false; // SSR environment
  }

  try {
    const testElement = document.createElement('div');
    const animationProperties = [
      'animation',
      'webkitAnimation',
      'mozAnimation',
      'oAnimation',
      'msAnimation'
    ];
    
    return animationProperties.some(property => 
      property in testElement.style
    );
  } catch (error) {
    console.warn('Failed to detect animation support:', error);
    return false;
  }
}

/**
 * Detects if CSS custom properties (variables) are supported
 */
export function detectCustomPropertiesSupport(): boolean {
  if (typeof window === 'undefined' || typeof CSS === 'undefined') {
    return false; // SSR environment
  }

  try {
    return CSS.supports && CSS.supports('color', 'var(--test)');
  } catch (error) {
    console.warn('Failed to detect custom properties support:', error);
    return false;
  }
}

/**
 * Comprehensive style detection
 */
export function detectStyleCapabilities(): StyleDetectionResult {
  const tailwindLoaded = detectTailwindLoading();
  const animationsSupported = detectAnimationSupport();
  const customPropertiesSupported = detectCustomPropertiesSupport();
  
  const fallbackRequired = !tailwindLoaded || !animationsSupported || !customPropertiesSupported;
  
  return {
    tailwindLoaded,
    animationsSupported,
    customPropertiesSupported,
    fallbackRequired
  };
}

/**
 * Creates fallback styles for components when Tailwind is not available
 */
export function createFallbackStyles(config: StyleFallbackConfig): string {
  if (!config.enableFallbacks) {
    return '';
  }

  const fallbackCSS = Object.entries(config.fallbackStyles)
    .map(([selector, styles]) => `${selector} { ${styles} }`)
    .join('\n');

  return fallbackCSS;
}

/**
 * Applies fallback styles dynamically
 */
export function applyFallbackStyles(fallbackCSS: string, id: string = 'lib-fallback-styles'): void {
  if (typeof document === 'undefined') {
    return; // SSR environment
  }

  // Remove existing fallback styles
  const existingStyle = document.getElementById(id);
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create and append new fallback styles
  const styleElement = document.createElement('style');
  styleElement.id = id;
  styleElement.textContent = fallbackCSS;
  document.head.appendChild(styleElement);
}

/**
 * Removes fallback styles
 */
export function removeFallbackStyles(id: string = 'lib-fallback-styles'): void {
  if (typeof document === 'undefined') {
    return;
  }

  const styleElement = document.getElementById(id);
  if (styleElement) {
    styleElement.remove();
  }
}

/**
 * Default fallback styles for common library components
 */
export const DEFAULT_FALLBACK_STYLES: StyleFallbackConfig = {
  enableFallbacks: true,
  fallbackStyles: {
    '.lib-flex': 'display: flex;',
    '.lib-flex-col': 'flex-direction: column;',
    '.lib-items-center': 'align-items: center;',
    '.lib-justify-center': 'justify-content: center;',
    '.lib-relative': 'position: relative;',
    '.lib-absolute': 'position: absolute;',
    '.lib-w-full': 'width: 100%;',
    '.lib-h-full': 'height: 100%;',
    '.lib-rounded': 'border-radius: 0.25rem;',
    '.lib-rounded-full': 'border-radius: 9999px;',
    '.lib-border': 'border-width: 1px;',
    '.lib-bg-gray-200': 'background-color: #e5e7eb;',
    '.lib-text-gray-600': 'color: #4b5563;',
    '.lib-animate-spin': 'animation: lib-spin 1s linear infinite;',
    '.lib-animate-pulse': 'animation: lib-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;',
    '.lib-animate-bounce': 'animation: lib-bounce 1s infinite;'
  },
  criticalClasses: [
    'lib-flex',
    'lib-items-center',
    'lib-justify-center',
    'lib-animate-spin',
    'lib-animate-pulse',
    'lib-animate-bounce'
  ]
};

/**
 * CSS keyframes for fallback animations
 */
export const FALLBACK_KEYFRAMES = `
@keyframes lib-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes lib-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes lib-bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
`;
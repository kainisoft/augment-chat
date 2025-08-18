/**
 * CSS custom properties utilities for dynamic theming
 */

import { ThemeConfig, CSSCustomProperties } from '../models/theme.model';
import { hexToRgb } from './palette-generation.utils';

/**
 * Generate CSS custom properties from theme configuration
 */
export function generateCSSProperties(theme: ThemeConfig): CSSCustomProperties {
  const properties: CSSCustomProperties = {};

  // Primary color palette
  Object.entries(theme.primary).forEach(([shade, color]) => {
    if (shade === 'contrast') {
      Object.entries(color as any).forEach(([contrastShade, contrastColor]) => {
        properties[`--fuse-primary-contrast-${contrastShade}`] = hexToRgb(contrastColor as string);
      });
    } else {
      properties[`--fuse-primary-${shade}`] = hexToRgb(color as string);
    }
  });

  // Accent color palette
  Object.entries(theme.accent).forEach(([shade, color]) => {
    if (shade === 'contrast') {
      Object.entries(color as any).forEach(([contrastShade, contrastColor]) => {
        properties[`--fuse-accent-contrast-${contrastShade}`] = hexToRgb(contrastColor as string);
      });
    } else {
      properties[`--fuse-accent-${shade}`] = hexToRgb(color as string);
    }
  });

  // Warn color palette
  Object.entries(theme.warn).forEach(([shade, color]) => {
    if (shade === 'contrast') {
      Object.entries(color as any).forEach(([contrastShade, contrastColor]) => {
        properties[`--fuse-warn-contrast-${contrastShade}`] = hexToRgb(contrastColor as string);
      });
    } else {
      properties[`--fuse-warn-${shade}`] = hexToRgb(color as string);
    }
  });

  // Background palette
  Object.entries(theme.background).forEach(([key, color]) => {
    properties[`--fuse-${key}`] = hexToRgb(color);
  });

  // Foreground palette
  Object.entries(theme.foreground).forEach(([key, color]) => {
    properties[`--fuse-${key}`] = hexToRgb(color);
  });

  // Theme metadata
  properties['--fuse-theme-name'] = `"${theme.name}"`;
  properties['--fuse-theme-display-name'] = `"${theme.displayName}"`;
  properties['--fuse-theme-is-dark'] = theme.isDark ? '1' : '0';

  return properties;
}

/**
 * Apply CSS custom properties to the document root
 */
export function applyCSSProperties(properties: CSSCustomProperties): void {
  const root = document.documentElement;
  
  Object.entries(properties).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

/**
 * Remove CSS custom properties from the document root
 */
export function removeCSSProperties(properties: string[]): void {
  const root = document.documentElement;
  
  properties.forEach(property => {
    root.style.removeProperty(property);
  });
}

/**
 * Get current CSS custom property value
 */
export function getCSSProperty(property: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(property)
    .trim();
}

/**
 * Set a single CSS custom property
 */
export function setCSSProperty(property: string, value: string): void {
  document.documentElement.style.setProperty(property, value);
}

/**
 * Generate CSS variables string for injection
 */
export function generateCSSVariablesString(properties: CSSCustomProperties): string {
  const cssRules = Object.entries(properties)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n');

  return `:root {\n${cssRules}\n}`;
}

/**
 * Inject CSS variables into a style element
 */
export function injectCSSVariables(
  properties: CSSCustomProperties,
  styleId: string = 'fuse-theme-variables'
): void {
  // Remove existing style element if it exists
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create new style element
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = generateCSSVariablesString(properties);
  
  // Append to head
  document.head.appendChild(style);
}

/**
 * Create CSS custom properties for theme transitions
 */
export function createThemeTransitionProperties(): CSSCustomProperties {
  return {
    '--fuse-theme-transition-duration': '300ms',
    '--fuse-theme-transition-timing': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--fuse-theme-transition-property': 'background-color, border-color, color, fill, stroke',
  };
}

/**
 * Apply theme transition styles
 */
export function applyThemeTransitions(): void {
  const transitionProperties = createThemeTransitionProperties();
  applyCSSProperties(transitionProperties);

  // Add transition class to body
  document.body.classList.add('fuse-theme-transitions');
}

/**
 * Remove theme transition styles
 */
export function removeThemeTransitions(): void {
  document.body.classList.remove('fuse-theme-transitions');
}

/**
 * Generate CSS for theme-aware components
 */
export function generateThemeAwareCSS(): string {
  return `
    .fuse-theme-transitions * {
      transition: var(--fuse-theme-transition-property) var(--fuse-theme-transition-duration) var(--fuse-theme-transition-timing);
    }

    .fuse-theme-transitions *:before,
    .fuse-theme-transitions *:after {
      transition: var(--fuse-theme-transition-property) var(--fuse-theme-transition-duration) var(--fuse-theme-transition-timing);
    }

    /* Disable transitions during theme switching to prevent flicker */
    .fuse-theme-switching * {
      transition: none !important;
    }

    /* Theme-aware scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: rgb(var(--fuse-bg-default));
    }

    ::-webkit-scrollbar-thumb {
      background: rgb(var(--fuse-primary-300));
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgb(var(--fuse-primary-400));
    }

    /* Theme-aware selection */
    ::selection {
      background: rgb(var(--fuse-primary-200));
      color: rgb(var(--fuse-primary-contrast-200));
    }

    ::-moz-selection {
      background: rgb(var(--fuse-primary-200));
      color: rgb(var(--fuse-primary-contrast-200));
    }
  `;
}

/**
 * Validate CSS custom properties
 */
export function validateCSSProperties(properties: CSSCustomProperties): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  Object.entries(properties).forEach(([property, value]) => {
    // Check property name format
    if (!property.startsWith('--')) {
      errors.push(`Invalid property name: ${property}. CSS custom properties must start with '--'`);
    }

    // Check for empty values
    if (!value || value.trim() === '') {
      errors.push(`Empty value for property: ${property}`);
    }

    // Check for invalid characters in property names
    if (!/^--[a-zA-Z0-9-_]+$/.test(property)) {
      errors.push(`Invalid characters in property name: ${property}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get all Fuse theme CSS properties from the document
 */
export function getAllFuseThemeProperties(): CSSCustomProperties {
  const properties: CSSCustomProperties = {};
  const computedStyles = getComputedStyle(document.documentElement);

  // Get all CSS custom properties that start with --fuse-
  for (let i = 0; i < computedStyles.length; i++) {
    const property = computedStyles[i];
    if (property.startsWith('--fuse-')) {
      properties[property] = computedStyles.getPropertyValue(property).trim();
    }
  }

  return properties;
}

/**
 * Create a CSS custom property name from a theme key
 */
export function createPropertyName(prefix: string, key: string): string {
  return `--fuse-${prefix}-${key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}`;
}

/**
 * Parse RGB values from CSS custom property
 */
export function parseRGBFromProperty(property: string): { r: number; g: number; b: number } | null {
  const value = getCSSProperty(property);
  const match = value.match(/(\d+)\s+(\d+)\s+(\d+)/);
  
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    };
  }
  
  return null;
}
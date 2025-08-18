/**
 * Fuse-inspired theming plugin for Tailwind CSS
 */

import plugin from 'tailwindcss/plugin';
import { generateCSSVariablesString } from '../utils/css-properties.utils';
import { THEME_CONFIGURATIONS } from '../configs/theme.config';

/**
 * Fuse theming plugin for Tailwind CSS
 */
export const fuseThemePlugin = plugin(
  function({ addBase, addUtilities, addComponents, theme }) {
    // Add base CSS custom properties for all themes
    const baseStyles: Record<string, any> = {};
    
    // Generate CSS variables for all predefined themes
    Object.values(THEME_CONFIGURATIONS).forEach(variant => {
      [variant.light, variant.dark].forEach(themeConfig => {
        const selector = themeConfig.isDark 
          ? `.dark[data-theme="${themeConfig.name}"], [data-theme="${themeConfig.name}"].dark`
          : `.light[data-theme="${themeConfig.name}"], [data-theme="${themeConfig.name}"].light, [data-theme="${themeConfig.name}"]`;
        
        baseStyles[selector] = generateThemeVariables(themeConfig);
      });
    });

    // Add default theme variables to :root
    const defaultTheme = THEME_CONFIGURATIONS['default'].light;
    baseStyles[':root'] = generateThemeVariables(defaultTheme);

    // Add base styles
    addBase(baseStyles);

    // Add theme transition utilities
    addUtilities({
      '.theme-transition': {
        'transition-property': 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
        'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'transition-duration': '150ms',
      },
      '.theme-transition-colors': {
        'transition-property': 'background-color, border-color, color, fill, stroke',
        'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'transition-duration': '150ms',
      },
      '.theme-transition-fast': {
        'transition-duration': '75ms',
      },
      '.theme-transition-slow': {
        'transition-duration': '300ms',
      },
    });

    // Add theme-aware component utilities
    addComponents({
      '.fuse-card': {
        'background-color': 'rgb(var(--fuse-bg-card) / <alpha-value>)',
        'color': 'rgb(var(--fuse-text-default) / <alpha-value>)',
        'border-color': 'rgb(var(--fuse-border) / <alpha-value>)',
        'box-shadow': theme('boxShadow.sm'),
        'border-radius': theme('borderRadius.lg'),
        'border-width': '1px',
        'padding': theme('spacing.6'),
      },
      '.fuse-card-header': {
        'border-bottom': '1px solid rgb(var(--fuse-divider) / 0.12)',
        'padding-bottom': theme('spacing.4'),
        'margin-bottom': theme('spacing.4'),
      },
      '.fuse-button-primary': {
        'background-color': 'rgb(var(--fuse-primary-500) / <alpha-value>)',
        'color': 'rgb(var(--fuse-primary-contrast-500) / <alpha-value>)',
        'border-color': 'rgb(var(--fuse-primary-500) / <alpha-value>)',
        '&:hover': {
          'background-color': 'rgb(var(--fuse-primary-600) / <alpha-value>)',
          'border-color': 'rgb(var(--fuse-primary-600) / <alpha-value>)',
        },
        '&:active': {
          'background-color': 'rgb(var(--fuse-primary-700) / <alpha-value>)',
          'border-color': 'rgb(var(--fuse-primary-700) / <alpha-value>)',
        },
        '&:focus': {
          'box-shadow': `0 0 0 3px rgb(var(--fuse-primary-200) / 0.5)`,
        },
        '&:disabled': {
          'background-color': 'rgb(var(--fuse-text-disabled) / <alpha-value>)',
          'color': 'rgb(var(--fuse-text-hint) / <alpha-value>)',
          'border-color': 'rgb(var(--fuse-text-disabled) / <alpha-value>)',
          'cursor': 'not-allowed',
        },
      },
      '.fuse-button-accent': {
        'background-color': 'rgb(var(--fuse-accent-500) / <alpha-value>)',
        'color': 'rgb(var(--fuse-accent-contrast-500) / <alpha-value>)',
        'border-color': 'rgb(var(--fuse-accent-500) / <alpha-value>)',
        '&:hover': {
          'background-color': 'rgb(var(--fuse-accent-600) / <alpha-value>)',
          'border-color': 'rgb(var(--fuse-accent-600) / <alpha-value>)',
        },
        '&:active': {
          'background-color': 'rgb(var(--fuse-accent-700) / <alpha-value>)',
          'border-color': 'rgb(var(--fuse-accent-700) / <alpha-value>)',
        },
        '&:focus': {
          'box-shadow': `0 0 0 3px rgb(var(--fuse-accent-200) / 0.5)`,
        },
      },
      '.fuse-input': {
        'background-color': 'rgb(var(--fuse-bg-card) / <alpha-value>)',
        'color': 'rgb(var(--fuse-text-default) / <alpha-value>)',
        'border-color': 'rgb(var(--fuse-border) / <alpha-value>)',
        '&:focus': {
          'border-color': 'rgb(var(--fuse-primary-500) / <alpha-value>)',
          'box-shadow': `0 0 0 1px rgb(var(--fuse-primary-500) / 0.5)`,
        },
        '&::placeholder': {
          'color': 'rgb(var(--fuse-text-hint) / <alpha-value>)',
        },
      },
      '.fuse-nav-item': {
        'color': 'rgb(var(--fuse-text-secondary) / <alpha-value>)',
        'transition-property': 'background-color, color',
        'transition-duration': '150ms',
        '&:hover': {
          'background-color': 'rgb(var(--fuse-bg-hover) / <alpha-value>)',
          'color': 'rgb(var(--fuse-text-default) / <alpha-value>)',
        },
        '&.active': {
          'background-color': 'rgb(var(--fuse-primary-50) / <alpha-value>)',
          'color': 'rgb(var(--fuse-primary-600) / <alpha-value>)',
          'border-right': '3px solid rgb(var(--fuse-primary-500) / <alpha-value>)',
        },
      },
      '.fuse-scrollbar': {
        '&::-webkit-scrollbar': {
          'width': '8px',
          'height': '8px',
        },
        '&::-webkit-scrollbar-track': {
          'background': 'rgb(var(--fuse-bg-default) / <alpha-value>)',
        },
        '&::-webkit-scrollbar-thumb': {
          'background': 'rgb(var(--fuse-primary-300) / <alpha-value>)',
          'border-radius': '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          'background': 'rgb(var(--fuse-primary-400) / <alpha-value>)',
        },
      },
    });

    // Add accessibility utilities
    addUtilities({
      '.high-contrast': {
        'filter': 'contrast(1.5)',
      },
      '.reduce-motion': {
        'animation-duration': '0.01ms !important',
        'animation-iteration-count': '1 !important',
        'transition-duration': '0.01ms !important',
      },
      '.focus-visible': {
        '&:focus-visible': {
          'outline': '2px solid rgb(var(--fuse-primary-500) / <alpha-value>)',
          'outline-offset': '2px',
        },
      },
    });
  },
  {
    theme: {
      extend: {
        colors: {
          // Primary color palette
          primary: {
            50: 'rgb(var(--fuse-primary-50) / <alpha-value>)',
            100: 'rgb(var(--fuse-primary-100) / <alpha-value>)',
            200: 'rgb(var(--fuse-primary-200) / <alpha-value>)',
            300: 'rgb(var(--fuse-primary-300) / <alpha-value>)',
            400: 'rgb(var(--fuse-primary-400) / <alpha-value>)',
            500: 'rgb(var(--fuse-primary-500) / <alpha-value>)',
            600: 'rgb(var(--fuse-primary-600) / <alpha-value>)',
            700: 'rgb(var(--fuse-primary-700) / <alpha-value>)',
            800: 'rgb(var(--fuse-primary-800) / <alpha-value>)',
            900: 'rgb(var(--fuse-primary-900) / <alpha-value>)',
            DEFAULT: 'rgb(var(--fuse-primary-500) / <alpha-value>)',
          },
          // Accent color palette
          accent: {
            50: 'rgb(var(--fuse-accent-50) / <alpha-value>)',
            100: 'rgb(var(--fuse-accent-100) / <alpha-value>)',
            200: 'rgb(var(--fuse-accent-200) / <alpha-value>)',
            300: 'rgb(var(--fuse-accent-300) / <alpha-value>)',
            400: 'rgb(var(--fuse-accent-400) / <alpha-value>)',
            500: 'rgb(var(--fuse-accent-500) / <alpha-value>)',
            600: 'rgb(var(--fuse-accent-600) / <alpha-value>)',
            700: 'rgb(var(--fuse-accent-700) / <alpha-value>)',
            800: 'rgb(var(--fuse-accent-800) / <alpha-value>)',
            900: 'rgb(var(--fuse-accent-900) / <alpha-value>)',
            DEFAULT: 'rgb(var(--fuse-accent-500) / <alpha-value>)',
          },
          // Warn color palette
          warn: {
            50: 'rgb(var(--fuse-warn-50) / <alpha-value>)',
            100: 'rgb(var(--fuse-warn-100) / <alpha-value>)',
            200: 'rgb(var(--fuse-warn-200) / <alpha-value>)',
            300: 'rgb(var(--fuse-warn-300) / <alpha-value>)',
            400: 'rgb(var(--fuse-warn-400) / <alpha-value>)',
            500: 'rgb(var(--fuse-warn-500) / <alpha-value>)',
            600: 'rgb(var(--fuse-warn-600) / <alpha-value>)',
            700: 'rgb(var(--fuse-warn-700) / <alpha-value>)',
            800: 'rgb(var(--fuse-warn-800) / <alpha-value>)',
            900: 'rgb(var(--fuse-warn-900) / <alpha-value>)',
            DEFAULT: 'rgb(var(--fuse-warn-500) / <alpha-value>)',
          },
          // Background colors
          'bg-app-bar': 'rgb(var(--fuse-bg-app-bar) / <alpha-value>)',
          'bg-card': 'rgb(var(--fuse-bg-card) / <alpha-value>)',
          'bg-default': 'rgb(var(--fuse-bg-default) / <alpha-value>)',
          'bg-dialog': 'rgb(var(--fuse-bg-dialog) / <alpha-value>)',
          'bg-hover': 'rgb(var(--fuse-bg-hover) / <alpha-value>)',
          'bg-status-bar': 'rgb(var(--fuse-bg-status-bar) / <alpha-value>)',
          // Foreground colors
          'text-default': 'rgb(var(--fuse-text-default) / <alpha-value>)',
          'text-secondary': 'rgb(var(--fuse-text-secondary) / <alpha-value>)',
          'text-hint': 'rgb(var(--fuse-text-hint) / <alpha-value>)',
          'text-disabled': 'rgb(var(--fuse-text-disabled) / <alpha-value>)',
          border: 'rgb(var(--fuse-border) / <alpha-value>)',
          divider: 'rgb(var(--fuse-divider) / <alpha-value>)',
          icon: 'rgb(var(--fuse-icon) / <alpha-value>)',
        },
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
          mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        },
        animation: {
          'theme-fade': 'themeFade 0.3s ease-in-out',
          'theme-slide': 'themeSlide 0.3s ease-out',
          'theme-scale': 'themeScale 0.2s ease-out',
        },
        keyframes: {
          themeFade: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          themeSlide: {
            '0%': { transform: 'translateY(-10px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          themeScale: {
            '0%': { transform: 'scale(0.95)', opacity: '0' },
            '100%': { transform: 'scale(1)', opacity: '1' },
          },
        },
      },
    },
  }
);

/**
 * Generate CSS variables for a theme configuration
 */
function generateThemeVariables(themeConfig: any): Record<string, string> {
  const variables: Record<string, string> = {};

  // Primary colors
  Object.entries(themeConfig.primary).forEach(([shade, color]) => {
    if (shade === 'contrast') {
      Object.entries(color as any).forEach(([contrastShade, contrastColor]) => {
        variables[`--fuse-primary-contrast-${contrastShade}`] = hexToRgb(contrastColor as string);
      });
    } else {
      variables[`--fuse-primary-${shade}`] = hexToRgb(color as string);
    }
  });

  // Accent colors
  Object.entries(themeConfig.accent).forEach(([shade, color]) => {
    if (shade === 'contrast') {
      Object.entries(color as any).forEach(([contrastShade, contrastColor]) => {
        variables[`--fuse-accent-contrast-${contrastShade}`] = hexToRgb(contrastColor as string);
      });
    } else {
      variables[`--fuse-accent-${shade}`] = hexToRgb(color as string);
    }
  });

  // Warn colors
  Object.entries(themeConfig.warn).forEach(([shade, color]) => {
    if (shade === 'contrast') {
      Object.entries(color as any).forEach(([contrastShade, contrastColor]) => {
        variables[`--fuse-warn-contrast-${contrastShade}`] = hexToRgb(contrastColor as string);
      });
    } else {
      variables[`--fuse-warn-${shade}`] = hexToRgb(color as string);
    }
  });

  // Background colors
  Object.entries(themeConfig.background).forEach(([key, color]) => {
    variables[`--fuse-${key}`] = hexToRgb(color as string);
  });

  // Foreground colors
  Object.entries(themeConfig.foreground).forEach(([key, color]) => {
    variables[`--fuse-${key}`] = hexToRgb(color as string);
  });

  return variables;
}

/**
 * Convert hex color to RGB values for CSS custom properties
 */
function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `${r} ${g} ${b}`;
}

export default fuseThemePlugin;
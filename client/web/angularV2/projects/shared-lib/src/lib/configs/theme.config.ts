/**
 * Predefined theme configurations for the Fuse-inspired theming system
 */

import { ThemeConfig, ThemeVariant, BackgroundPalette, ForegroundPalette } from '../models/theme.model';
import { generatePalette } from '../utils/palette-generation.utils';

/**
 * Light theme background palette
 */
const LIGHT_BACKGROUND: BackgroundPalette = {
  'bg-app-bar': '#ffffff',
  'bg-card': '#ffffff',
  'bg-default': '#f8fafc',
  'bg-dialog': '#ffffff',
  'bg-hover': '#f1f5f9',
  'bg-status-bar': '#e2e8f0',
};

/**
 * Light theme foreground palette
 */
const LIGHT_FOREGROUND: ForegroundPalette = {
  'text-default': '#1e293b',
  'text-secondary': '#64748b',
  'text-hint': '#94a3b8',
  'text-disabled': '#cbd5e1',
  border: '#e2e8f0',
  divider: '#f1f5f9',
  icon: '#64748b',
  'mat-icon': '#64748b',
};

/**
 * Dark theme background palette
 */
const DARK_BACKGROUND: BackgroundPalette = {
  'bg-app-bar': '#1e293b',
  'bg-card': '#334155',
  'bg-default': '#0f172a',
  'bg-dialog': '#1e293b',
  'bg-hover': '#475569',
  'bg-status-bar': '#334155',
};

/**
 * Dark theme foreground palette
 */
const DARK_FOREGROUND: ForegroundPalette = {
  'text-default': '#f8fafc',
  'text-secondary': '#cbd5e1',
  'text-hint': '#94a3b8',
  'text-disabled': '#64748b',
  border: '#475569',
  divider: '#334155',
  icon: '#cbd5e1',
  'mat-icon': '#cbd5e1',
};

/**
 * Default Blue Theme
 */
export const DEFAULT_THEME: ThemeVariant = {
  light: {
    name: 'default-light',
    displayName: 'Default Blue Light',
    primary: generatePalette('#2196F3'),
    accent: generatePalette('#607D8B'),
    warn: generatePalette('#F44336'),
    background: LIGHT_BACKGROUND,
    foreground: LIGHT_FOREGROUND,
    isDark: false,
    isDefault: true,
  },
  dark: {
    name: 'default-dark',
    displayName: 'Default Blue Dark',
    primary: generatePalette('#42A5F5'),
    accent: generatePalette('#78909C'),
    warn: generatePalette('#EF5350'),
    background: DARK_BACKGROUND,
    foreground: DARK_FOREGROUND,
    isDark: true,
    isDefault: true,
  },
};

/**
 * Indigo Theme
 */
export const INDIGO_THEME: ThemeVariant = {
  light: {
    name: 'indigo-light',
    displayName: 'Indigo Light',
    primary: generatePalette('#3F51B5'),
    accent: generatePalette('#FF4081'),
    warn: generatePalette('#F44336'),
    background: LIGHT_BACKGROUND,
    foreground: LIGHT_FOREGROUND,
    isDark: false,
  },
  dark: {
    name: 'indigo-dark',
    displayName: 'Indigo Dark',
    primary: generatePalette('#5C6BC0'),
    accent: generatePalette('#FF5722'),
    warn: generatePalette('#EF5350'),
    background: DARK_BACKGROUND,
    foreground: DARK_FOREGROUND,
    isDark: true,
  },
};

/**
 * Teal Theme
 */
export const TEAL_THEME: ThemeVariant = {
  light: {
    name: 'teal-light',
    displayName: 'Teal Light',
    primary: generatePalette('#009688'),
    accent: generatePalette('#FFC107'),
    warn: generatePalette('#F44336'),
    background: LIGHT_BACKGROUND,
    foreground: LIGHT_FOREGROUND,
    isDark: false,
  },
  dark: {
    name: 'teal-dark',
    displayName: 'Teal Dark',
    primary: generatePalette('#26A69A'),
    accent: generatePalette('#FFD54F'),
    warn: generatePalette('#EF5350'),
    background: DARK_BACKGROUND,
    foreground: DARK_FOREGROUND,
    isDark: true,
  },
};

/**
 * Purple Theme
 */
export const PURPLE_THEME: ThemeVariant = {
  light: {
    name: 'purple-light',
    displayName: 'Purple Light',
    primary: generatePalette('#9C27B0'),
    accent: generatePalette('#4CAF50'),
    warn: generatePalette('#F44336'),
    background: LIGHT_BACKGROUND,
    foreground: LIGHT_FOREGROUND,
    isDark: false,
  },
  dark: {
    name: 'purple-dark',
    displayName: 'Purple Dark',
    primary: generatePalette('#BA68C8'),
    accent: generatePalette('#66BB6A'),
    warn: generatePalette('#EF5350'),
    background: DARK_BACKGROUND,
    foreground: DARK_FOREGROUND,
    isDark: true,
  },
};

/**
 * Amber Theme
 */
export const AMBER_THEME: ThemeVariant = {
  light: {
    name: 'amber-light',
    displayName: 'Amber Light',
    primary: generatePalette('#FF9800'),
    accent: generatePalette('#795548'),
    warn: generatePalette('#F44336'),
    background: LIGHT_BACKGROUND,
    foreground: LIGHT_FOREGROUND,
    isDark: false,
  },
  dark: {
    name: 'amber-dark',
    displayName: 'Amber Dark',
    primary: generatePalette('#FFB74D'),
    accent: generatePalette('#A1887F'),
    warn: generatePalette('#EF5350'),
    background: DARK_BACKGROUND,
    foreground: DARK_FOREGROUND,
    isDark: true,
  },
};

/**
 * Rose Theme
 */
export const ROSE_THEME: ThemeVariant = {
  light: {
    name: 'rose-light',
    displayName: 'Rose Light',
    primary: generatePalette('#E91E63'),
    accent: generatePalette('#00BCD4'),
    warn: generatePalette('#F44336'),
    background: LIGHT_BACKGROUND,
    foreground: LIGHT_FOREGROUND,
    isDark: false,
  },
  dark: {
    name: 'rose-dark',
    displayName: 'Rose Dark',
    primary: generatePalette('#F06292'),
    accent: generatePalette('#4DD0E1'),
    warn: generatePalette('#EF5350'),
    background: DARK_BACKGROUND,
    foreground: DARK_FOREGROUND,
    isDark: true,
  },
};

/**
 * Green Theme
 */
export const GREEN_THEME: ThemeVariant = {
  light: {
    name: 'green-light',
    displayName: 'Green Light',
    primary: generatePalette('#4CAF50'),
    accent: generatePalette('#FF5722'),
    warn: generatePalette('#F44336'),
    background: LIGHT_BACKGROUND,
    foreground: LIGHT_FOREGROUND,
    isDark: false,
  },
  dark: {
    name: 'green-dark',
    displayName: 'Green Dark',
    primary: generatePalette('#66BB6A'),
    accent: generatePalette('#FF7043'),
    warn: generatePalette('#EF5350'),
    background: DARK_BACKGROUND,
    foreground: DARK_FOREGROUND,
    isDark: true,
  },
};

/**
 * All predefined theme configurations
 */
export const THEME_CONFIGURATIONS: Record<string, ThemeVariant> = {
  default: DEFAULT_THEME,
  indigo: INDIGO_THEME,
  teal: TEAL_THEME,
  purple: PURPLE_THEME,
  amber: AMBER_THEME,
  rose: ROSE_THEME,
  green: GREEN_THEME,
};

/**
 * Get all available themes as a flat array
 */
export function getAllThemes(): ThemeConfig[] {
  const themes: ThemeConfig[] = [];
  
  Object.values(THEME_CONFIGURATIONS).forEach(variant => {
    themes.push(variant.light, variant.dark);
  });
  
  return themes;
}

/**
 * Get theme by name
 */
export function getThemeByName(name: string): ThemeConfig | null {
  const allThemes = getAllThemes();
  return allThemes.find(theme => theme.name === name) || null;
}

/**
 * Get theme variant by base name and mode
 */
export function getThemeVariant(baseName: string, isDark: boolean): ThemeConfig | null {
  const variant = THEME_CONFIGURATIONS[baseName];
  if (!variant) return null;
  
  return isDark ? variant.dark : variant.light;
}

/**
 * Get default theme based on system preference
 */
export function getDefaultTheme(prefersDark: boolean = false): ThemeConfig {
  return prefersDark ? DEFAULT_THEME.dark : DEFAULT_THEME.light;
}

/**
 * Get theme names for selection UI
 */
export function getThemeNames(): Array<{ name: string; displayName: string; hasVariants: boolean }> {
  return Object.entries(THEME_CONFIGURATIONS).map(([key, variant]) => ({
    name: key,
    displayName: variant.light.displayName.replace(' Light', ''),
    hasVariants: true,
  }));
}

/**
 * Validate theme configuration
 */
export function validateThemeConfig(theme: ThemeConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!theme.name) errors.push('Theme name is required');
  if (!theme.displayName) errors.push('Theme display name is required');
  if (!theme.primary) errors.push('Primary color palette is required');
  if (!theme.accent) errors.push('Accent color palette is required');
  if (!theme.warn) errors.push('Warn color palette is required');
  if (!theme.background) errors.push('Background palette is required');
  if (!theme.foreground) errors.push('Foreground palette is required');
  if (typeof theme.isDark !== 'boolean') errors.push('isDark must be a boolean');

  // Validate color palettes
  if (theme.primary && !validateColorPalette(theme.primary)) {
    errors.push('Invalid primary color palette');
  }
  if (theme.accent && !validateColorPalette(theme.accent)) {
    errors.push('Invalid accent color palette');
  }
  if (theme.warn && !validateColorPalette(theme.warn)) {
    errors.push('Invalid warn color palette');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate color palette structure
 */
function validateColorPalette(palette: any): boolean {
  const requiredShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'DEFAULT'];
  
  for (const shade of requiredShades) {
    if (!palette[shade] || typeof palette[shade] !== 'string') {
      return false;
    }
  }
  
  return palette.contrast && typeof palette.contrast === 'object';
}
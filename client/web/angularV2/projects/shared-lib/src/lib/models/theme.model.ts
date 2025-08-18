/**
 * Theme configuration interfaces and types for the Fuse-inspired theming system
 */

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  DEFAULT: string;
  contrast: ContrastPalette;
}

export interface ContrastPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  DEFAULT: string;
}

export interface BackgroundPalette {
  'bg-app-bar': string;
  'bg-card': string;
  'bg-default': string;
  'bg-dialog': string;
  'bg-hover': string;
  'bg-status-bar': string;
}

export interface ForegroundPalette {
  'text-default': string;
  'text-secondary': string;
  'text-hint': string;
  'text-disabled': string;
  border: string;
  divider: string;
  icon: string;
  'mat-icon': string;
}

export interface ThemeConfig {
  name: string;
  displayName: string;
  primary: ColorPalette;
  accent: ColorPalette;
  warn: ColorPalette;
  background: BackgroundPalette;
  foreground: ForegroundPalette;
  isDark: boolean;
  isDefault?: boolean;
}

export interface ThemeVariant {
  light: ThemeConfig;
  dark: ThemeConfig;
}

export interface ThemeMetadata {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  author?: string;
  version?: string;
  tags?: string[];
  createdAt?: number;
  updatedAt?: number;
  isCustom?: boolean;
  accessibility?: AccessibilityInfo;
}

export interface AccessibilityInfo {
  contrastRatio: number;
  wcagLevel: 'AA' | 'AAA';
  colorBlindnessFriendly: boolean;
  highContrast: boolean;
}

export interface ThemePreferences {
  selectedTheme: string;
  autoSwitchMode: 'system' | 'time' | 'manual';
  customThemes: Record<string, ThemeConfig>;
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    colorBlindnessType?: 'protanopia' | 'deuteranopia' | 'tritanopia';
  };
}

export type AutoSwitchMode = 'system' | 'time' | 'manual';

export type ThemeMode = 'light' | 'dark' | 'auto' | 'system' | 'time' | 'manual';

export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export interface PaletteGenerationOptions {
  baseColor?: string;
  mode?: 'lch' | 'hsl' | 'lab';
  correctLightness?: boolean;
  bezier?: boolean;
  padding?: number;
  samples?: number;
  gamma?: number;
}

export interface ThemeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  accessibility: AccessibilityInfo;
}

export interface CSSCustomProperties {
  [key: string]: string;
}

export interface ThemeState {
  currentTheme: ThemeConfig;
  availableThemes: Record<string, ThemeConfig>;
  preferences: ThemePreferences;
  isLoading: boolean;
  error: string | null;
}
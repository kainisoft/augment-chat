// Configuration types for the chat application

// Color mode (light/dark preference)
export type ColorMode = 'auto' | 'dark' | 'light';

// Color theme (visual color schemes)
export type ColorTheme = 'default' | 'blue' | 'teal' | 'rose' | 'purple' | 'amber' | 'green';

// Layout variants
export type LayoutVariant = 'default' | 'compact' | 'dense' | 'comfortable';

// Font sizes
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

// Sidebar modes
export type SidebarMode = 'side' | 'over' | 'push';

export interface ThemeOption {
  id: ColorTheme;
  name: string;
  primaryColor: string;
  accentColor: string;
}

export interface AccessibilityConfig {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: FontSize;
}

export interface ChatConfig {
  // Color preferences
  colorMode: ColorMode;
  colorTheme: ColorTheme;
  themes: ThemeOption[];

  // Layout preferences
  layout: LayoutVariant;
  sidebarMode: SidebarMode;
  compactMode: boolean;
  animations: boolean;

  // Accessibility
  accessibility: AccessibilityConfig;
}

export const DEFAULT_THEMES: ThemeOption[] = [
  {
    id: 'default',
    name: 'Default',
    primaryColor: '#3f51b5',
    accentColor: '#ff4081'
  },
  {
    id: 'blue',
    name: 'Blue',
    primaryColor: '#2196f3',
    accentColor: '#03dac6'
  },
  {
    id: 'teal',
    name: 'Teal',
    primaryColor: '#009688',
    accentColor: '#ff5722'
  },
  {
    id: 'rose',
    name: 'Rose',
    primaryColor: '#e91e63',
    accentColor: '#4caf50'
  },
  {
    id: 'purple',
    name: 'Purple',
    primaryColor: '#9c27b0',
    accentColor: '#ff9800'
  },
  {
    id: 'amber',
    name: 'Amber',
    primaryColor: '#ff9800',
    accentColor: '#9c27b0'
  },
  {
    id: 'green',
    name: 'Green',
    primaryColor: '#4caf50',
    accentColor: '#e91e63'
  }
];

export const DEFAULT_CONFIG: ChatConfig = {
  colorMode: 'light',
  colorTheme: 'default',
  themes: DEFAULT_THEMES,
  layout: 'default',
  sidebarMode: 'side',
  compactMode: false,
  animations: true,
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium'
  }
};

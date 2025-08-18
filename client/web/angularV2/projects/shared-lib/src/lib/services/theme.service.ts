/**
 * Theme service with signal-based state management for the Fuse-inspired theming system
 */

import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { 
  ThemeConfig, 
  ThemePreferences, 
  ThemeMode, 
  ThemeState,
  ThemeValidationResult 
} from '../models/theme.model';
import { 
  THEME_CONFIGURATIONS, 
  getDefaultTheme, 
  getThemeByName, 
  getAllThemes,
  validateThemeConfig 
} from '../configs/theme.config';
import { 
  generateCSSProperties, 
  applyCSSProperties, 
  applyThemeTransitions,
  removeThemeTransitions,
  injectCSSVariables 
} from '../utils/css-properties.utils';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Storage keys
  private readonly STORAGE_KEY = 'fuse-theme-preferences';
  private readonly CURRENT_THEME_KEY = 'fuse-current-theme';

  // Signal-based state
  private readonly _currentTheme = signal<ThemeConfig>(getDefaultTheme());
  private readonly _availableThemes = signal<Record<string, ThemeConfig>>(this.initializeAvailableThemes());
  private readonly _preferences = signal<ThemePreferences>(this.loadPreferences());
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly signals
  readonly currentTheme = this._currentTheme.asReadonly();
  readonly availableThemes = this._availableThemes.asReadonly();
  readonly preferences = this._preferences.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals
  readonly isDarkMode = computed(() => this._currentTheme().isDark);
  readonly themeName = computed(() => this._currentTheme().name);
  readonly themeDisplayName = computed(() => this._currentTheme().displayName);
  
  readonly availableThemesList = computed(() => 
    Object.values(this._availableThemes())
  );

  readonly themeState = computed<ThemeState>(() => ({
    currentTheme: this._currentTheme(),
    availableThemes: this._availableThemes(),
    preferences: this._preferences(),
    isLoading: this._isLoading(),
    error: this._error(),
  }));

  constructor() {
    if (this.isBrowser) {
      this.initializeThemeSystem();
      this.setupEffects();
    }
  }

  /**
   * Initialize the theme system
   */
  private initializeThemeSystem(): void {
    try {
      // Load saved theme or detect system preference
      const savedTheme = this.loadCurrentTheme();
      if (savedTheme) {
        this._currentTheme.set(savedTheme);
      } else {
        this.detectSystemTheme();
      }

      // Apply theme transitions
      applyThemeTransitions();

      // Apply initial theme
      this.applyTheme(this._currentTheme());
    } catch (error) {
      console.error('Error initializing theme system:', error);
      this._error.set('Failed to initialize theme system');
    }
  }

  /**
   * Setup reactive effects
   */
  private setupEffects(): void {
    // Effect to apply theme changes
    effect(() => {
      const theme = this._currentTheme();
      this.applyTheme(theme);
      this.saveCurrentTheme(theme);
    });

    // Effect to save preferences
    effect(() => {
      const preferences = this._preferences();
      this.savePreferences(preferences);
    });

    // Effect to handle auto theme switching
    effect(() => {
      const preferences = this._preferences();
      if (preferences.autoSwitchMode === 'system') {
        this.setupSystemThemeListener();
      }
    });
  }

  /**
   * Set the current theme
   */
  setTheme(themeNameOrConfig: string | ThemeConfig): void {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      let theme: ThemeConfig;

      if (typeof themeNameOrConfig === 'string') {
        const foundTheme = getThemeByName(themeNameOrConfig) || 
                          this._availableThemes()[themeNameOrConfig];
        
        if (!foundTheme) {
          throw new Error(`Theme '${themeNameOrConfig}' not found`);
        }
        theme = foundTheme;
      } else {
        // Validate custom theme
        const validation = this.validateTheme(themeNameOrConfig);
        if (!validation.isValid) {
          throw new Error(`Invalid theme configuration: ${validation.errors.join(', ')}`);
        }
        theme = themeNameOrConfig;
      }

      this._currentTheme.set(theme);
    } catch (error) {
      console.error('Error setting theme:', error);
      this._error.set(error instanceof Error ? error.message : 'Failed to set theme');
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Toggle between light and dark mode
   */
  toggleDarkMode(): void {
    const currentTheme = this._currentTheme();
    const baseName = currentTheme.name.replace(/-light|-dark$/, '');
    const targetMode = currentTheme.isDark ? 'light' : 'dark';
    const targetThemeName = `${baseName}-${targetMode}`;
    
    this.setTheme(targetThemeName);
  }

  /**
   * Set theme mode (light/dark/auto)
   */
  setThemeMode(mode: ThemeMode): void {
    if (mode === 'system' || mode === 'time' || mode === 'manual') {
      const preferences = { ...this._preferences(), autoSwitchMode: mode };
      this._preferences.set(preferences);

      if (mode === 'system') {
        this.detectSystemTheme();
      }
    } else if (mode === 'light' || mode === 'dark') {
      const currentTheme = this._currentTheme();
      const baseName = currentTheme.name.replace(/-light|-dark$/, '');
      const targetThemeName = `${baseName}-${mode}`;
      this.setTheme(targetThemeName);
    }
  }

  /**
   * Add a custom theme
   */
  addCustomTheme(theme: ThemeConfig): void {
    try {
      const validation = this.validateTheme(theme);
      if (!validation.isValid) {
        throw new Error(`Invalid theme: ${validation.errors.join(', ')}`);
      }

      const availableThemes = { ...this._availableThemes() };
      availableThemes[theme.name] = theme;
      this._availableThemes.set(availableThemes);

      // Update preferences with custom theme
      const preferences = { ...this._preferences() };
      preferences.customThemes = { ...preferences.customThemes, [theme.name]: theme };
      this._preferences.set(preferences);
    } catch (error) {
      console.error('Error adding custom theme:', error);
      this._error.set(error instanceof Error ? error.message : 'Failed to add custom theme');
    }
  }

  /**
   * Remove a custom theme
   */
  removeCustomTheme(themeName: string): void {
    try {
      const availableThemes = { ...this._availableThemes() };
      delete availableThemes[themeName];
      this._availableThemes.set(availableThemes);

      const preferences = { ...this._preferences() };
      delete preferences.customThemes[themeName];
      this._preferences.set(preferences);

      // Switch to default theme if current theme was removed
      if (this._currentTheme().name === themeName) {
        this.setTheme(getDefaultTheme());
      }
    } catch (error) {
      console.error('Error removing custom theme:', error);
      this._error.set(error instanceof Error ? error.message : 'Failed to remove custom theme');
    }
  }

  /**
   * Validate theme configuration
   */
  validateTheme(theme: ThemeConfig): ThemeValidationResult {
    const baseValidation = validateThemeConfig(theme);
    
    // Additional accessibility validation
    const accessibility = {
      contrastRatio: 4.5, // TODO: Calculate actual contrast ratio
      wcagLevel: 'AA' as const,
      colorBlindnessFriendly: true, // TODO: Implement color blindness check
      highContrast: false, // TODO: Implement high contrast detection
    };

    return {
      ...baseValidation,
      warnings: [],
      accessibility,
    };
  }

  /**
   * Reset to default theme
   */
  resetToDefault(): void {
    this.setTheme(getDefaultTheme());
    this._preferences.set(this.getDefaultPreferences());
  }

  /**
   * Get theme by name
   */
  getTheme(name: string): ThemeConfig | null {
    return this._availableThemes()[name] || null;
  }

  /**
   * Check if theme exists
   */
  hasTheme(name: string): boolean {
    return name in this._availableThemes();
  }

  /**
   * Apply theme to the document
   */
  private applyTheme(theme: ThemeConfig): void {
    if (!this.isBrowser) return;

    try {
      // Generate CSS custom properties
      const cssProperties = generateCSSProperties(theme);
      
      // Apply properties to document root
      applyCSSProperties(cssProperties);
      
      // Update document class for dark mode
      document.documentElement.classList.toggle('dark', theme.isDark);
      document.documentElement.classList.toggle('light', !theme.isDark);
      
      // Set theme name as data attribute
      document.documentElement.setAttribute('data-theme', theme.name);
      
      // Inject CSS variables for better performance
      injectCSSVariables(cssProperties);
    } catch (error) {
      console.error('Error applying theme:', error);
      this._error.set('Failed to apply theme');
    }
  }

  /**
   * Detect system theme preference
   */
  private detectSystemTheme(): void {
    if (!this.isBrowser) return;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = getDefaultTheme(prefersDark);
    this._currentTheme.set(defaultTheme);
  }

  /**
   * Setup system theme change listener
   */
  private setupSystemThemeListener(): void {
    if (!this.isBrowser) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (this._preferences().autoSwitchMode === 'system') {
        const defaultTheme = getDefaultTheme(e.matches);
        this._currentTheme.set(defaultTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
  }

  /**
   * Initialize available themes
   */
  private initializeAvailableThemes(): Record<string, ThemeConfig> {
    const themes: Record<string, ThemeConfig> = {};
    
    // Add predefined themes
    getAllThemes().forEach(theme => {
      themes[theme.name] = theme;
    });

    // Add custom themes from preferences
    if (this.isBrowser) {
      const preferences = this.loadPreferences();
      Object.entries(preferences.customThemes).forEach(([name, theme]) => {
        themes[name] = theme;
      });
    }

    return themes;
  }

  /**
   * Load preferences from storage
   */
  private loadPreferences(): ThemePreferences {
    if (!this.isBrowser) return this.getDefaultPreferences();

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.getDefaultPreferences(), ...parsed };
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
    }

    return this.getDefaultPreferences();
  }

  /**
   * Save preferences to storage
   */
  private savePreferences(preferences: ThemePreferences): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  }

  /**
   * Load current theme from storage
   */
  private loadCurrentTheme(): ThemeConfig | null {
    if (!this.isBrowser) return null;

    try {
      const stored = localStorage.getItem(this.CURRENT_THEME_KEY);
      if (stored) {
        const themeName = JSON.parse(stored);
        return getThemeByName(themeName);
      }
    } catch (error) {
      console.error('Error loading current theme:', error);
    }

    return null;
  }

  /**
   * Save current theme to storage
   */
  private saveCurrentTheme(theme: ThemeConfig): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(this.CURRENT_THEME_KEY, JSON.stringify(theme.name));
    } catch (error) {
      console.error('Error saving current theme:', error);
    }
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): ThemePreferences {
    return {
      selectedTheme: 'default-light',
      autoSwitchMode: 'manual',
      customThemes: {},
      accessibility: {
        highContrast: false,
        reducedMotion: false,
      },
    };
  }
}